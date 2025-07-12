class BorderParticles {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'border-particles';
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.particles = [];
        this.numParticles = 4; // One for each corner initially
        this.trailLength = 35; // Length of trail in pixels
        this.particleSize = 4; // Size of particles
        
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.perimeter = 2 * (this.width + this.height);
    }
    
    init() {
        this.particles = [];
        // Create particles evenly spaced along the perimeter
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push({
                position: (i / this.numParticles) * this.perimeter,
                trail: [],
                speed: 1 + Math.random() * 0.5, // Random speed variation
            });
        }
    }
    
    getCoordinates(position) {
        position = position % this.perimeter;
        if (position < 0) position += this.perimeter;
        
        if (position < this.width) {
            return { x: position, y: 0 }; // Top edge
        }
        position -= this.width;
        
        if (position < this.height) {
            return { x: this.width, y: position }; // Right edge
        }
        position -= this.height;
        
        if (position < this.width) {
            return { x: this.width - position, y: this.height }; // Bottom edge
        }
        position -= this.width;
        
        return { x: 0, y: this.height - position }; // Left edge
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Update and draw particles
        this.particles.forEach(particle => {
            // Update position
            particle.position = (particle.position + particle.speed) % this.perimeter;
            const pos = this.getCoordinates(particle.position);
            
            // Update trail
            particle.trail.unshift({ x: pos.x, y: pos.y });
            if (particle.trail.length > this.trailLength) {
                particle.trail.pop();
            }
            
            // Draw trail
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y);
            particle.trail.forEach((point, index) => {
                const alpha = 1 - (index / this.trailLength);
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
                this.ctx.lineWidth = 3;
                this.ctx.lineTo(point.x, point.y);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(point.x, point.y);
            });
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, this.particleSize, 0, Math.PI * 2);
            this.ctx.fillStyle = 'white';
            this.ctx.fill();
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BorderParticles();
});
