class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.enabled = true;

        // Try to initialize audio context
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }

    // Resume audio context (needed after user interaction)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Generate a sound using oscillators
    playSound(type) {
        if (!this.enabled || !this.audioContext) return;

        this.resume();

        switch (type) {
            case 'shoot':
                this.playShoot();
                break;
            case 'explosion':
                this.playExplosion();
                break;
            case 'hit':
                this.playHit();
                break;
            case 'playerHit':
                this.playPlayerHit();
                break;
            case 'powerUp':
                this.playPowerUp();
                break;
            case 'bomb':
                this.playBomb();
                break;
            case 'levelUp':
                this.playLevelUp();
                break;
            case 'gameOver':
                this.playGameOver();
                break;
        }
    }

    playShoot() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);

        gain.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    playExplosion() {
        const bufferSize = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }

        const noise = this.audioContext.createBufferSource();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        noise.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        gain.gain.setValueAtTime(this.masterVolume * 0.5, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        noise.start(this.audioContext.currentTime);
    }

    playHit() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.05);

        gain.gain.setValueAtTime(this.masterVolume * 0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.05);
    }

    playPlayerHit() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);

        gain.gain.setValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.3);
    }

    playPowerUp() {
        const notes = [400, 500, 600, 800];
        const duration = 0.08;

        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * duration);

            gain.gain.setValueAtTime(0, this.audioContext.currentTime + i * duration);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime + i * duration + 0.01);
            gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + i * duration + duration);

            osc.start(this.audioContext.currentTime + i * duration);
            osc.stop(this.audioContext.currentTime + i * duration + duration);
        });
    }

    playBomb() {
        // Low rumble
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 0.5);

        gain.gain.setValueAtTime(this.masterVolume * 0.5, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.5);

        // Add explosion noise
        this.playExplosion();
    }

    playLevelUp() {
        const notes = [523, 659, 784, 1047]; // C, E, G, C (major chord arpeggio)
        const duration = 0.15;

        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * duration);

            gain.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime + i * duration);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * duration + duration * 2);

            osc.start(this.audioContext.currentTime + i * duration);
            osc.stop(this.audioContext.currentTime + i * duration + duration * 2);
        });
    }

    playGameOver() {
        const notes = [400, 350, 300, 200];
        const duration = 0.2;

        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * duration);

            gain.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime + i * duration);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * duration + duration * 1.5);

            osc.start(this.audioContext.currentTime + i * duration);
            osc.stop(this.audioContext.currentTime + i * duration + duration * 1.5);
        });
    }

    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}
