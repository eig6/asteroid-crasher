class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = CONSTANTS.PLAYER.SIZE;

        // Velocity
        this.vx = 0;
        this.vy = 0;

        // Rotation (facing direction)
        this.rotation = -Math.PI / 2; // Start facing up

        // Shooting
        this.lastShot = 0;
        this.fireRate = CONSTANTS.PLAYER.FIRE_RATE;

        // States
        this.alive = true;
        this.invincible = false;
        this.invincibleTimer = 0;

        // Power-up states
        this.shielded = false;
        this.shieldTimer = 0;
        this.rapidFire = false;
        this.rapidFireTimer = 0;

        // Visual effects
        this.thrustParticles = [];
        this.isThrusting = false;

        // Animation
        this.engineFlicker = 0;
    }

    update(deltaTime, input, canvasWidth, canvasHeight, touchControls = null) {
        // Handle movement input
        let moveX = 0;
        let moveY = 0;

        // Keyboard input
        if (input.isKeyDown('ArrowUp') || input.isKeyDown('KeyW')) moveY -= 1;
        if (input.isKeyDown('ArrowDown') || input.isKeyDown('KeyS')) moveY += 1;
        if (input.isKeyDown('ArrowLeft') || input.isKeyDown('KeyA')) moveX -= 1;
        if (input.isKeyDown('ArrowRight') || input.isKeyDown('KeyD')) moveX += 1;

        // Touch joystick input (add to keyboard input)
        if (touchControls && touchControls.enabled) {
            const touchInput = touchControls.getMovementInput();
            moveX += touchInput.x;
            moveY += touchInput.y;
        }

        // Clamp movement to -1 to 1 range
        moveX = Math.max(-1, Math.min(1, moveX));
        moveY = Math.max(-1, Math.min(1, moveY));

        // Apply acceleration
        this.vx += moveX * CONSTANTS.PLAYER.SPEED * (deltaTime / 1000);
        this.vy += moveY * CONSTANTS.PLAYER.SPEED * (deltaTime / 1000);

        // Apply friction
        this.vx *= CONSTANTS.PLAYER.FRICTION;
        this.vy *= CONSTANTS.PLAYER.FRICTION;

        // Update position
        this.x += this.vx * (deltaTime / 1000);
        this.y += this.vy * (deltaTime / 1000);

        // Keep player on screen
        this.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.y));

        // Update rotation to face mouse or touch aim
        let aimX, aimY;
        if (touchControls && touchControls.enabled && touchControls.isFirePressed()) {
            const aimPos = touchControls.getAimPosition();
            aimX = aimPos.x;
            aimY = aimPos.y;
        } else {
            aimX = input.mouseX;
            aimY = input.mouseY;
        }
        this.rotation = Math.atan2(aimY - this.y, aimX - this.x);

        // Track if thrusting for particles
        this.isThrusting = Math.abs(moveX) > 0.1 || Math.abs(moveY) > 0.1;

        // Update invincibility timer
        if (this.invincible) {
            this.invincibleTimer -= deltaTime;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }

        // Update shield timer
        if (this.shielded) {
            this.shieldTimer -= deltaTime;
            if (this.shieldTimer <= 0) {
                this.shielded = false;
            }
        }

        // Update rapid fire timer
        if (this.rapidFire) {
            this.rapidFireTimer -= deltaTime;
            if (this.rapidFireTimer <= 0) {
                this.rapidFire = false;
                this.fireRate = CONSTANTS.PLAYER.FIRE_RATE;
            }
        }

        // Engine flicker animation
        this.engineFlicker += deltaTime;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw invincibility/shield effect
        if (this.shielded) {
            this.drawShieldEffect(ctx);
        } else if (this.invincible) {
            // Flashing when invincible from damage
            if (Math.floor(this.invincibleTimer / 100) % 2 === 0) {
                ctx.globalAlpha = 0.5;
            }
        }

        // Draw thruster flame
        if (this.isThrusting) {
            this.drawThruster(ctx);
        }

        // Draw spaceship body
        ctx.fillStyle = CONSTANTS.COLORS.PLAYER;
        ctx.beginPath();

        // Main ship triangle
        ctx.moveTo(this.radius, 0); // Nose
        ctx.lineTo(-this.radius * 0.7, -this.radius * 0.6); // Top left
        ctx.lineTo(-this.radius * 0.4, 0); // Back indent
        ctx.lineTo(-this.radius * 0.7, this.radius * 0.6); // Bottom left
        ctx.closePath();
        ctx.fill();

        // Draw cockpit
        ctx.fillStyle = '#00cc66';
        ctx.beginPath();
        ctx.arc(this.radius * 0.2, 0, this.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Draw outline
        ctx.strokeStyle = '#00aa55';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(-this.radius * 0.7, -this.radius * 0.6);
        ctx.lineTo(-this.radius * 0.4, 0);
        ctx.lineTo(-this.radius * 0.7, this.radius * 0.6);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();

        // Draw rapid fire indicator
        if (this.rapidFire) {
            this.drawRapidFireEffect(ctx);
        }
    }

    drawThruster(ctx) {
        const flicker = Math.sin(this.engineFlicker / 30) * 0.3 + 0.7;
        const flameLength = this.radius * 0.8 * flicker;

        // Outer flame
        ctx.fillStyle = CONSTANTS.COLORS.PLAYER_THRUSTER;
        ctx.beginPath();
        ctx.moveTo(-this.radius * 0.4, -this.radius * 0.2);
        ctx.lineTo(-this.radius * 0.4 - flameLength, 0);
        ctx.lineTo(-this.radius * 0.4, this.radius * 0.2);
        ctx.closePath();
        ctx.fill();

        // Inner flame (brighter)
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(-this.radius * 0.4, -this.radius * 0.1);
        ctx.lineTo(-this.radius * 0.4 - flameLength * 0.6, 0);
        ctx.lineTo(-this.radius * 0.4, this.radius * 0.1);
        ctx.closePath();
        ctx.fill();
    }

    drawShieldEffect(ctx) {
        ctx.save();
        ctx.rotate(-this.rotation); // Undo rotation for shield

        // Pulsing shield
        const pulse = Math.sin(Date.now() / 100) * 0.2 + 0.8;
        const shieldRadius = this.radius * 1.8 * pulse;

        // Shield gradient
        const gradient = ctx.createRadialGradient(0, 0, this.radius, 0, 0, shieldRadius);
        gradient.addColorStop(0, 'rgba(0, 170, 255, 0.1)');
        gradient.addColorStop(0.7, 'rgba(0, 170, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 170, 255, 0.5)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
        ctx.fill();

        // Shield ring
        ctx.strokeStyle = CONSTANTS.COLORS.SHIELD;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    drawRapidFireEffect(ctx) {
        // Draw small indicator below player
        ctx.save();
        ctx.fillStyle = CONSTANTS.COLORS.RAPID_FIRE;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.radius + 10, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    canShoot(currentTime) {
        return currentTime - this.lastShot >= this.fireRate;
    }

    shoot(currentTime) {
        this.lastShot = currentTime;

        // Create bullet from nose of ship
        const bulletX = this.x + Math.cos(this.rotation) * this.radius;
        const bulletY = this.y + Math.sin(this.rotation) * this.radius;

        return new Bullet(bulletX, bulletY, this.rotation);
    }

    takeDamage() {
        if (this.shielded || this.invincible) {
            return false; // No damage taken
        }

        // Start invincibility frames
        this.invincible = true;
        this.invincibleTimer = CONSTANTS.PLAYER.INVINCIBILITY_TIME;

        return true; // Damage was taken
    }

    applyPowerUp(type) {
        switch (type) {
            case 'shield':
                this.shielded = true;
                this.shieldTimer = CONSTANTS.PLAYER.SHIELD_DURATION;
                break;
            case 'rapidFire':
                this.rapidFire = true;
                this.rapidFireTimer = CONSTANTS.PLAYER.RAPID_FIRE_DURATION;
                this.fireRate = CONSTANTS.PLAYER.RAPID_FIRE_RATE;
                break;
            case 'bomb':
                // Bomb is handled by the game state
                return 'bomb';
        }
        return type;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.rotation = -Math.PI / 2;
        this.alive = true;
        this.invincible = true;
        this.invincibleTimer = CONSTANTS.PLAYER.INVINCIBILITY_TIME;
        this.shielded = false;
        this.rapidFire = false;
        this.fireRate = CONSTANTS.PLAYER.FIRE_RATE;
    }
}
