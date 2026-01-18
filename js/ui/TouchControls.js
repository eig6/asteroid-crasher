class TouchControls {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Detect touch device
        this.isTouchDevice = this.detectTouch();
        this.enabled = this.isTouchDevice;
        this.active = false; // Only active during gameplay

        // Joystick state (left side)
        this.joystick = {
            active: false,
            baseX: 0,
            baseY: 0,
            stickX: 0,
            stickY: 0,
            radius: 60,
            stickRadius: 30,
            touchId: null,
            // Output values (-1 to 1)
            inputX: 0,
            inputY: 0
        };

        // Fire button state (right side)
        this.fireButton = {
            active: false,
            x: 0,
            y: 0,
            radius: 50,
            touchId: null
        };

        // Aim position (where player aims when using touch)
        this.aimX = 0;
        this.aimY = 0;

        this.updateLayout();
        this.setupEventListeners();
    }

    detectTouch() {
        return ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0) ||
               (navigator.msMaxTouchPoints > 0);
    }

    setActive(active) {
        this.active = active;
    }

    updateLayout() {
        const padding = 40;
        const bottomOffset = 120;

        // Joystick position (bottom left)
        this.joystick.baseX = padding + this.joystick.radius;
        this.joystick.baseY = this.canvas.height - bottomOffset;
        this.joystick.stickX = this.joystick.baseX;
        this.joystick.stickY = this.joystick.baseY;

        // Fire button position (bottom right)
        this.fireButton.x = this.canvas.width - padding - this.fireButton.radius;
        this.fireButton.y = this.canvas.height - bottomOffset;

        // Default aim position (center of screen)
        this.aimX = this.canvas.width / 2;
        this.aimY = this.canvas.height / 2;
    }

    setupEventListeners() {
        // Touch start
        this.canvas.addEventListener('touchstart', (e) => {
            if (!this.enabled || !this.active) return;
            e.preventDefault();

            for (const touch of e.changedTouches) {
                this.handleTouchStart(touch);
            }
        }, { passive: false });

        // Touch move
        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.enabled || !this.active) return;
            e.preventDefault();

            for (const touch of e.changedTouches) {
                this.handleTouchMove(touch);
            }
        }, { passive: false });

        // Touch end
        this.canvas.addEventListener('touchend', (e) => {
            if (!this.enabled || !this.active) return;
            e.preventDefault();

            for (const touch of e.changedTouches) {
                this.handleTouchEnd(touch);
            }
        }, { passive: false });

        // Touch cancel
        this.canvas.addEventListener('touchcancel', (e) => {
            if (!this.enabled || !this.active) return;
            e.preventDefault();

            for (const touch of e.changedTouches) {
                this.handleTouchEnd(touch);
            }
        }, { passive: false });

        // Handle resize
        window.addEventListener('resize', () => {
            this.updateLayout();
        });
    }

    handleTouchStart(touch) {
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // Check if touch is on left half (joystick area)
        if (x < this.canvas.width / 2) {
            if (this.joystick.touchId === null) {
                this.joystick.active = true;
                this.joystick.touchId = touch.identifier;
                this.joystick.baseX = x;
                this.joystick.baseY = y;
                this.joystick.stickX = x;
                this.joystick.stickY = y;
            }
        } else {
            // Right half - fire button or aim
            if (this.fireButton.touchId === null) {
                this.fireButton.active = true;
                this.fireButton.touchId = touch.identifier;
                // Update aim position
                this.aimX = x;
                this.aimY = y;
            }
        }
    }

    handleTouchMove(touch) {
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // Update joystick
        if (touch.identifier === this.joystick.touchId) {
            const dx = x - this.joystick.baseX;
            const dy = y - this.joystick.baseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = this.joystick.radius;

            if (distance > maxDistance) {
                // Clamp to radius
                this.joystick.stickX = this.joystick.baseX + (dx / distance) * maxDistance;
                this.joystick.stickY = this.joystick.baseY + (dy / distance) * maxDistance;
            } else {
                this.joystick.stickX = x;
                this.joystick.stickY = y;
            }

            // Calculate normalized input (-1 to 1)
            this.joystick.inputX = (this.joystick.stickX - this.joystick.baseX) / maxDistance;
            this.joystick.inputY = (this.joystick.stickY - this.joystick.baseY) / maxDistance;
        }

        // Update aim position when fire button is held
        if (touch.identifier === this.fireButton.touchId) {
            this.aimX = x;
            this.aimY = y;
        }
    }

    handleTouchEnd(touch) {
        // Release joystick
        if (touch.identifier === this.joystick.touchId) {
            this.joystick.active = false;
            this.joystick.touchId = null;
            this.joystick.inputX = 0;
            this.joystick.inputY = 0;
            // Reset stick to base position
            this.joystick.stickX = this.joystick.baseX;
            this.joystick.stickY = this.joystick.baseY;
        }

        // Release fire button
        if (touch.identifier === this.fireButton.touchId) {
            this.fireButton.active = false;
            this.fireButton.touchId = null;
        }
    }

    // Get movement input from joystick
    getMovementInput() {
        return {
            x: this.joystick.inputX,
            y: this.joystick.inputY
        };
    }

    // Check if fire button is pressed
    isFirePressed() {
        return this.fireButton.active;
    }

    // Get aim position for player rotation
    getAimPosition() {
        return {
            x: this.aimX,
            y: this.aimY
        };
    }

    draw(ctx) {
        if (!this.enabled || !this.active) return;

        ctx.save();

        // Draw joystick base
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.joystick.baseX, this.joystick.baseY, this.joystick.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw joystick border
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.joystick.baseX, this.joystick.baseY, this.joystick.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw joystick stick
        ctx.globalAlpha = this.joystick.active ? 0.8 : 0.5;
        ctx.fillStyle = CONSTANTS.COLORS.PLAYER;
        ctx.beginPath();
        ctx.arc(this.joystick.stickX, this.joystick.stickY, this.joystick.stickRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
