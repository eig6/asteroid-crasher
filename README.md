# Asteroid Crasher

A fun 2D asteroid shooter game built with HTML5 Canvas and vanilla JavaScript. Destroy asteroids, collect power-ups, and survive as long as you can!

**Play now:** [https://brightgames.online](https://brightgames.online)

## Features

- Classic arcade-style asteroid shooting gameplay
- 4 asteroid sizes (small, medium, large, huge) with splitting behavior
- 3 power-ups: Shield, Rapid Fire, and Bomb
- Progressive difficulty with level system
- High score persistence
- Sound effects using Web Audio API
- Works offline as a Progressive Web App (PWA)
- Touch controls for mobile devices

## How to Play

### Desktop Controls
- **WASD** or **Arrow Keys** - Move your spaceship
- **Mouse** - Aim toward cursor
- **Click** or **Space** - Shoot
- **ESC** - Pause game

### Mobile/Touch Controls
- **Left side of screen** - Virtual joystick for movement
- **Tap anywhere else** - Shoot in that direction

## Game Mechanics

### Asteroids
| Size | Points | Behavior |
|------|--------|----------|
| Small | 100 | Destroyed |
| Medium | 200 | Splits into 2 small |
| Large | 300 | Splits into 2 medium |
| Huge | 500 | Splits into 3 large |

### Power-Ups
- **Shield (Blue)** - 8 seconds of invincibility
- **Rapid Fire (Red)** - 6 seconds of faster shooting
- **Bomb (Orange)** - Destroys all asteroids on screen

## Install as App

### iPhone/iPad
1. Open [https://brightgames.online](https://brightgames.online) in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

### Android
1. Open [https://brightgames.online](https://brightgames.online) in Chrome
2. Tap the menu (3 dots)
3. Select "Install app" or "Add to Home Screen"

### Desktop (Chrome/Edge)
1. Visit [https://brightgames.online](https://brightgames.online)
2. Click the install icon in the address bar

## Development

### Project Structure
```
asteroid-crasher/
├── index.html              # Entry point
├── css/style.css           # Styles
├── js/
│   ├── main.js             # Game initialization
│   ├── game.js             # Core game loop
│   ├── entities/           # Game objects
│   │   ├── Player.js
│   │   ├── Asteroid.js
│   │   ├── Bullet.js
│   │   ├── PowerUp.js
│   │   └── Particle.js
│   ├── managers/           # Game systems
│   │   ├── InputManager.js
│   │   ├── CollisionManager.js
│   │   ├── SpawnManager.js
│   │   ├── AudioManager.js
│   │   └── LevelManager.js
│   ├── ui/                 # User interface
│   │   ├── HUD.js
│   │   ├── Menu.js
│   │   ├── Effects.js
│   │   └── TouchControls.js
│   └── utils/constants.js  # Configuration
├── icons/                  # PWA icons
├── manifest.json           # PWA manifest
└── service-worker.js       # Offline support
```

### Run Locally
Simply open `index.html` in a browser, or use a local server:
```bash
npx serve .
```

### Generate Icons
```bash
npm install
node scripts/generate-icons.js
```

## Tech Stack

- HTML5 Canvas for rendering
- Vanilla JavaScript (no frameworks)
- Web Audio API for sound effects
- Service Worker for offline support
- PWA for installable app experience

## License

MIT
