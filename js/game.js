class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Set canvas to full window size
        this.resize();

        // Initialize managers
        this.input = new InputManager(canvas);
        this.collision = new CollisionManager();
        this.spawn = new SpawnManager(canvas.width, canvas.height);
        this.audio = new AudioManager();
        this.levelManager = new LevelManager();

        // Initialize UI
        this.hud = new HUD(canvas);
        this.effects = new Effects(canvas);
        this.menu = new Menu(canvas, this.input);
        this.touchControls = new TouchControls(canvas);

        // Game state
        this.state = 'menu'; // 'menu', 'playing', 'paused', 'gameOver', 'levelTransition'
        this.score = 0;
        this.lives = CONSTANTS.GAME.STARTING_LIVES;
        this.highScore = this.loadHighScore();

        // Game objects
        this.player = null;
        this.bullets = [];
        this.asteroids = [];
        this.powerUps = [];
        this.particles = [];

        // Bomb effect
        this.bombActive = false;
        this.bombX = 0;
        this.bombY = 0;
        this.bombProgress = 0;

        // Timing
        this.lastTime = 0;
        this.gameTime = 0;

        // Setup event listeners
        this.setupEventListeners();

        // Show start menu
        this.menu.showStartMenu();
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => this.resize());

        // Handle pause with ESC
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                if (this.state === 'playing') {
                    this.pause();
                } else if (this.state === 'paused') {
                    this.resume();
                }
            }

            // Space to start/restart from menus
            if (e.code === 'Space') {
                if (this.state === 'menu') {
                    this.startGame();
                } else if (this.state === 'gameOver') {
                    this.startGame();
                }
            }
        });

        // Handle mouse clicks for menus
        this.canvas.addEventListener('click', () => {
            this.audio.resume(); // Resume audio context on user interaction

            if (this.menu.isActive()) {
                const clickedButton = this.menu.checkClick();
                if (clickedButton) {
                    this.handleMenuClick(clickedButton);
                }
            }
        });

        // Handle touch for menus - use touchend for more reliable button activation
        this.menuTouchStartButton = null;

        this.canvas.addEventListener('touchstart', (e) => {
            this.audio.resume();

            if (this.menu.isActive()) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                this.input.mouseX = touch.clientX - rect.left;
                this.input.mouseY = touch.clientY - rect.top;

                // Remember which button the touch started on
                this.menuTouchStartButton = this.menu.checkClick();

                if (this.menuTouchStartButton) {
                    e.preventDefault();
                }
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            if (this.menu.isActive() && this.menuTouchStartButton) {
                const touch = e.changedTouches[0];
                const rect = this.canvas.getBoundingClientRect();
                this.input.mouseX = touch.clientX - rect.left;
                this.input.mouseY = touch.clientY - rect.top;

                // Check if touch ended on the same button it started on
                const endButton = this.menu.checkClick();
                if (endButton && endButton === this.menuTouchStartButton) {
                    this.handleMenuClick(endButton);
                }

                this.menuTouchStartButton = null;
                e.preventDefault();
            }
        }, { passive: false });
    }

    handleMenuClick(buttonId) {
        switch (buttonId) {
            case 'start':
            case 'restart':
                this.startGame();
                break;
            case 'resume':
                this.resume();
                break;
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Update managers with new size
        if (this.spawn) {
            this.spawn.update(this.canvas.width, this.canvas.height);
        }
        if (this.effects) {
            this.effects.updateStarfield(this.canvas.width, this.canvas.height);
        }
        if (this.menu) {
            this.menu.update();
        }
    }

    startGame() {
        this.state = 'playing';
        this.score = 0;
        this.lives = CONSTANTS.GAME.STARTING_LIVES;
        this.gameTime = 0;

        // Reset level manager
        this.levelManager.reset();

        // Create player at center
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);

        // Clear all objects
        this.bullets = [];
        this.asteroids = [];
        this.powerUps = [];
        this.particles = [];

        // Reset bomb effect
        this.bombActive = false;

        // Update spawn interval for level 1
        this.spawn.setSpawnInterval(this.levelManager.getSpawnInterval());
        this.spawn.resetSpawnTimer(0);

        // Spawn initial asteroids
        const initialAsteroids = this.spawn.spawnInitialAsteroids(
            3,
            this.levelManager.level,
            this.player.x,
            this.player.y
        );
        this.asteroids.push(...initialAsteroids);

        // Hide menu
        this.menu.hide();

        // Activate touch controls
        this.touchControls.setActive(true);
    }

    pause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.menu.showPauseMenu();
            this.touchControls.setActive(false);
        }
    }

    resume() {
        if (this.state === 'paused') {
            this.state = 'playing';
            this.menu.hide();
            this.touchControls.setActive(true);
        }
    }

    gameOver() {
        this.state = 'gameOver';
        this.touchControls.setActive(false);

        // Check for new high score
        const isNewHighScore = this.score > this.highScore;
        if (isNewHighScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }

        this.audio.playSound('gameOver');
        this.menu.showGameOverMenu(this.score, this.highScore, isNewHighScore);
    }

    // Main game loop
    run(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Cap delta time to prevent large jumps
        const dt = Math.min(deltaTime, 50);

        // Update game
        this.update(dt);

        // Render game
        this.render();

        // Continue loop
        requestAnimationFrame((t) => this.run(t));
    }

    update(deltaTime) {
        // Always update effects (for starfield animation)
        this.effects.update(deltaTime);

        if (this.state === 'playing') {
            this.gameTime += deltaTime;

            // Update player with touch controls if active
            this.player.update(deltaTime, this.input, this.canvas.width, this.canvas.height, this.touchControls);

            // Handle shooting (mouse click, spacebar, or touch fire button)
            // On touch devices: only use touchControls.isFirePressed() to avoid joystick triggering shots
            // On desktop: use mouse and keyboard
            let isShooting;
            if (this.touchControls.enabled && this.touchControls.active) {
                isShooting = this.touchControls.isFirePressed() || this.input.isKeyDown('Space');
            } else {
                isShooting = this.input.isMouseDown() || this.input.isKeyDown('Space');
            }
            if (isShooting && this.player.canShoot(this.gameTime)) {
                const bullet = this.player.shoot(this.gameTime);
                this.bullets.push(bullet);
                this.audio.playSound('shoot');
            }

            // Update bullets
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                this.bullets[i].update(deltaTime, this.canvas.width, this.canvas.height);
                if (!this.bullets[i].alive) {
                    this.bullets.splice(i, 1);
                }
            }

            // Update asteroids
            for (const asteroid of this.asteroids) {
                asteroid.update(deltaTime, this.canvas.width, this.canvas.height);
            }

            // Update power-ups
            for (let i = this.powerUps.length - 1; i >= 0; i--) {
                this.powerUps[i].update(deltaTime);
                if (!this.powerUps[i].alive) {
                    this.powerUps.splice(i, 1);
                }
            }

            // Update particles
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].update(deltaTime);
                if (this.particles[i].isDead()) {
                    this.particles.splice(i, 1);
                }
            }

            // Update bomb effect
            if (this.bombActive) {
                this.bombProgress += deltaTime / 500; // 500ms bomb animation
                if (this.bombProgress >= 1) {
                    this.bombActive = false;
                }
            }

            // Check collisions
            this.checkCollisions();

            // Spawn new asteroids
            if (!this.levelManager.levelTransitioning) {
                // Always spawn if there are no asteroids (failsafe)
                const shouldSpawn = this.spawn.shouldSpawn(this.gameTime) || this.asteroids.length === 0;

                if (shouldSpawn) {
                    const asteroid = this.spawn.spawnAsteroid(
                        this.levelManager.level,
                        this.player.x,
                        this.player.y
                    );
                    this.asteroids.push(asteroid);
                }
            }

            // Check for level transition
            if (this.levelManager.levelTransitioning) {
                const completed = this.levelManager.updateTransition(deltaTime);
                const progress = this.levelManager.transitionTimer / this.levelManager.transitionDuration;
                this.effects.updateLevelTransition(deltaTime, progress);

                if (completed) {
                    // Level up complete - clear all asteroids and power-ups
                    this.asteroids = [];
                    this.powerUps = [];
                    this.bullets = [];

                    // Spawn fresh asteroids for new level
                    const initialAsteroids = this.spawn.spawnInitialAsteroids(
                        3 + this.levelManager.level,
                        this.levelManager.level,
                        this.player.x,
                        this.player.y
                    );
                    this.asteroids.push(...initialAsteroids);

                    this.spawn.setSpawnInterval(this.levelManager.getSpawnInterval());
                    this.spawn.resetSpawnTimer(this.gameTime);
                    this.audio.playSound('levelUp');
                }
            }
        } else if (this.state === 'levelTransition') {
            // Update level transition
            const completed = this.levelManager.updateTransition(deltaTime);
            if (completed) {
                this.state = 'playing';
            }
        }
    }

    checkCollisions() {
        // Bullet vs Asteroid collisions
        const bulletHits = this.collision.checkBulletAsteroidCollisions(this.bullets, this.asteroids);
        for (const hit of bulletHits) {
            const asteroid = hit.asteroid;
            const destroyed = asteroid.hit();

            if (destroyed) {
                // Add score
                this.score += asteroid.points;

                // Create explosion particles
                const explosionParticles = Particle.createExplosion(asteroid.x, asteroid.y, CONSTANTS.COLORS.ASTEROID);
                this.particles.push(...explosionParticles);

                this.audio.playSound('explosion');
                this.effects.shake(5, 100);

                // Split asteroid
                const newAsteroids = asteroid.split();
                this.asteroids.push(...newAsteroids);

                // Maybe spawn power-up
                const powerUp = this.spawn.maybeSpawnPowerUp(asteroid.x, asteroid.y);
                if (powerUp) {
                    this.powerUps.push(powerUp);
                }

                // Check for level up
                if (this.levelManager.addDestroyedAsteroid()) {
                    this.levelManager.startLevelTransition();
                    this.effects.startLevelTransition(this.levelManager.level + 1);
                }
            } else {
                // Hit but not destroyed
                const hitParticles = Particle.createHit(asteroid.x, asteroid.y, CONSTANTS.COLORS.ASTEROID);
                this.particles.push(...hitParticles);
                this.audio.playSound('hit');
            }
        }

        // Clean up dead asteroids
        this.asteroids = this.asteroids.filter(a => a.alive);

        // Player vs Asteroid collisions
        const playerHits = this.collision.checkPlayerAsteroidCollisions(this.player, this.asteroids);
        if (playerHits.length > 0) {
            if (this.player.takeDamage()) {
                this.lives--;
                this.audio.playSound('playerHit');
                this.effects.shake(15, 300);
                this.effects.flash('#ff0000', 200);

                // Create damage particles
                const damageParticles = Particle.createExplosion(this.player.x, this.player.y, CONSTANTS.COLORS.PLAYER);
                this.particles.push(...damageParticles);

                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        }

        // Player vs PowerUp collisions
        const collected = this.collision.checkPlayerPowerUpCollisions(this.player, this.powerUps);
        for (const item of collected) {
            const powerUp = item.powerUp;
            const type = this.player.applyPowerUp(powerUp.name);

            if (type === 'bomb') {
                this.activateBomb();
            }

            this.audio.playSound('powerUp');

            // Create collection particles
            const collectParticles = Particle.createExplosion(powerUp.x, powerUp.y, powerUp.color);
            this.particles.push(...collectParticles);
        }

        // Clean up collected power-ups
        this.powerUps = this.powerUps.filter(p => p.alive);
    }

    activateBomb() {
        this.bombActive = true;
        this.bombX = this.player.x;
        this.bombY = this.player.y;
        this.bombProgress = 0;

        this.audio.playSound('bomb');
        this.effects.shake(20, 500);
        this.effects.flash('#ff8800', 300);

        // Destroy all asteroids
        for (const asteroid of this.asteroids) {
            this.score += asteroid.points;
            const explosionParticles = Particle.createExplosion(asteroid.x, asteroid.y, CONSTANTS.COLORS.ASTEROID);
            this.particles.push(...explosionParticles);

            // Count towards level progress
            this.levelManager.addDestroyedAsteroid();
        }

        this.asteroids = [];

        // Check for level up after bomb
        if (this.levelManager.asteroidsDestroyed >= this.levelManager.asteroidsRequired) {
            this.levelManager.startLevelTransition();
            this.effects.startLevelTransition(this.levelManager.level + 1);
        }
    }

    render() {
        const ctx = this.ctx;

        // Clear canvas
        ctx.fillStyle = CONSTANTS.COLORS.BACKGROUND;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply screen shake
        const shake = this.effects.getShakeOffset();
        ctx.save();
        ctx.translate(shake.x, shake.y);

        // Draw starfield
        this.effects.drawStarfield(ctx, this.gameTime);

        if (this.state === 'playing' || this.state === 'paused' || this.state === 'gameOver') {
            // Draw particles (behind everything)
            for (const particle of this.particles) {
                particle.draw(ctx);
            }

            // Draw power-ups
            for (const powerUp of this.powerUps) {
                powerUp.draw(ctx);
            }

            // Draw asteroids
            for (const asteroid of this.asteroids) {
                asteroid.draw(ctx);
            }

            // Draw bullets
            for (const bullet of this.bullets) {
                bullet.draw(ctx);
            }

            // Draw player
            if (this.player) {
                this.player.draw(ctx);
            }

            // Draw bomb effect
            if (this.bombActive) {
                this.effects.drawBombEffect(ctx, this.bombX, this.bombY, this.bombProgress);
            }

            // Draw flash effect
            this.effects.drawFlash(ctx);

            // Draw level transition
            this.effects.drawLevelTransition(ctx);

            // Draw HUD
            if (this.state !== 'gameOver') {
                this.hud.draw(ctx, {
                    score: this.score,
                    lives: this.lives,
                    level: this.levelManager.level,
                    levelProgress: this.levelManager.getProgress(),
                    highScore: this.highScore,
                    powerUps: {
                        shield: this.player?.shielded,
                        shieldTimer: this.player?.shieldTimer,
                        rapidFire: this.player?.rapidFire,
                        rapidFireTimer: this.player?.rapidFireTimer
                    }
                });
            }
        }

        ctx.restore();

        // Draw touch controls (not affected by shake)
        if (this.state === 'playing') {
            this.touchControls.draw(ctx);
        }

        // Draw menu (not affected by shake)
        this.menu.draw(ctx);
    }

    loadHighScore() {
        try {
            const saved = localStorage.getItem('asteroidCrasherHighScore');
            return saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            return 0;
        }
    }

    saveHighScore() {
        try {
            localStorage.setItem('asteroidCrasherHighScore', this.highScore.toString());
        } catch (e) {
            console.warn('Could not save high score');
        }
    }
}
