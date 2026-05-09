class ContactSignatureOrbs {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.numParticles = options.numParticles || 800;
        this.isMorphing = false;
        this.colors = options.colors || ['#10b981', '#25d366', '#3b82f6', '#06b6d4', '#8b5cf6'];

        // Configuration for positioning
        this.anchorX = options.anchorX !== undefined ? options.anchorX : 0.8;
        this.anchorY = options.anchorY !== undefined ? options.anchorY : 0.65;
        this.scaleMultiplier = options.scaleMultiplier || 0.40;
        this.interval = options.interval || 15000;
        this.svgList = options.svgs || [
            // Mail icon
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
            // Phone icon
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
            // WhatsApp icon
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9.1 8.2l.4-1.2c.2-.5.8-.7 1.3-.4l2.1 1.2c.4.2.5.8.3 1.2l-1 1.6c-.3.4-.3 1-.1 1.5 1 2 2.6 3.6 4.6 4.6.5.2 1.1.2 1.5-.1l1.6-1c.4-.2 1-.1 1.2.3l1.2 2.1c.3.5.1 1.1-.4 1.3l-1.2.4c-1.3.4-2.8.2-4.1-.4-2.7-1.3-4.9-3.5-6.2-6.2-.6-1.3-.8-2.8-.4-4.1z"/></svg>`
        ];
        this.currentShapeIndex = 0;
        this.shapeCache = [];
        this.isActive = false;
        this.init();
        this.setupObserver();
        window.addEventListener('resize', () => {
            this.resize();
            if (!this.isMorphing) this.createRandomParticles();
        });
    }

    async init() {
        this.resize();
        this.createRandomParticles();
        for (let svgString of this.svgList) {
            this.shapeCache.push(await this.parseSVGString(svgString));
        }
        this.animate();
        setTimeout(() => this.cycleShape(), 220);
        setInterval(() => {
            if (this.isActive) this.cycleShape();
        }, this.interval);
    }

    setupObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isActive = entry.isIntersecting && !document.hidden;
            });
        }, { threshold: 0.1 });
        observer.observe(this.canvas);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.isActive = false;
            } else {
                const rect = this.canvas.getBoundingClientRect();
                this.isActive = rect.bottom > 0 && rect.top < window.innerHeight;
            }
        });
    }

    resize() {
        if (!this.canvas.parentElement) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.renderWidth = rect.width;
        this.renderHeight = rect.height;
        this.centerX = this.renderWidth * this.anchorX;
        this.centerY = this.renderHeight * this.anchorY;
        this.drawScale = Math.min(this.renderWidth, this.renderHeight) * this.scaleMultiplier;
    }

    createRandomParticles() {
        this.particles = [];
        const isSmall = window.matchMedia('(max-width: 767px)').matches;
        const total = isSmall ? 420 : this.numParticles;
        for (let i = 0; i < total; i++) {
            const x = (Math.random() - 0.5) * 8;
            const y = (Math.random() - 0.5) * 8;
            const z = (Math.random() - 0.5) * 8;
            this.particles.push({
                x: 0,
                y: 0,
                z: 0,
                baseX: x,
                baseY: y,
                baseZ: z,
                morphX: 0,
                morphY: 0,
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
        const sSize = 220;
        shapeCanvas.width = sSize;
        shapeCanvas.height = sSize;
        let svgString = svgRaw.replace('<svg', `<svg xmlns="http://www.w3.org/2000/svg" width="${sSize}" height="${sSize}"`);
        svgString = svgString.replace(/currentColor/g, '#ffffff');
        const base64Svg = btoa(unescape(encodeURIComponent(svgString)));
        const url = 'data:image/svg+xml;base64,' + base64Svg;
        return new Promise((resolve) => {
            const img = new Image();
            const timeout = setTimeout(() => resolve([]), 450);
            img.onload = () => {
                clearTimeout(timeout);
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
            img.onerror = () => {
                clearTimeout(timeout);
                resolve([]);
            };
            img.src = url;
        });
    }

    cycleShape() {
        if (this.shapeCache.length === 0) return;
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
                    ease: 'expo.inOut',
                    delay: Math.random() * 0.2
                });
            });
            setTimeout(() => {
                this.morphToSphere();
            }, 10000);
        }
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
                ease: 'power2.out',
                delay: Math.random() * 0.1
            });
        });
    }

    animate() {
        if (!this.isActive) {
            requestAnimationFrame(this.animate.bind(this));
            return;
        }
        this.ctx.clearRect(0, 0, this.renderWidth, this.renderHeight);
        if (!this.isMorphing) {
            this.particles.forEach(p => {
                p.baseX += p.driftSpeedX;
                p.baseY += p.driftSpeedY;
                if (p.baseX > 4 || p.baseX < -4) p.driftSpeedX *= -1;
                if (p.baseY > 4 || p.baseY < -4) p.driftSpeedY *= -1;
            });
        }
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            const morphNoiseX = Math.sin(Date.now() * 0.0016 + p.angleOffset) * 0.012;
            const morphNoiseY = Math.cos(Date.now() * 0.0014 + p.angleOffset) * 0.012;
            const floatNoise = Math.sin(Date.now() * 0.001 + p.angleOffset) * 0.08;
            const cx = p.baseX * (1 - p.morphProgress) + p.morphX * p.morphProgress;
            const cy = p.baseY * (1 - p.morphProgress) + p.morphY * p.morphProgress;
            const currentX = cx * (1 + floatNoise * (1 - p.morphProgress)) + morphNoiseX * p.morphProgress;
            const currentY = cy * (1 + floatNoise * (1 - p.morphProgress)) + morphNoiseY * p.morphProgress;
            const finalX = this.centerX + currentX * this.drawScale;
            const finalY = this.centerY + currentY * this.drawScale;
            const finalSize = Math.max(0.5, p.size);
            this.ctx.globalAlpha = p.morphProgress * 0.6 + 0.4;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(finalX - finalSize / 2, finalY - finalSize / 2, finalSize, finalSize);
        }
        this.ctx.globalAlpha = 1;
        requestAnimationFrame(this.animate.bind(this));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('contact-signature-canvas')) {
        window.contactSignatureOrbs = new ContactSignatureOrbs('contact-signature-canvas');
    }
});
