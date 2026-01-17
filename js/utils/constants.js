// Game Configuration Constants
const CONSTANTS = {
    // Colors
    COLORS: {
        BACKGROUND: '#0a0a2e',
        PLAYER: '#00ff88',
        PLAYER_THRUSTER: '#ff6600',
        BULLET: '#ffff00',
        BULLET_TRAIL: '#ff8800',
        ASTEROID: '#8B4513',
        ASTEROID_DARK: '#654321',
        SHIELD: '#00aaff',
        RAPID_FIRE: '#ff4444',
        BOMB: '#ff8800',
        STAR: '#ffffff',
        HUD_TEXT: '#ffffff',
        HEART: '#ff4444',
        HEART_EMPTY: '#333333'
    },

    // Player settings
    PLAYER: {
        SIZE: 20,
        SPEED: 300,
        FRICTION: 0.98,
        FIRE_RATE: 250, // ms between shots
        RAPID_FIRE_RATE: 80,
        INVINCIBILITY_TIME: 2000, // ms after taking damage
        SHIELD_DURATION: 8000,
        RAPID_FIRE_DURATION: 6000
    },

    // Bullet settings
    BULLET: {
        SPEED: 500,
        RADIUS: 4,
        TRAIL_LENGTH: 5
    },

    // Asteroid settings
    ASTEROIDS: {
        SMALL: {
            name: 'small',
            radius: 20,
            health: 1,
            points: 100,
            speed: { min: 50, max: 100 },
            splits: null
        },
        MEDIUM: {
            name: 'medium',
            radius: 35,
            health: 2,
            points: 200,
            speed: { min: 40, max: 80 },
            splits: { type: 'SMALL', count: 2 }
        },
        LARGE: {
            name: 'large',
            radius: 50,
            health: 3,
            points: 300,
            speed: { min: 30, max: 60 },
            splits: { type: 'MEDIUM', count: 2 }
        },
        HUGE: {
            name: 'huge',
            radius: 70,
            health: 5,
            points: 500,
            speed: { min: 20, max: 40 },
            splits: { type: 'LARGE', count: 3 }
        }
    },

    // Power-up settings
    POWERUPS: {
        SPAWN_CHANCE: 0.15, // 15% chance when asteroid destroyed
        LIFETIME: 10000, // ms before disappearing
        RADIUS: 15,
        TYPES: {
            SHIELD: { color: '#00aaff', name: 'shield' },
            RAPID_FIRE: { color: '#ff4444', name: 'rapidFire' },
            BOMB: { color: '#ff8800', name: 'bomb' }
        }
    },

    // Level settings
    LEVELS: {
        BASE_SPAWN_INTERVAL: 3000, // ms
        SPAWN_DECREASE_PER_LEVEL: 200,
        MIN_SPAWN_INTERVAL: 800,
        ASTEROIDS_TO_CLEAR: 25, // Base asteroids to destroy per level
        ASTEROIDS_INCREASE: 10 // Additional asteroids per level
    },

    // Particle settings
    PARTICLES: {
        EXPLOSION_COUNT: 15,
        HIT_COUNT: 5,
        LIFETIME: { min: 500, max: 1000 }
    },

    // Game settings
    GAME: {
        STARTING_LIVES: 3,
        MAX_LIVES: 5
    }
};
