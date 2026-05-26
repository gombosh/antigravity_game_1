/**
 * Nature Guardians - Canvas Particle System
 * Manages rendering of dynamic rewards, stars, and celebratory confetti.
 */

class ParticleEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.active = false;
        this.resizeHandler = this.resize.bind(this);
    }

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', this.resizeHandler);
        this.loop();
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentNode.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    // Add general particles
    spawn(x, y, count, type = 'confetti') {
        if (!this.canvas) return;
        this.active = true;
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 8;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (type === 'confetti' ? 3 : 0), // Confetti shoots upwards
                color: this.getRandomColor(type),
                size: type === 'stars' ? 3 + Math.random() * 5 : 5 + Math.random() * 8,
                rotation: Math.random() * 360,
                rSpeed: (Math.random() - 0.5) * 10,
                alpha: 1,
                decay: 0.01 + Math.random() * 0.02,
                type: type, // 'confetti', 'stars', 'bubbles'
                gravity: type === 'bubbles' ? -0.05 : 0.15,
                shape: Math.random() > 0.5 ? 'rect' : 'circle'
            });
        }
    }

    getRandomColor(type) {
        if (type === 'stars') {
            const goldHues = [45, 50, 55, 60]; // Golden/Yellow
            return `hsla(${goldHues[Math.floor(Math.random() * goldHues.length)]}, 100%, 60%, 1)`;
        }
        if (type === 'bubbles') {
            return `hsla(${160 + Math.random() * 40}, 80%, 70%, 0.6)`; // Soft mint/teal
        }
        // General confetti: vibrant rainbow
        return `hsla(${Math.random() * 360}, 90%, 55%, 1)`;
    }

    // Trigger full screen confetti shower (e.g. on winning)
    shower() {
        if (!this.canvas) return;
        
        // Spawn from left and right edges shooting inward
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        let timer = 0;
        const interval = setInterval(() => {
            // Left burst
            this.spawn(width * 0.1, height * 0.8, 15, 'confetti');
            // Right burst
            this.spawn(width * 0.9, height * 0.8, 15, 'confetti');
            
            // Adjust velocities to push towards center
            const len = this.particles.length;
            for (let i = len - 30; i < len; i++) {
                if (this.particles[i]) {
                    const isLeft = this.particles[i].x < width / 2;
                    this.particles[i].vx = (isLeft ? 3 : -3) + (Math.random() - 0.5) * 5;
                    this.particles[i].vy = -8 - Math.random() * 6;
                }
            }
            
            timer++;
            if (timer > 6) clearInterval(interval);
        }, 200);
    }

    loop() {
        if (!this.canvas || !this.ctx) return;
        
        requestAnimationFrame(() => this.loop());
        
        if (!this.active) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.rSpeed;
            p.alpha -= p.decay;
            
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            
            if (p.type === 'stars') {
                this.drawStar(0, 0, 5, p.size, p.size / 2);
            } else if (p.type === 'bubbles') {
                this.ctx.strokeStyle = p.color.replace('0.6', '0.9');
                this.ctx.lineWidth = 1.5;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
            } else { // Confetti
                if (p.shape === 'rect') {
                    this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
            this.ctx.restore();
        }
        
        if (this.particles.length === 0) {
            this.active = false;
        }
    }

    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;
        
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
            
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }
        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
        this.ctx.fill();
    }
}

window.Particles = new ParticleEngine();
