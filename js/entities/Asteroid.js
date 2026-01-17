class Asteroid {
    constructor(x, y, sizeType, angle = null) {
        this.x = x;
        this.y = y;

        // Get size configuration
        this.sizeConfig = CONSTANTS.ASTEROIDS[sizeType];
        this.sizeType = sizeType;
        this.radius = this.sizeConfig.radius;
        this.maxHealth = this.sizeConfig.health;
        this.health = this.maxHealth;
        this.points = this.sizeConfig.points;

        // Random velocity
        const speedRange = this.sizeConfig.speed;
        const speed = Math.random() * (speedRange.max - speedRange.min) + speedRange.min;
        const moveAngle = angle !== null ? angle : Math.random() * Math.PI * 2;

        this.vx = Math.cos(moveAngle) * speed;
        this.vy = Math.sin(moveAngle) * speed;

        // Rotation
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 2;

        // Generate procedural shape
        this.vertices = this.generateShape();

        this.alive = true;
        this.hitFlash = 0;
    }

    generateShape() {
        const vertices = [];
        const numVertices = 8 + Math.floor(Math.random() * 4);

        for (let i = 0; i < numVertices; i++) {
            const angle = (i / numVertices) * Math.PI * 2;
            // Randomize radius for rocky appearance
            const radiusVariation = 0.7 + Math.random() * 0.3;
            const r = this.radius * radiusVariation;

            vertices.push({
                x: Math.cos(angle) * r,
                y: Math.sin(angle) * r
            });
        }

        return vertices;
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        // Update position
        this.x += this.vx * (deltaTime / 1000);
        this.y += this.vy * (deltaTime / 1000);

        // Update rotation
        this.rotation += this.rotationSpeed * (deltaTime / 1000);

        // Screen wrapping
        if (this.x < -this.radius) this.x = canvasWidth + this.radius;
        if (this.x > canvasWidth + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = canvasHeight + this.radius;
        if (this.y > canvasHeight + this.radius) this.y = -this.radius;

        // Decrease hit flash
        if (this.hitFlash > 0) {
            this.hitFlash -= deltaTime;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw asteroid body
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);

        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();

        // Fill color (flash white when hit)
        if (this.hitFlash > 0) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = CONSTANTS.COLORS.ASTEROID;
        }
        ctx.fill();

        // Draw darker outline
        ctx.strokeStyle = CONSTANTS.COLORS.ASTEROID_DARK;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw some crater details
        this.drawCraters(ctx);

        ctx.restore();

        // Draw health bar for larger asteroids
        if (this.maxHealth > 1) {
            this.drawHealthBar(ctx);
        }
    }

    drawCraters(ctx) {
        ctx.fillStyle = CONSTANTS.COLORS.ASTEROID_DARK;

        // Draw 2-3 small craters
        const craterCount = Math.min(3, Math.floor(this.radius / 20));
        for (let i = 0; i < craterCount; i++) {
            const angle = (i / craterCount) * Math.PI * 2 + 0.5;
            const distance = this.radius * 0.4;
            const craterX = Math.cos(angle) * distance;
            const craterY = Math.sin(angle) * distance;
            const craterRadius = this.radius * 0.15;

            ctx.beginPath();
            ctx.arc(craterX, craterY, craterRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawHealthBar(ctx) {
        const barWidth = this.radius * 1.5;
        const barHeight = 4;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.radius - 10;

        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health
        const healthRatio = this.health / this.maxHealth;
        ctx.fillStyle = healthRatio > 0.5 ? '#00ff00' : healthRatio > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);
    }

    hit() {
        this.health--;
        this.hitFlash = 100;

        if (this.health <= 0) {
            this.alive = false;
        }

        return this.health <= 0;
    }

    split() {
        const splitConfig = this.sizeConfig.splits;
        if (!splitConfig) return [];

        const newAsteroids = [];
        for (let i = 0; i < splitConfig.count; i++) {
            // Spread out in different directions
            const spreadAngle = (i / splitConfig.count) * Math.PI * 2 + Math.random() * 0.5;
            const asteroid = new Asteroid(this.x, this.y, splitConfig.type, spreadAngle);

            // Give some initial velocity away from center
            asteroid.vx += Math.cos(spreadAngle) * 30;
            asteroid.vy += Math.sin(spreadAngle) * 30;

            newAsteroids.push(asteroid);
        }

        return newAsteroids;
    }
}
