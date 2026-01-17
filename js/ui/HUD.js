class HUD {
    constructor(canvas) {
        this.canvas = canvas;
        this.padding = 20;
    }

    draw(ctx, gameState) {
        const { score, lives, level, levelProgress, highScore, powerUps } = gameState;

        // Draw score (top left)
        this.drawScore(ctx, score, highScore);

        // Draw lives (top right)
        this.drawLives(ctx, lives);

        // Draw level indicator (top center)
        this.drawLevel(ctx, level, levelProgress);

        // Draw power-up indicators (below lives)
        this.drawPowerUpIndicators(ctx, powerUps);
    }

    drawScore(ctx, score, highScore) {
        ctx.save();
        ctx.font = 'bold 24px "Segoe UI", sans-serif';
        ctx.fillStyle = CONSTANTS.COLORS.HUD_TEXT;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // Current score
        ctx.fillText(`Score: ${score.toLocaleString()}`, this.padding, this.padding);

        // High score (smaller, below)
        ctx.font = '14px "Segoe UI", sans-serif';
        ctx.fillStyle = '#888888';
        ctx.fillText(`Best: ${highScore.toLocaleString()}`, this.padding, this.padding + 30);

        ctx.restore();
    }

    drawLives(ctx, lives) {
        const heartSize = 25;
        const spacing = 30;
        const startX = this.canvas.width - this.padding - (CONSTANTS.GAME.MAX_LIVES * spacing);

        ctx.save();

        for (let i = 0; i < CONSTANTS.GAME.MAX_LIVES; i++) {
            const x = startX + i * spacing;
            const y = this.padding + heartSize / 2;

            if (i < lives) {
                this.drawHeart(ctx, x, y, heartSize, CONSTANTS.COLORS.HEART);
            } else {
                this.drawHeart(ctx, x, y, heartSize, CONSTANTS.COLORS.HEART_EMPTY);
            }
        }

        ctx.restore();
    }

    drawHeart(ctx, x, y, size, color) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();

        // Heart shape
        const topCurveHeight = size * 0.3;
        ctx.moveTo(x, y + size * 0.25);

        // Left curve
        ctx.bezierCurveTo(
            x, y,
            x - size / 2, y,
            x - size / 2, y + topCurveHeight
        );
        ctx.bezierCurveTo(
            x - size / 2, y + size * 0.5,
            x, y + size * 0.7,
            x, y + size * 0.9
        );

        // Right curve
        ctx.bezierCurveTo(
            x, y + size * 0.7,
            x + size / 2, y + size * 0.5,
            x + size / 2, y + topCurveHeight
        );
        ctx.bezierCurveTo(
            x + size / 2, y,
            x, y,
            x, y + size * 0.25
        );

        ctx.fill();
        ctx.restore();
    }

    drawLevel(ctx, level, progress) {
        const centerX = this.canvas.width / 2;

        ctx.save();

        // Level number
        ctx.font = 'bold 20px "Segoe UI", sans-serif';
        ctx.fillStyle = CONSTANTS.COLORS.HUD_TEXT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`Level ${level}`, centerX, this.padding);

        // Progress bar
        const barWidth = 150;
        const barHeight = 8;
        const barX = centerX - barWidth / 2;
        const barY = this.padding + 28;

        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Progress fill
        const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
        gradient.addColorStop(0, '#00ff88');
        gradient.addColorStop(1, '#00ffff');
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);

        // Border
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        ctx.restore();
    }

    drawPowerUpIndicators(ctx, powerUps) {
        const startX = this.canvas.width - this.padding;
        const y = this.padding + 50;
        const indicatorWidth = 80;
        const indicatorHeight = 20;

        ctx.save();

        let yOffset = 0;

        // Shield indicator
        if (powerUps.shield && powerUps.shieldTimer > 0) {
            this.drawPowerUpBar(ctx, startX - indicatorWidth, y + yOffset,
                                indicatorWidth, indicatorHeight,
                                'Shield', powerUps.shieldTimer / CONSTANTS.PLAYER.SHIELD_DURATION,
                                CONSTANTS.COLORS.SHIELD);
            yOffset += 25;
        }

        // Rapid fire indicator
        if (powerUps.rapidFire && powerUps.rapidFireTimer > 0) {
            this.drawPowerUpBar(ctx, startX - indicatorWidth, y + yOffset,
                                indicatorWidth, indicatorHeight,
                                'Rapid', powerUps.rapidFireTimer / CONSTANTS.PLAYER.RAPID_FIRE_DURATION,
                                CONSTANTS.COLORS.RAPID_FIRE);
            yOffset += 25;
        }

        ctx.restore();
    }

    drawPowerUpBar(ctx, x, y, width, height, label, progress, color) {
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, width, height);

        // Progress
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width * progress, height);

        // Border
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        // Label
        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x + width / 2, y + height / 2);
    }
}
