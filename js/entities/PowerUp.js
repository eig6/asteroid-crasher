class PowerUp {
    constructor(x, y, type = null) {
        this.x = x;
        this.y = y;
        this.radius = CONSTANTS.POWERUPS.RADIUS;

        // Random type if not specified
        if (type === null) {
            const types = Object.keys(CONSTANTS.POWERUPS.TYPES);
            type = types[Math.floor(Math.random() * types.length)];
        }

        this.type = type;
        this.typeConfig = CONSTANTS.POWERUPS.TYPES[type];
        this.color = this.typeConfig.color;
        this.name = this.typeConfig.name;

        // Floating animation
        this.baseY = y;
        this.floatOffset = 0;
        this.floatSpeed = 3;

        // Lifetime
        this.lifetime = CONSTANTS.POWERUPS.LIFETIME;
        this.age = 0;

        // Rotation for visual effect
        this.rotation = 0;

        // Pulse effect
        this.pulse = 0;

        this.alive = true;
    }

    update(deltaTime) {
        this.age += deltaTime;

        // Float up and down
        this.floatOffset = Math.sin(this.age / 1000 * this.floatSpeed) * 5;
        this.y = this.baseY + this.floatOffset;

        // Rotate
        this.rotation += deltaTime / 1000 * 2;

        // Pulse effect
        this.pulse = Math.sin(this.age / 1000 * 5) * 0.2 + 1;

        // Check lifetime (start flashing near end)
        if (this.age >= this.lifetime) {
            this.alive = false;
        }
    }

    draw(ctx) {
        // Calculate alpha for fading out near end of lifetime
        let alpha = 1;
        const flashStart = this.lifetime - 3000;
        if (this.age > flashStart) {
            // Flash effect
            alpha = Math.sin((this.age - flashStart) / 100 * Math.PI) * 0.5 + 0.5;
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw outer glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 2 * this.pulse);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color + '88');
        gradient.addColorStop(1, this.color + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 2 * this.pulse, 0, Math.PI * 2);
        ctx.fill();

        // Draw main circle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw icon based on type
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        switch (this.type) {
            case 'SHIELD':
                this.drawShieldIcon(ctx);
                break;
            case 'RAPID_FIRE':
                this.drawRapidFireIcon(ctx);
                break;
            case 'BOMB':
                this.drawBombIcon(ctx);
                break;
        }

        ctx.restore();
    }

    drawShieldIcon(ctx) {
        // Draw shield shape
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(7, -4);
        ctx.lineTo(7, 3);
        ctx.lineTo(0, 8);
        ctx.lineTo(-7, 3);
        ctx.lineTo(-7, -4);
        ctx.closePath();
        ctx.stroke();
    }

    drawRapidFireIcon(ctx) {
        // Draw three bullets
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 4, -6);
            ctx.lineTo(i * 4, 6);
            ctx.stroke();

            // Arrow heads
            ctx.beginPath();
            ctx.moveTo(i * 4, -6);
            ctx.lineTo(i * 4 - 2, -2);
            ctx.moveTo(i * 4, -6);
            ctx.lineTo(i * 4 + 2, -2);
            ctx.stroke();
        }
    }

    drawBombIcon(ctx) {
        // Draw bomb circle
        ctx.beginPath();
        ctx.arc(0, 2, 6, 0, Math.PI * 2);
        ctx.stroke();

        // Draw fuse
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(0, -8);
        ctx.stroke();

        // Draw spark
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(0, -9, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}
