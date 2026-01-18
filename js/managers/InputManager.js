class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;
        this.mouseClicked = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Prevent scrolling with arrow keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                this.mouseDown = true;
                this.mouseClicked = true;
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.mouseDown = false;
            }
        });

        // Handle mouse leaving canvas
        this.canvas.addEventListener('mouseleave', () => {
            this.mouseDown = false;
        });

        // Touch support for mobile (don't preventDefault - let TouchControls handle that during gameplay)
        this.canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = touch.clientX - rect.left;
            this.mouseY = touch.clientY - rect.top;
            this.mouseDown = true;
            this.mouseClicked = true;
        }, { passive: true });

        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                this.mouseX = touch.clientX - rect.left;
                this.mouseY = touch.clientY - rect.top;
            }
        }, { passive: true });

        this.canvas.addEventListener('touchend', (e) => {
            this.mouseDown = false;
        }, { passive: true });

        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Handle window blur (reset all keys)
        window.addEventListener('blur', () => {
            this.keys = {};
            this.mouseDown = false;
        });
    }

    isKeyDown(code) {
        return this.keys[code] === true;
    }

    isMouseDown() {
        return this.mouseDown;
    }

    wasMouseClicked() {
        const clicked = this.mouseClicked;
        this.mouseClicked = false;
        return clicked;
    }

    // Reset state (call at end of frame)
    update() {
        this.mouseClicked = false;
    }

    // Full reset (call when starting new game)
    reset() {
        this.mouseDown = false;
        this.mouseClicked = false;
    }
}
