/**
 * Particle Network Animation
 * Inspiration: https://github.com/JulianLaval/canvas-particle-network
*/

(function() {
    var ParticleNetworkAnimation, PNA;
    ParticleNetworkAnimation = PNA = function(element) {
        this.init(element);
    };

    PNA.prototype.init = function(element) {
        if (!element) {
            console.error('No element provided to ParticleNetworkAnimation');
            return;
        }
        this.$el = $(element);
        this.container = element;
        this.canvas = document.createElement('canvas');
        this.sizeCanvas();
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.particleNetwork = new ParticleNetwork(this);
        this.bindUiActions();
        return this;
    };

    PNA.prototype.bindUiActions = function() {
        $(window).on('resize', function() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.sizeCanvas();
            this.particleNetwork.createParticles();
        }.bind(this));
    };

    PNA.prototype.sizeCanvas = function() {
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
    };

    var Particle = function(parent, x, y) {
        this.network = parent;
        this.canvas = parent.canvas;
        this.ctx = parent.ctx;
        this.particleColor = returnRandomArrayitem(this.network.options.particleColors);
        this.radius = getLimitedRandom(1.5, 2.5);
        this.opacity = 0;
        this.x = x || Math.random() * this.canvas.width;
        this.y = y || Math.random() * this.canvas.height;
        this.velocity = {
            x: (Math.random() - 0.5) * parent.options.velocity,
            y: (Math.random() - 0.5) * parent.options.velocity
        };
    };

    Particle.prototype.update = function() {
        if (this.opacity < 1) {
            this.opacity += 0.01;
        } else {
            this.opacity = 1;
        }
        if (this.x > this.canvas.width + 100 || this.x < -100) {
            this.velocity.x = -this.velocity.x;
        }
        if (this.y > this.canvas.height + 100 || this.y < -100) {
            this.velocity.y = -this.velocity.y;
        }
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    };

    Particle.prototype.draw = function() {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.particleColor;
        this.ctx.globalAlpha = this.opacity;
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.ctx.fill();
    };

    var ParticleNetwork = function(parent) {
        this.options = {
            velocity: 0.7,  // Increased velocity for faster movement
            density: 15000,  // Reduced density for fewer particles
            maxParticles: 70,  // Maximum number of particles
            netLineDistance: 250,
            netLineColor: '#929292',
            particleColors: ['#aaa'],
            fps: 60  // Increased FPS for smoother animation
        };
        this.canvas = parent.canvas;
        this.ctx = parent.ctx;
        this.init();
    };

    ParticleNetwork.prototype.init = function() {
        this.createParticles(true);
        this.animationFrame = requestAnimationFrame(this.update.bind(this));
        this.bindUiActions();
    };

    ParticleNetwork.prototype.bindUiActions = function() {
        var me = this;
        $(window).on('resize', function() {
            me.createParticles();
        });
    };

    ParticleNetwork.prototype.createParticles = function(isInitial) {
        var me = this;
        this.particles = [];
        var quantity = Math.min(
            this.options.maxParticles,
            Math.floor(this.canvas.width * this.canvas.height / this.options.density)
        );

        if (isInitial) {
            var counter = 0;
            clearInterval(this.createIntervalId);
            this.createIntervalId = setInterval(function() {
                if (counter < quantity - 1) {
                    this.particles.push(new Particle(this));
                } else {
                    clearInterval(me.createIntervalId);
                }
                counter++;
            }.bind(this), 250);
        } else {
            // Create limited number of particles
            for (var i = 0; i < quantity; i++) {
                this.particles.push(new Particle(this));
            }
        }
    };

    ParticleNetwork.prototype.update = function() {
        if (!this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1;

        // Draw connections
        for (var i = 0; i < this.particles.length; i++) {
            for (var j = this.particles.length - 1; j > i; j--) {
                var distance, p1 = this.particles[i], p2 = this.particles[j];

                // Calculate distance between particles
                distance = Math.sqrt(
                    Math.pow(p1.x - p2.x, 2) +
                    Math.pow(p1.y - p2.y, 2)
                );

                if (distance > this.options.netLineDistance) {
                    continue;
                }

                this.ctx.beginPath();
                    this.ctx.strokeStyle = this.options.netLineColor;
                    this.ctx.globalAlpha = (this.options.netLineDistance - distance) / this.options.netLineDistance * p1.opacity * p2.opacity;
                    this.ctx.lineWidth = 0.7;
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }

            for (var i = 0; i < this.particles.length; i++) {
                this.particles[i].update();
                this.particles[i].draw();
            }

            if (this.options.velocity !== 0) {
                // Limit frame rate for better performance
                setTimeout(() => {
                    this.animationFrame = requestAnimationFrame(this.update.bind(this));
                }, 1000 / this.options.fps);
            } else {
                cancelAnimationFrame(this.animationFrame);
            }
    };

    var getLimitedRandom = function(min, max, roundToInteger) {
        var number = Math.random() * (max - min) + min;
        if (roundToInteger) {
            number = Math.round(number);
        }
        return number;
    };

    var returnRandomArrayitem = function(array) {
        return array[Math.floor(Math.random() * array.length)];
    };

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        new ParticleNetworkAnimation(document.querySelector('.particle-network-animation'));
    });
})();
