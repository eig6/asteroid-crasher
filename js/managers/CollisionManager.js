class CollisionManager {
    constructor() {
        // No state needed, just utility methods
    }

    // Circle-circle collision detection
    checkCircleCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const combinedRadius = obj1.radius + obj2.radius;

        return distance < combinedRadius;
    }

    // Check if a point is inside a circle
    pointInCircle(px, py, circle) {
        const dx = px - circle.x;
        const dy = py - circle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < circle.radius;
    }

    // Get collision normal (direction from obj1 to obj2)
    getCollisionNormal(obj1, obj2) {
        const dx = obj2.x - obj1.x;
        const dy = obj2.y - obj1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) {
            return { x: 1, y: 0 }; // Default direction if overlapping exactly
        }

        return {
            x: dx / distance,
            y: dy / distance
        };
    }

    // Check all collisions between bullets and asteroids
    checkBulletAsteroidCollisions(bullets, asteroids) {
        const hits = [];

        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (!bullet.alive) continue;

            for (let j = asteroids.length - 1; j >= 0; j--) {
                const asteroid = asteroids[j];
                if (!asteroid.alive) continue;

                if (this.checkCircleCollision(bullet, asteroid)) {
                    hits.push({
                        bullet: bullet,
                        bulletIndex: i,
                        asteroid: asteroid,
                        asteroidIndex: j
                    });
                    bullet.alive = false;
                    break; // Bullet can only hit one asteroid
                }
            }
        }

        return hits;
    }

    // Check collisions between player and asteroids
    checkPlayerAsteroidCollisions(player, asteroids) {
        if (!player.alive) return [];

        const hits = [];

        for (let i = 0; i < asteroids.length; i++) {
            const asteroid = asteroids[i];
            if (!asteroid.alive) continue;

            if (this.checkCircleCollision(player, asteroid)) {
                hits.push({
                    asteroid: asteroid,
                    asteroidIndex: i
                });
            }
        }

        return hits;
    }

    // Check collisions between player and power-ups
    checkPlayerPowerUpCollisions(player, powerUps) {
        if (!player.alive) return [];

        const collected = [];

        for (let i = powerUps.length - 1; i >= 0; i--) {
            const powerUp = powerUps[i];
            if (!powerUp.alive) continue;

            if (this.checkCircleCollision(player, powerUp)) {
                collected.push({
                    powerUp: powerUp,
                    powerUpIndex: i
                });
                powerUp.alive = false;
            }
        }

        return collected;
    }
}
