/**
 * Nature Guardians - Audio Synthesizer (Web Audio API)
 * Generates all game sound effects programmatically to ensure offline readiness and zero external dependencies.
 */

class SoundEffectsManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    // Initialize AudioContext on first user interaction
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    // Play a single oscillator note
    playNote(frequency, type, duration, startTime, endFrequency = null) {
        if (this.muted || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
        osc.frequency.setValueAtTime(frequency, startTime);
        
        if (endFrequency) {
            osc.frequency.exponentialRampToValueAtTime(endFrequency, startTime + duration);
        }
        
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    // 1. Organic Pop (Click)
    playClick() {
        this.init();
        if (this.muted) return;
        const now = this.ctx.currentTime;
        this.playNote(300, 'sine', 0.08, now, 100);
    }

    // 2. High-pitched Pop/Ding (Dismantling trap / cleaning trash)
    playClean() {
        this.init();
        if (this.muted) return;
        const now = this.ctx.currentTime;
        this.playNote(800, 'sine', 0.1, now, 1200);
        this.playNote(1500, 'sine', 0.12, now + 0.03, 1000);
    }

    // 3. Upward Happy Arpeggio (Correct Answer / Match)
    playCorrect() {
        this.init();
        if (this.muted) return;
        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, idx) => {
            this.playNote(freq, 'triangle', 0.15, now + (idx * 0.06));
        });
    }

    // 4. Downward Buzz Chord (Wrong Answer)
    playWrong() {
        this.init();
        if (this.muted) return;
        const now = this.ctx.currentTime;
        
        // Dissonant parallel low notes
        const freq1 = 150;
        const freq2 = 145;
        
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        
        osc1.frequency.setValueAtTime(freq1, now);
        osc1.frequency.linearRampToValueAtTime(100, now + 0.3);
        
        osc2.frequency.setValueAtTime(freq2, now);
        osc2.frequency.linearRampToValueAtTime(95, now + 0.3);
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.3);
        osc2.stop(now + 0.3);
    }

    // 5. Success / Level Complete Sweep
    playLevelUp() {
        this.init();
        if (this.muted) return;
        const now = this.ctx.currentTime;
        
        // Triumphant climbing minor & major arpeggio transition
        const notes = [349.23, 440.00, 523.25, 659.25, 783.99, 1046.50]; // F4, A4, C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            this.playNote(freq, 'sine', 0.25, now + (idx * 0.08), freq * 1.05);
        });
    }

    // 6. Complete Victory Fanfare
    playVictory() {
        this.init();
        if (this.muted) return;
        const now = this.ctx.currentTime;
        
        const melody = [
            { f: 523.25, d: 0.15, t: 0.0 }, // C5
            { f: 523.25, d: 0.15, t: 0.15 },
            { f: 523.25, d: 0.15, t: 0.3 },
            { f: 523.25, d: 0.4, t: 0.45 }, // C5 hold
            { f: 415.30, d: 0.3, t: 0.85 }, // Ab4
            { f: 466.16, d: 0.3, t: 1.15 }, // Bb4
            { f: 523.25, d: 0.6, t: 1.45 }  // C5 long
        ];
        
        melody.forEach(note => {
            this.playNote(note.f, 'triangle', note.d, now + note.t);
            this.playNote(note.f * 1.5, 'sine', note.d, now + note.t); // Quint harmony
        });
    }
}

// Export as a single global instance
window.GameAudio = new SoundEffectsManager();
