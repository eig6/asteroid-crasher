class Menu {
    constructor(canvas, inputManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.input = inputManager;

        // Button definitions
        this.buttons = [];

        // Current menu state
        this.currentMenu = null;
    }

    showStartMenu() {
        this.currentMenu = 'start';
        this.buttons = [
            {
                id: 'start',
                text: 'Start Game',
                x: this.canvas.width / 2,
                y: this.canvas.height / 2 + 50,
                width: 200,
                height: 50
            }
        ];
    }

    showPauseMenu() {
        this.currentMenu = 'pause';
        this.buttons = [
            {
                id: 'resume',
                text: 'Resume',
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                width: 200,
                height: 50
            },
            {
                id: 'restart',
                text: 'Restart',
                x: this.canvas.width / 2,
                y: this.canvas.height / 2 + 70,
                width: 200,
                height: 50
            }
        ];
    }

    showGameOverMenu(score, highScore, isNewHighScore) {
        this.currentMenu = 'gameOver';
        this.score = score;
        this.highScore = highScore;
        this.isNewHighScore = isNewHighScore;
        this.buttons = [
            {
                id: 'restart',
                text: 'Play Again',
                x: this.canvas.width / 2,
                y: this.canvas.height / 2 + 80,
                width: 200,
                height: 50
            }
        ];
    }

    hide() {
        this.currentMenu = null;
        this.buttons = [];
    }

    update() {
        // Update button positions on resize
        if (this.currentMenu === 'start') {
            this.showStartMenu();
        } else if (this.currentMenu === 'pause') {
            this.showPauseMenu();
        } else if (this.currentMenu === 'gameOver') {
            this.showGameOverMenu(this.score, this.highScore, this.isNewHighScore);
        }
    }

    // Check if a button was clicked
    checkClick() {
        if (!this.currentMenu) return null;

        const mouseX = this.input.mouseX;
        const mouseY = this.input.mouseY;

        for (const button of this.buttons) {
            const halfWidth = button.width / 2;
            const halfHeight = button.height / 2;

            if (mouseX >= button.x - halfWidth &&
                mouseX <= button.x + halfWidth &&
                mouseY >= button.y - halfHeight &&
                mouseY <= button.y + halfHeight) {
                return button.id;
            }
        }

        return null;
    }

    draw(ctx) {
        if (!this.currentMenu) return;

        // Draw overlay
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.restore();

        switch (this.currentMenu) {
            case 'start':
                this.drawStartMenu(ctx);
                break;
            case 'pause':
                this.drawPauseMenu(ctx);
                break;
            case 'gameOver':
                this.drawGameOverMenu(ctx);
                break;
        }

        // Draw buttons
        this.drawButtons(ctx);
    }

    drawStartMenu(ctx) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Title
        ctx.save();
        ctx.font = 'bold 64px "Segoe UI", sans-serif';
        ctx.fillStyle = CONSTANTS.COLORS.PLAYER;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ASTEROID', centerX, centerY - 120);
        ctx.fillStyle = '#ff6600';
        ctx.fillText('CRASHER', centerX, centerY - 50);

        // Instructions
        ctx.font = '18px "Segoe UI", sans-serif';
        ctx.fillStyle = '#888888';
        ctx.fillText('WASD or Arrow Keys to move', centerX, centerY + 120);
        ctx.fillText('Click or Space to shoot', centerX, centerY + 145);
        ctx.fillText('ESC to pause', centerX, centerY + 170);

        ctx.restore();
    }

    drawPauseMenu(ctx) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        ctx.save();
        ctx.font = 'bold 48px "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PAUSED', centerX, centerY - 80);
        ctx.restore();
    }

    drawGameOverMenu(ctx) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        ctx.save();

        // Game Over text
        ctx.font = 'bold 56px "Segoe UI", sans-serif';
        ctx.fillStyle = '#ff4444';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAME OVER', centerX, centerY - 100);

        // Score
        ctx.font = 'bold 32px "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Score: ${this.score.toLocaleString()}`, centerX, centerY - 30);

        // High score
        if (this.isNewHighScore) {
            ctx.fillStyle = '#ffff00';
            ctx.fillText('NEW HIGH SCORE!', centerX, centerY + 15);
        } else {
            ctx.font = '24px "Segoe UI", sans-serif';
            ctx.fillStyle = '#888888';
            ctx.fillText(`Best: ${this.highScore.toLocaleString()}`, centerX, centerY + 15);
        }

        ctx.restore();
    }

    drawButtons(ctx) {
        const mouseX = this.input.mouseX;
        const mouseY = this.input.mouseY;

        for (const button of this.buttons) {
            const halfWidth = button.width / 2;
            const halfHeight = button.height / 2;

            // Check hover
            const isHovered = mouseX >= button.x - halfWidth &&
                             mouseX <= button.x + halfWidth &&
                             mouseY >= button.y - halfHeight &&
                             mouseY <= button.y + halfHeight;

            ctx.save();

            // Button background
            if (isHovered) {
                ctx.fillStyle = CONSTANTS.COLORS.PLAYER;
                ctx.shadowColor = CONSTANTS.COLORS.PLAYER;
                ctx.shadowBlur = 20;
            } else {
                ctx.fillStyle = '#333333';
            }

            ctx.fillRect(button.x - halfWidth, button.y - halfHeight, button.width, button.height);

            // Button border
            ctx.strokeStyle = isHovered ? '#ffffff' : '#666666';
            ctx.lineWidth = 2;
            ctx.strokeRect(button.x - halfWidth, button.y - halfHeight, button.width, button.height);

            // Button text
            ctx.font = 'bold 20px "Segoe UI", sans-serif';
            ctx.fillStyle = isHovered ? '#000000' : '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(button.text, button.x, button.y);

            ctx.restore();
        }
    }

    isActive() {
        return this.currentMenu !== null;
    }
}
