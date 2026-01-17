class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;

        // Random direction and speed
        const angle = options.angle !== undefined ? options.angle : Math.random() * Math.PI * 2;
        const speed = options.speed || (Math.random() * 150 + 50);

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.radius = options.radius || (Math.random() * 3 + 1);
        this.color = options.color || CONSTANTS.COLORS.ASTEROID;
        this.lifetime = options.lifetime ||
            (Math.random() * (CONSTANTS.PARTICLES.LIFETIME.max - CONSTANTS.PARTICLES.LIFETIME.min) +
             CONSTANTS.PARTICLES.LIFETIME.min);
        this.age = 0;
        this.friction = options.friction || 0.98;
        this.gravity = options.gravity || 0;
    }

    update(deltaTime) {
        this.age += deltaTime;

        // Apply velocity
        this.x += this.vx * (deltaTime / 1000);
        this.y += this.vy * (deltaTime / 1000);

        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Apply gravity
        this.vy += this.gravity * (deltaTime / 1000);

        // Shrink over time
        const lifeRatio = 1 - (this.age / this.lifetime);
        this.currentRadius = this.radius * lifeRatio;
    }

    draw(ctx) {
        const alpha = 1 - (this.age / this.lifetime);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.5, this.currentRadius || this.radius), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.age >= this.lifetime;
    }

    // Static method to create explosion particles
    static createExplosion(x, y, color, count = CONSTANTS.PARTICLES.EXPLOSION_COUNT) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, {
                color: color,
                speed: Math.random() * 200 + 100,
                radius: Math.random() * 4 + 2
            }));
        }
        return particles;
    }

    // Static method to create hit particles
    static createHit(x, y, color, count = CONSTANTS.PARTICLES.HIT_COUNT) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, {
                color: color,
                speed: Math.random() * 100 + 50,
                radius: Math.random() * 2 + 1,
                lifetime: 300
            }));
        }
        return particles;
    }

    // Static method to create thruster particles
    static createThruster(x, y, angle) {
        return new Particle(x, y, {
            color: CONSTANTS.COLORS.PLAYER_THRUSTER,
            angle: angle + Math.PI + (Math.random() - 0.5) * 0.5,
            speed: Math.random() * 100 + 50,
            radius: Math.random() * 3 + 1,
            lifetime: 200
        });
    }
}
