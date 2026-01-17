class SpawnManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.lastSpawn = 0;
        this.spawnInterval = CONSTANTS.LEVELS.BASE_SPAWN_INTERVAL;
    }

    update(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    setSpawnInterval(interval) {
        this.spawnInterval = Math.max(CONSTANTS.LEVELS.MIN_SPAWN_INTERVAL, interval);
    }

    resetSpawnTimer(currentTime) {
        this.lastSpawn = currentTime;
    }

    shouldSpawn(currentTime) {
        if (currentTime - this.lastSpawn >= this.spawnInterval) {
            this.lastSpawn = currentTime;
            return true;
        }
        return false;
    }

    // Get a spawn position at the edge of the screen
    getEdgeSpawnPosition(playerX, playerY, margin = 100) {
        // Choose a random edge: 0 = top, 1 = right, 2 = bottom, 3 = left
        const edge = Math.floor(Math.random() * 4);
        let x, y;

        switch (edge) {
            case 0: // Top
                x = Math.random() * this.canvasWidth;
                y = -50;
                break;
            case 1: // Right
                x = this.canvasWidth + 50;
                y = Math.random() * this.canvasHeight;
                break;
            case 2: // Bottom
                x = Math.random() * this.canvasWidth;
                y = this.canvasHeight + 50;
                break;
            case 3: // Left
                x = -50;
                y = Math.random() * this.canvasHeight;
                break;
        }

        // Make sure not to spawn too close to player
        const dx = x - playerX;
        const dy = y - playerY;
        const distToPlayer = Math.sqrt(dx * dx + dy * dy);

        if (distToPlayer < margin) {
            // Move spawn point away from player
            const angle = Math.atan2(dy, dx);
            x = playerX + Math.cos(angle) * margin;
            y = playerY + Math.sin(angle) * margin;
        }

        return { x, y };
    }

    // Spawn an asteroid with level-appropriate size
    spawnAsteroid(level, playerX, playerY) {
        const pos = this.getEdgeSpawnPosition(playerX, playerY);

        // Determine size based on level
        let sizeType = this.getAsteroidSizeForLevel(level);

        // Calculate angle toward center of screen (with some randomness)
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        const angle = Math.atan2(centerY - pos.y, centerX - pos.x) + (Math.random() - 0.5);

        return new Asteroid(pos.x, pos.y, sizeType, angle);
    }

    getAsteroidSizeForLevel(level) {
        // Level 1: mostly small, some medium
        // Level 2: small, medium, some large
        // Level 3+: all sizes including huge

        const roll = Math.random();

        if (level === 1) {
            if (roll < 0.7) return 'SMALL';
            return 'MEDIUM';
        } else if (level === 2) {
            if (roll < 0.4) return 'SMALL';
            if (roll < 0.8) return 'MEDIUM';
            return 'LARGE';
        } else if (level === 3) {
            if (roll < 0.2) return 'SMALL';
            if (roll < 0.5) return 'MEDIUM';
            if (roll < 0.85) return 'LARGE';
            return 'HUGE';
        } else {
            // Level 4+: more big asteroids
            if (roll < 0.1) return 'SMALL';
            if (roll < 0.3) return 'MEDIUM';
            if (roll < 0.7) return 'LARGE';
            return 'HUGE';
        }
    }

    // Spawn initial asteroids for a level
    spawnInitialAsteroids(count, level, playerX, playerY) {
        const asteroids = [];

        for (let i = 0; i < count; i++) {
            asteroids.push(this.spawnAsteroid(level, playerX, playerY));
        }

        return asteroids;
    }

    // Maybe spawn a power-up at asteroid destruction location
    maybeSpawnPowerUp(x, y) {
        if (Math.random() < CONSTANTS.POWERUPS.SPAWN_CHANCE) {
            return new PowerUp(x, y);
        }
        return null;
    }
}
