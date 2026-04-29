class HeroAutoMorph {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.numParticles = options.numParticles || 1000;
        this.rotation = { x: 0, y: 0 };
        this.isMorphing = false;
        this.colors = options.colors || ['#106db9ff', '#06b6d4', '#fbbf24', '#8b5cf6'];
        
        // Configuration for positioning
        this.anchorX = options.anchorX !== undefined ? options.anchorX : 0.55;
        this.anchorY = options.anchorY !== undefined ? options.anchorY : 0.75;
        this.scaleMultiplier = options.scaleMultiplier || 0.45;
        this.interval = options.interval || 15000;
        
        this.svgList = options.svgs || [
            // The word "GRAVITY"
            `<svg viewBox="0 0 200 80"><text font-family="'Inter', 'Segoe UI', Arial, sans-serif" font-weight="700" font-size="34" fill="currentColor" x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" letter-spacing="4">GRAVITY</text></svg>`,
            // Code Brackets
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
            // Server / Database
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
            // Terminal / Command
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,
            // The Letter Z (stylized custom path)
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5 h18 l-18 14 h18"></path></svg>`
        ];
        
        this.currentShapeIndex = 0;
        this.shapeCache = [];
        this.isActive = false;
        
        this.init();
        this.setupObserver();
        
        window.addEventListener('resize', () => {
            this.resize();
            if(!this.isMorphing) this.createRandomParticles();
        });
    }
    
    async init() {
        this.resize();
        this.createRandomParticles();
        
        // Pre-parse all SVGs to speed up transitions
        for (let svgString of this.svgList) {
            this.shapeCache.push(await this.parseSVGString(svgString));
        }
        
        this.animate();
        
        // Form the first shape instantly upon load!
        setTimeout(() => this.cycleShape(), 100);
        
        // Start cyclic morphing loop
        setInterval(() => {
            if (this.isActive) this.cycleShape();
        }, this.interval);
    }

    setupObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isActive = entry.isIntersecting;
            });
        }, { threshold: 0.1 });
        observer.observe(this.canvas);
    }
    
    resize() {
        if (!this.canvas.parentElement) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.centerX = this.canvas.width * this.anchorX; 
        this.centerY = this.canvas.height * this.anchorY;
        this.drawScale = Math.min(this.canvas.width, this.canvas.height) * this.scaleMultiplier;
    }
    
    createRandomParticles() {
        this.particles = [];
        for (let i = 0; i < this.numParticles; i++) {
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
                driftSpeedX: (Math.random() - 0.5) * 0.001,
                driftSpeedY: (Math.random() - 0.5) * 0.001
            });
        }
    }
    
    parseSVGString(svgRaw) {
        const shapeCanvas = document.createElement('canvas');
        const shapeCtx = shapeCanvas.getContext('2d', { willReadFrequently: true });
        const sSize = 200;
        shapeCanvas.width = sSize;
        shapeCanvas.height = sSize;
        
        let svgString = svgRaw.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg" width="'+sSize+'" height="'+sSize+'"');
        svgString = svgString.replace(/currentColor/g, '#ffffff');
        
        const base64Svg = btoa(unescape(encodeURIComponent(svgString)));
        const url = 'data:image/svg+xml;base64,' + base64Svg;
        
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                shapeCtx.clearRect(0, 0, sSize, sSize);
                shapeCtx.drawImage(img, 0, 0, sSize, sSize);
                
                const imageData = shapeCtx.getImageData(0, 0, sSize, sSize).data;
                const allValidPixels = [];
                
                for (let y = 0; y < sSize; y++) {
                    for (let x = 0; x < sSize; x++) {
                        const alpha = imageData[(y * sSize + x) * 4 + 3];
                        if (alpha > 40) {
                            allValidPixels.push({
                                x: (x / sSize) * 2 - 1,
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

    cycleShape() {
        if(this.shapeCache.length === 0) return;
        
        // Pick current shape
        const allPixels = this.shapeCache[this.currentShapeIndex];
        
        if (allPixels && allPixels.length > 0) {
            this.isMorphing = true;
            
            this.particles.forEach((p) => {
                const randomPixel = allPixels[Math.floor(Math.random() * allPixels.length)];
                p.morphX = randomPixel.x;
                p.morphY = randomPixel.y;
                
                gsap.killTweensOf(p);
                gsap.to(p, {
                    morphProgress: 1,
                    duration: 1.5 + Math.random() * 1.5,
                    ease: "expo.inOut",
                    delay: Math.random() * 0.2
                });
            });
            
            // Hold the shape for much longer before dissipating
            setTimeout(() => {
                this.morphToSphere();
            }, 10000);
        }
        
        // Progress index
        this.currentShapeIndex = (this.currentShapeIndex + 1) % this.svgList.length;
    }

    morphToSphere() {
        this.isMorphing = false;
        
        this.particles.forEach(p => {
            gsap.killTweensOf(p);
            p.baseX = (Math.random() - 0.5) * 8;
            p.baseY = (Math.random() - 0.5) * 8;
            p.baseZ = (Math.random() - 0.5) * 8;
            
            gsap.to(p, {
                morphProgress: 0,
                duration: 1.5 + Math.random() * 1.5,
                ease: "power2.out",
                delay: Math.random() * 0.1
            });
        });
    }
    
    rotate3D(x, y, z, rotX, rotY) {
        let y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
        let z1 = y * Math.sin(rotX) + z * Math.cos(rotX);
        let x2 = x * Math.cos(rotY) + z1 * Math.sin(rotY);
        let z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY);
        return { x: x2, y: y1, z: z2 };
    }
    
    animate() {
        if (!this.isActive) {
            requestAnimationFrame(this.animate.bind(this));
            return;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.rotation.x += 0.0005;
        this.rotation.y += 0.0008;
        
        if (!this.isMorphing) {
            this.particles.forEach(p => {
                p.baseX += p.driftSpeedX;
                p.baseY += p.driftSpeedY;
                if (p.baseX > 4 || p.baseX < -4) p.driftSpeedX *= -1;
                if (p.baseY > 4 || p.baseY < -4) p.driftSpeedY *= -1;
            });
        }
        
        const fov = this.drawScale * 10;
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            // Adjust noise: when morphed, use a tiny additive jitter so edge letters don't stretch
            const morphNoise = Math.sin(Date.now() * 0.002 + p.angleOffset) * 0.015; 
            const floatNoise = Math.sin(Date.now() * 0.001 + p.angleOffset) * 0.1;
            
            const cx = p.baseX * (1 - p.morphProgress) + p.morphX * p.morphProgress;
            const cy = p.baseY * (1 - p.morphProgress) + p.morphY * p.morphProgress;
            const cz = p.baseZ * (1 - p.morphProgress) + 0;
            
            // Using multiplicative noise for floating state, and additive for the morphed shape
            const currentX = cx * (1 + floatNoise * (1 - p.morphProgress)) + morphNoise * p.morphProgress;
            const currentY = cy * (1 + floatNoise * (1 - p.morphProgress)) + morphNoise * p.morphProgress;
            const currentZ = cz * (1 + floatNoise * (1 - p.morphProgress)) + morphNoise * p.morphProgress;
            
            const rotated = this.rotate3D(currentX, currentY, currentZ, this.rotation.x, this.rotation.y);
            const perspective = fov / (fov - rotated.z * this.drawScale);
            
            const finalX = this.centerX + rotated.x * this.drawScale * perspective;
            const finalY = this.centerY + rotated.y * this.drawScale * perspective;
            
            const finalSize = Math.max(0.5, p.size * perspective);
            this.ctx.globalAlpha = p.morphProgress * 0.6 + 0.4;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(finalX - finalSize/2, finalY - finalSize/2, finalSize, finalSize);
        }
        
        this.ctx.globalAlpha = 1.0;
        requestAnimationFrame(this.animate.bind(this));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('hero-auto-morph-canvas')) {
        window.heroMorpher = new HeroAutoMorph('hero-auto-morph-canvas');
    }
});
