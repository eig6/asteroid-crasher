const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

function drawIcon(ctx, size) {
    const center = size / 2;

    // Background
    ctx.fillStyle = '#0a0a2e';
    ctx.fillRect(0, 0, size, size);

    // Stars (using seeded random for consistency)
    ctx.fillStyle = '#ffffff';
    const starPositions = [
        [0.1, 0.15], [0.85, 0.1], [0.7, 0.85], [0.15, 0.8],
        [0.5, 0.05], [0.95, 0.5], [0.05, 0.5], [0.5, 0.95],
        [0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.8, 0.6],
        [0.2, 0.5], [0.6, 0.15], [0.4, 0.85], [0.9, 0.3]
    ];

    starPositions.forEach(([xRatio, yRatio]) => {
        const x = xRatio * size;
        const y = yRatio * size;
        const r = Math.max(1, size * 0.005);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw spaceship
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(-Math.PI / 4);

    const shipSize = size * 0.28;

    // Thruster (draw first so it's behind)
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.moveTo(-shipSize * 0.4, -shipSize * 0.2);
    ctx.lineTo(-shipSize * 0.9, 0);
    ctx.lineTo(-shipSize * 0.4, shipSize * 0.2);
    ctx.closePath();
    ctx.fill();

    // Inner flame
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.moveTo(-shipSize * 0.4, -shipSize * 0.1);
    ctx.lineTo(-shipSize * 0.7, 0);
    ctx.lineTo(-shipSize * 0.4, shipSize * 0.1);
    ctx.closePath();
    ctx.fill();

    // Ship body
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.moveTo(shipSize, 0);
    ctx.lineTo(-shipSize * 0.7, -shipSize * 0.6);
    ctx.lineTo(-shipSize * 0.4, 0);
    ctx.lineTo(-shipSize * 0.7, shipSize * 0.6);
    ctx.closePath();
    ctx.fill();

    // Ship outline
    ctx.strokeStyle = '#00aa55';
    ctx.lineWidth = Math.max(1, size * 0.01);
    ctx.stroke();

    // Cockpit
    ctx.fillStyle = '#00cc66';
    ctx.beginPath();
    ctx.arc(shipSize * 0.2, 0, shipSize * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Draw asteroid (top right)
    ctx.save();
    ctx.translate(size * 0.78, size * 0.22);

    const asteroidSize = size * 0.1;
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    const points1 = [
        [1, 0], [0.7, 0.7], [0, 0.9], [-0.8, 0.6],
        [-1, 0], [-0.7, -0.7], [0, -0.85], [0.75, -0.65]
    ];
    points1.forEach((p, i) => {
        const x = p[0] * asteroidSize;
        const y = p[1] * asteroidSize;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Draw asteroid (bottom left)
    ctx.save();
    ctx.translate(size * 0.18, size * 0.82);

    const asteroidSize2 = size * 0.08;
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    const points2 = [
        [0.9, 0.1], [0.5, 0.8], [-0.3, 0.9], [-0.9, 0.3],
        [-0.8, -0.5], [-0.2, -0.9], [0.6, -0.7]
    ];
    points2.forEach((p, i) => {
        const x = p[0] * asteroidSize2;
        const y = p[1] * asteroidSize2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// Generate icons
sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    drawIcon(ctx, size);

    const filename = path.join(iconsDir, `icon-${size}.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filename, buffer);

    console.log(`Generated: icon-${size}.png`);
});

console.log('\nAll icons generated successfully!');
