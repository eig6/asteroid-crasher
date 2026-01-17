class Effects {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Screen shake
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeTimer = 0;

        // Screen flash
        this.flashColor = null;
        this.flashAlpha = 0;
        this.flashDuration = 0;
        this.flashTimer = 0;

        // Level transition overlay
        this.levelTransitionAlpha = 0;
        this.levelTransitionLevel = 1;
        this.showLevelTransition = false;

        // Starfield
        this.stars = [];
        this.initStarfield();
    }

    initStarfield() {
        const starCount = 150;
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 20 + 5,
                brightness: Math.random() * 0.5 + 0.5,
                twinkleSpeed: Math.random() * 3 + 1,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }

    updateStarfield(canvasWidth, canvasHeight) {
        // Update star positions for resize
        if (canvasWidth !== this.canvas.width || canvasHeight !== this.canvas.height) {
            this.stars.forEach(star => {
                if (star.x > canvasWidth) star.x = Math.random() * canvasWidth;
                if (star.y > canvasHeight) star.y = Math.random() * canvasHeight;
            });
        }
    }

    update(deltaTime) {
        // Update screen shake
        if (this.shakeTimer > 0) {
            this.shakeTimer -= deltaTime;
            if (this.shakeTimer <= 0) {
                this.shakeIntensity = 0;
            }
        }

        // Update flash
        if (this.flashTimer > 0) {
            this.flashTimer -= deltaTime;
            this.flashAlpha = (this.flashTimer / this.flashDuration) * 0.5;
            if (this.flashTimer <= 0) {
                this.flashAlpha = 0;
                this.flashColor = null;
            }
        }

        // Update star twinkle
        this.stars.forEach(star => {
            star.twinklePhase += deltaTime / 1000 * star.twinkleSpeed;
        });
    }

    // Trigger screen shake
    shake(intensity = 10, duration = 200) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeTimer = duration;
    }

    // Trigger screen flash
    flash(color = '#ffffff', duration = 150) {
        this.flashColor = color;
        this.flashDuration = duration;
        this.flashTimer = duration;
        this.flashAlpha = 0.5;
    }

    // Get shake offset for this frame
    getShakeOffset() {
        if (this.shakeTimer <= 0) return { x: 0, y: 0 };

        const progress = this.shakeTimer / this.shakeDuration;
        const intensity = this.shakeIntensity * progress;

        return {
            x: (Math.random() - 0.5) * 2 * intensity,
            y: (Math.random() - 0.5) * 2 * intensity
        };
    }

    // Start level transition effect
    startLevelTransition(level) {
        this.showLevelTransition = true;
        this.levelTransitionLevel = level;
        this.levelTransitionAlpha = 0;
    }

    updateLevelTransition(deltaTime, progress) {
        // Fade in for first half, fade out for second half
        if (progress < 0.5) {
            this.levelTransitionAlpha = progress * 2;
        } else {
            this.levelTransitionAlpha = (1 - progress) * 2;
        }

        if (progress >= 1) {
            this.showLevelTransition = false;
        }
    }

    // Draw starfield background
    drawStarfield(ctx, time) {
        this.stars.forEach(star => {
            const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
            const alpha = star.brightness * twinkle;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = CONSTANTS.COLORS.STAR;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    // Draw screen flash
    drawFlash(ctx) {
        if (this.flashAlpha > 0 && this.flashColor) {
            ctx.save();
            ctx.globalAlpha = this.flashAlpha;
            ctx.fillStyle = this.flashColor;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.restore();
        }
    }

    // Draw level transition overlay
    drawLevelTransition(ctx) {
        if (!this.showLevelTransition) return;

        ctx.save();

        // Dark overlay
        ctx.globalAlpha = this.levelTransitionAlpha * 0.7;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Level text
        ctx.globalAlpha = this.levelTransitionAlpha;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 72px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Level ${this.levelTransitionLevel}`, this.canvas.width / 2, this.canvas.height / 2);

        // Subtitle
        ctx.font = '24px "Segoe UI", sans-serif';
        ctx.fillStyle = '#00ff88';
        ctx.fillText('Get Ready!', this.canvas.width / 2, this.canvas.height / 2 + 50);

        ctx.restore();
    }

    // Draw bomb effect (expanding ring)
    drawBombEffect(ctx, x, y, progress) {
        const maxRadius = Math.max(this.canvas.width, this.canvas.height);
        const radius = maxRadius * progress;
        const alpha = 1 - progress;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = CONSTANTS.COLORS.BOMB;
        ctx.lineWidth = 20 * (1 - progress) + 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner ring
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5 * (1 - progress) + 1;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.95, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
}
