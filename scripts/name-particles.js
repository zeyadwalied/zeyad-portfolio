/**
 * High-Performance Particle Name Animation (Network Concept)
 */

class Particle {
    constructor(x, y, color) {
        this.x = x + (Math.random() - 0.5) * 60; 
        this.y = y + (Math.random() - 0.5) * 60;
        this.baseX = x;
        this.baseY = y;
        this.color = color;
        this.size = Math.random() * 1.5 + 1;
        this.friction = 0.85;
        this.ease = 0.05;
        this.vx = 0;
        this.vy = 0;
    }

    update(mouse) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * 7;
        let directionY = forceDirectionY * force * 7;

        // Repel from mouse with optimized force
        if (distance < mouse.radius) {
            this.vx -= directionX * 1.2; 
            this.vy -= directionY * 1.2;
            this.size = Math.random() * 2 + 1.5; 
        } else {
            this.size = Math.max(this.size * 0.98, 1.2); 
        }

        // Return to base position
        this.vx += (this.baseX - this.x) * this.ease;
        this.vy += (this.baseY - this.y) * this.ease;
        
        this.vx *= this.friction;
        this.vy *= this.friction;

        this.x += this.vx;
        this.y += this.vy;
        
        return distance; // return distance to mouse for efficient line drawing
    }

    draw(ctx, mouse) {
        ctx.fillStyle = this.color;
        
        // Main particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Performance: Only draw glow for particles near the mouse
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        if (dx * dx + dy * dy < 2500) { // 50px radius
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
}

class NameAnimation {
    constructor() {
        this.canvas = document.getElementById('name-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.particles = [];
        this.text = "Zeyad Walid";
        
        this.mouse = { x: -1000, y: -1000, radius: 100 };
        this.isActive = false;
        this.animationFrameId = null;
        this.isHovering = false;
        this.canvasOpacity = 0; // Start hidden
        this.targetOpacity = 0;

        // Colors matching the SVG waves
        this.colors = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#fbbf24'];

        this.init();
        this.setupObservers();
        
        // Track mouse on the NAME CONTAINER (not canvas, since canvas has pointer-events:none)
        const nameContainer = this.canvas.parentElement;
        if (nameContainer) {
            nameContainer.addEventListener('mouseenter', () => {
                this.isHovering = true;
                this.targetOpacity = 1;
            });
            nameContainer.addEventListener('mouseleave', () => {
                this.isHovering = false;
                this.targetOpacity = 0;
                this.mouse.x = -1000;
                this.mouse.y = -1000;
            });
        }

        window.addEventListener('mousemove', (e) => {
            if (!this.isActive || !this.isHovering) return;
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        window.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });

        // Handle resize with debouncing for performance
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.init();
            }, 250);
        });
    }

    setupObservers() {
        // High performance: stop rendering when out of view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!this.isActive) {
                        this.isActive = true;
                        this.animate();
                    }
                } else {
                    this.isActive = false;
                    if (this.animationFrameId) {
                        cancelAnimationFrame(this.animationFrameId);
                        this.animationFrameId = null;
                    }
                }
            });
        }, { threshold: 0 });
        
        observer.observe(this.canvas);
    }

    init() {
        const container = this.canvas.parentElement;
        if (!container) return;

        const dpr = window.devicePixelRatio || 1;
        const visibleName = document.querySelector('.hero-name-text');
        
        // Get computed styles to match exactly
        let computedFont = "800 96px Inter, sans-serif";
        let textX = 0;
        let textY = 0;
        if (visibleName) {
            const style = window.getComputedStyle(visibleName);
            computedFont = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            // Get the exact position of the visible text relative to the container
            const containerRect = container.getBoundingClientRect();
            const nameRect = visibleName.getBoundingClientRect();
            textX = nameRect.left - containerRect.left;
            textY = nameRect.top - containerRect.top + nameRect.height / 2;
        }

        this.canvas.width = container.offsetWidth * dpr;
        this.canvas.height = container.offsetHeight * dpr;
        this.canvas.style.width = container.offsetWidth + 'px';
        this.canvas.style.height = container.offsetHeight + 'px';
        this.ctx.scale(dpr, dpr);
        
        const offscreen = document.createElement('canvas');
        const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
        offscreen.width = container.offsetWidth;
        offscreen.height = container.offsetHeight;
        
        offCtx.fillStyle = 'white';
        
        document.fonts.ready.then(() => {
            offCtx.font = computedFont;
            offCtx.textAlign = 'left';
            offCtx.textBaseline = 'middle';
            offCtx.fillText(this.text, textX, textY);
            
            const pixels = offCtx.getImageData(0, 0, offscreen.width, offscreen.height).data;
            this.particles = [];
            
            // Step size tuned for the font size
            const isMobile = window.innerWidth < 768;
            const step = isMobile ? 10 : 14; 
            
            for (let y = 0; y < offscreen.height; y += step) {
                for (let x = 0; x < offscreen.width; x += step) {
                    const index = (y * offscreen.width + x) * 4;
                    const alpha = pixels[index + 3];
                    
                    if (alpha > 128) {
                        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
                        this.particles.push(new Particle(x, y, color));
                    }
                }
            }
        });
    }

    animate() {
        if (!this.isActive) return;
        
        // Smooth opacity transition
        this.canvasOpacity += (this.targetOpacity - this.canvasOpacity) * 0.08;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = this.canvasOpacity;
        
        // Track particles near mouse for line drawing
        const activeParticles = [];

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            const distToMouse = p.update(this.mouse);
            p.draw(this.ctx, this.mouse);
            
            if (this.isHovering && distToMouse < this.mouse.radius * 1.5) {
                activeParticles.push(p);
            }
        }
        
        // Draw network lines ONLY when hovering and between active particles
        if (this.isHovering && activeParticles.length > 0) {
            this.ctx.lineWidth = 0.5;
            for (let i = 0; i < activeParticles.length; i++) {
                for (let j = i + 1; j < activeParticles.length; j++) {
                    const p1 = activeParticles[i];
                    const p2 = activeParticles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 40) {
                        this.ctx.beginPath();
                        this.ctx.strokeStyle = p1.color;
                        this.ctx.globalAlpha = this.canvasOpacity * (1 - (dist / 40));
                        this.ctx.moveTo(p1.x, p1.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.stroke();
                    }
                }
            }
        }
        this.ctx.globalAlpha = 1.0;

        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure styles are applied (fonts loaded)
    setTimeout(() => {
        new NameAnimation();
    }, 500);
});
