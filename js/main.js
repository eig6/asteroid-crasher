// Main entry point for Asteroid Crasher

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Get canvas element
    const canvas = document.getElementById('gameCanvas');

    if (!canvas) {
        console.error('Could not find game canvas!');
        return;
    }

    // Create and start game
    const game = new Game(canvas);

    // Start game loop
    requestAnimationFrame((timestamp) => {
        game.lastTime = timestamp;
        game.run(timestamp);
    });

    // Log welcome message
    console.log('%c Asteroid Crasher ',
        'background: #00ff88; color: #000; font-size: 20px; font-weight: bold; padding: 10px;');
    console.log('Controls: WASD/Arrows to move, Click to shoot, ESC to pause');
});
