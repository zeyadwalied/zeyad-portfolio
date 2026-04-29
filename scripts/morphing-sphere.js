class MorphingSphere {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.numParticles = 1000; // Optimal balance between density and performance
        this.rotation = { x: 0, y: 0 };
        this.isActive = false;
        
        this.colors = ['#10b981', '#06b6d4', '#3b82f6'];
        this.isMorphing = false;
        this.shapeCache = new Map();
        
        // Target tracking for localized morphing
        this.targetRect = { x: 0, y: 0, size: 0 };
        this.activeSvg = null;
        
        this.init();
        this.setupObserver();
        this.setupHoverListeners();
        
        window.addEventListener('resize', () => {
            this.resize();
            if (!this.isMorphing) this.createRandomParticles();
        });
        
        // Re-track target position if user scrolls while hovering
        window.addEventListener('scroll', () => {
            if (this.isMorphing && this.activeSvg) {
                this.updateTargetRect(this.activeSvg);
            }
        }, { passive: true });
    }
    
    init() {
        this.resize();
        this.createRandomParticles();
        this.animate();
    }
    
    resize() {
        if (!this.canvas.parentElement) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.drawScale = Math.min(this.canvas.width, this.canvas.height) * 0.4;
    }
    
    createRandomParticles() {
        this.particles = [];
        for (let i = 0; i < this.numParticles; i++) {
            // Wide spread for ambient state
            const x = (Math.random() - 0.5) * 8;
            const y = (Math.random() - 0.5) * 8;
            const z = (Math.random() - 0.5) * 8;
            
            this.particles.push({
                x: 0, y: 0, z: 0,
                baseX: x, baseY: y, baseZ: z, 
                morphX: 0, morphY: 0, 
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                size: Math.random() * 2 + 1,
                angleOffset: Math.random() * Math.PI * 2,
                morphProgress: 0,
                driftSpeedX: (Math.random() - 0.5) * 0.0015,
                driftSpeedY: (Math.random() - 0.5) * 0.0015
            });
        }
    }
    
    getShapeTargets(svgElement) {
        const shapeCanvas = document.createElement('canvas');
        const shapeCtx = shapeCanvas.getContext('2d', { willReadFrequently: true });
        const sSize = 100; // Smaller sample size is much faster and still provides enough pixels
        shapeCanvas.width = sSize;
        shapeCanvas.height = sSize;
        
        let svgString = new XMLSerializer().serializeToString(svgElement);
        if (!svgString.includes('xmlns=')) {
            svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        svgString = svgString.replace(/width="[^"]*"/, '').replace(/height="[^"]*"/, '');
        svgString = svgString.replace('<svg', `<svg width="${sSize}" height="${sSize}"`);
        svgString = svgString.replace(/currentColor/g, '#ffffff'); // Force opaque white
        
        const base64Svg = btoa(unescape(encodeURIComponent(svgString)));
        const url = 'data:image/svg+xml;base64,' + base64Svg;
        
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                shapeCtx.clearRect(0, 0, sSize, sSize);
                shapeCtx.drawImage(img, 0, 0, sSize, sSize);
                
                const imageData = shapeCtx.getImageData(0, 0, sSize, sSize).data;
                const allValidPixels = [];
                
                // Sample opaque pixels
                for (let y = 0; y < sSize; y++) {
                    for (let x = 0; x < sSize; x++) {
                        const alpha = imageData[(y * sSize + x) * 4 + 3];
                        if (alpha > 50) { // Solid enough
                            allValidPixels.push({
                                x: (x / sSize) * 2 - 1, // mapped -1 to 1
                                y: (y / sSize) * 2 - 1
                            });
                        }
                    }
                }
                resolve(allValidPixels);
            };
            const timeout = setTimeout(() => resolve([]), 300);
            img.onerror = () => { clearTimeout(timeout); resolve([]); };
            img.src = url;
        });
    }

    updateTargetRect(svgElement) {
        const svgRect = svgElement.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        const newX = (svgRect.left - canvasRect.left) + svgRect.width / 2;
        const newY = (svgRect.top - canvasRect.top) + svgRect.height / 2;
        const newSize = (Math.max(svgRect.width, svgRect.height) / 2) * 1.8;
        
        // If already morphing, elegantly fly the swarm to the new block
        if (this.isMorphing) {
            gsap.to(this.targetRect, {
                x: newX,
                y: newY,
                size: newSize,
                duration: 0.6,
                ease: "power2.out"
            });
        } else {
            this.targetRect.x = newX;
            this.targetRect.y = newY;
            this.targetRect.size = newSize;
        }
    }

    morphToShape(svgElement) {
        if (!svgElement) return;
        
        // Ensure the active SVG instantly restores if we are swapping directly!
        if (this.activeSvg && this.activeSvg !== svgElement) {
            gsap.to(this.activeSvg, { opacity: 1, duration: 0.2 });
        }
        
        this.isMorphing = true;
        this.activeSvg = svgElement;
        this.updateTargetRect(svgElement);
        
        // Hide the real SVG so our particles "replace" it
        gsap.to(svgElement, { opacity: 0, duration: 0.2 });
        
        const applyMorph = (allPixels) => {
            if (!allPixels || allPixels.length === 0) return;
            
            this.particles.forEach((p) => {
                const randomPixel = allPixels[Math.floor(Math.random() * allPixels.length)];
                
                gsap.killTweensOf(p);
                
                // If it's starting from the sphere, instantly set the destination layout 
                // so it flies directly there. If moving between cards, smoothly tween 
                // morphX/Y to reshuffle the particles without exploding.
                if (p.morphProgress < 0.1) {
                    p.morphX = randomPixel.x;
                    p.morphY = randomPixel.y;
                }
                
                gsap.to(p, {
                    morphX: randomPixel.x,
                    morphY: randomPixel.y,
                    morphProgress: 1,
                    duration: 0.6 + Math.random() * 0.4,
                    ease: "expo.out",
                    delay: Math.random() * 0.03
                });
            });
        };

        if (this.shapeCache.has(svgElement)) {
            applyMorph(this.shapeCache.get(svgElement));
        } else {
            this.getShapeTargets(svgElement).then(allPixels => {
                this.shapeCache.set(svgElement, allPixels);
                if (this.activeSvg === svgElement) { // ensure we didn't rapidly switch away
                    applyMorph(allPixels);
                }
            });
        }
    }

    morphToSphere() {
        this.isMorphing = false;
        if (this.activeSvg) {
            gsap.to(this.activeSvg, { opacity: 1, duration: 0.4 });
            this.activeSvg = null;
        }
        
        this.particles.forEach(p => {
            gsap.killTweensOf(p);
            // Re-scramble their base positions so they burst outwards
            p.baseX = (Math.random() - 0.5) * 8;
            p.baseY = (Math.random() - 0.5) * 8;
            p.baseZ = (Math.random() - 0.5) * 8;

            gsap.to(p, {
                morphProgress: 0,
                duration: 0.8 + Math.random() * 0.8,
                ease: "power2.out",
                delay: Math.random() * 0.1
            });
        });
    }

    setupHoverListeners() {
        const skillCards = document.querySelectorAll('.icon-skill-card');
        skillCards.forEach(card => {
            const svg = card.querySelector('svg');
            if (!svg) return;
            card.addEventListener('mouseenter', () => {
                clearTimeout(this.leaveTimeout);
                this.morphToShape(svg);
            });
            card.addEventListener('mouseleave', () => {
                this.leaveTimeout = setTimeout(() => this.morphToSphere(), 150);
            });
        });
    }
    
    setupObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isActive = entry.isIntersecting;
                if (this.isActive) this.animate();
            });
        }, { threshold: 0.05 });
        observer.observe(this.canvas);
    }
    
    rotate3D(x, y, z, rotX, rotY) {
        let y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
        let z1 = y * Math.sin(rotX) + z * Math.cos(rotX);
        let x2 = x * Math.cos(rotY) + z1 * Math.sin(rotY);
        let z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY);
        return { x: x2, y: y1, z: z2 };
    }
    
    animate() {
        if (!this.isActive) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.isMorphing) {
            this.rotation.x += 0.0003;
            this.rotation.y += 0.00045;
            this.particles.forEach(p => {
                p.baseX += p.driftSpeedX;
                p.baseY += p.driftSpeedY;
                if (p.baseX > 4 || p.baseX < -4) p.driftSpeedX *= -1;
                if (p.baseY > 4 || p.baseY < -4) p.driftSpeedY *= -1;
            });
        }
        
        const fov = this.drawScale * 10;
        
        // Fast rendering: No sorting array needed if we just draw them!
        // We use fillRect instead of arc for massive performance boost
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            // 1. Calculate Ambient 3D Screen Coordinate
            const noise = Math.sin(Date.now() * 0.002 + p.angleOffset) * 0.1;
            const cx = p.baseX * (1 + noise);
            const cy = p.baseY * (1 + noise);
            const cz = p.baseZ * (1 + noise);
            
            const rotated = this.rotate3D(cx, cy, cz, this.rotation.x, this.rotation.y);
            const perspective = fov / (fov - rotated.z * this.drawScale);
            
            const screenX_ambient = this.centerX + rotated.x * this.drawScale * perspective;
            const screenY_ambient = this.centerY + rotated.y * this.drawScale * perspective;
            
            // 2. Calculate Morphed local 2D Screen Coordinate (inside the hovered card)
            const targetScreenX = this.targetRect.x + p.morphX * this.targetRect.size;
            const targetScreenY = this.targetRect.y + p.morphY * this.targetRect.size;
            
            // 3. Interpolate final position based on morphProgress
            const finalX = screenX_ambient * (1 - p.morphProgress) + targetScreenX * p.morphProgress;
            const finalY = screenY_ambient * (1 - p.morphProgress) + targetScreenY * p.morphProgress;
            
            // Interpolate sizing and alpha
            const ambientAlpha = Math.min(1, Math.max(0.1, (rotated.z + 2.5) / 5));
            const targetAlpha = 0.9;
            const finalAlpha = ambientAlpha * (1 - p.morphProgress) + targetAlpha * p.morphProgress;
            
            const ambientSize = Math.max(0.1, p.size * perspective);
            const targetSize = 1.8; // Uniform size when forming the logo
            const finalSize = ambientSize * (1 - p.morphProgress) + targetSize * p.morphProgress;
            
            if (finalAlpha < 0.05) continue;
            
            // Highly optimized fast drawing
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = finalAlpha;
            this.ctx.fillRect(finalX - finalSize/2, finalY - finalSize/2, finalSize, finalSize);
        }
        
        this.ctx.globalAlpha = 1.0;
        requestAnimationFrame(this.animate.bind(this));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('bg-particles-canvas')) {
        window.skillsMorpher = new MorphingSphere('bg-particles-canvas');
    }
});
