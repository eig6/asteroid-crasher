class LevelManager {
    constructor() {
        this.level = 1;
        this.asteroidsDestroyed = 0;
        this.asteroidsRequired = this.getAsteroidsRequired();
        this.levelTransitioning = false;
        this.transitionTimer = 0;
        this.transitionDuration = 2000; // 2 seconds for level transition
    }

    reset() {
        this.level = 1;
        this.asteroidsDestroyed = 0;
        this.asteroidsRequired = this.getAsteroidsRequired();
        this.levelTransitioning = false;
        this.transitionTimer = 0;
    }

    getAsteroidsRequired() {
        return CONSTANTS.LEVELS.ASTEROIDS_TO_CLEAR +
               (this.level - 1) * CONSTANTS.LEVELS.ASTEROIDS_INCREASE;
    }

    getSpawnInterval() {
        const interval = CONSTANTS.LEVELS.BASE_SPAWN_INTERVAL -
                        (this.level - 1) * CONSTANTS.LEVELS.SPAWN_DECREASE_PER_LEVEL;
        return Math.max(CONSTANTS.LEVELS.MIN_SPAWN_INTERVAL, interval);
    }

    addDestroyedAsteroid(points = 0) {
        if (this.levelTransitioning) return false;

        this.asteroidsDestroyed++;

        // Check for level up
        if (this.asteroidsDestroyed >= this.asteroidsRequired) {
            return true; // Signal level up
        }

        return false;
    }

    startLevelTransition() {
        this.levelTransitioning = true;
        this.transitionTimer = 0;
    }

    updateTransition(deltaTime) {
        if (!this.levelTransitioning) return false;

        this.transitionTimer += deltaTime;

        if (this.transitionTimer >= this.transitionDuration) {
            this.levelTransitioning = false;
            this.level++;
            this.asteroidsDestroyed = 0;
            this.asteroidsRequired = this.getAsteroidsRequired();
            return true; // Transition complete
        }

        return false;
    }

    getProgress() {
        return this.asteroidsDestroyed / this.asteroidsRequired;
    }

    getLevelInfo() {
        return {
            level: this.level,
            destroyed: this.asteroidsDestroyed,
            required: this.asteroidsRequired,
            progress: this.getProgress(),
            transitioning: this.levelTransitioning
        };
    }

    getDifficultyMultiplier() {
        // Returns a multiplier for difficulty scaling
        return 1 + (this.level - 1) * 0.2;
    }
}
