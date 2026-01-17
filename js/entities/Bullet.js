class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.radius = CONSTANTS.BULLET.RADIUS;

        // Velocity based on angle
        this.vx = Math.cos(angle) * CONSTANTS.BULLET.SPEED;
        this.vy = Math.sin(angle) * CONSTANTS.BULLET.SPEED;

        // Trail positions for visual effect
        this.trail = [];
        this.maxTrailLength = CONSTANTS.BULLET.TRAIL_LENGTH;

        this.alive = true;
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        // Store previous position for trail
        this.trail.unshift({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }

        // Update position
        this.x += this.vx * (deltaTime / 1000);
        this.y += this.vy * (deltaTime / 1000);

        // Check if bullet is off screen
        if (this.x < -this.radius ||
            this.x > canvasWidth + this.radius ||
            this.y < -this.radius ||
            this.y > canvasHeight + this.radius) {
            this.alive = false;
        }
    }

    draw(ctx) {
        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = 1 - (i / this.trail.length);
            const radius = this.radius * (1 - i / this.trail.length * 0.5);

            ctx.save();
            ctx.globalAlpha = alpha * 0.5;
            ctx.fillStyle = CONSTANTS.COLORS.BULLET_TRAIL;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Draw main bullet
        ctx.fillStyle = CONSTANTS.COLORS.BULLET;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = CONSTANTS.COLORS.BULLET;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
