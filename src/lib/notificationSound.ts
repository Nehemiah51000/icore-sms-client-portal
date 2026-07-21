// Some older Safari/WebKit browsers only expose AudioContext under a
// prefixed global. This describes just that one extra property so we can
// check for it without resorting to `any`.
interface WindowWithWebkitAudio extends Window {
  // Some environments may not include AudioContext on the Window type used
  // by TypeScript, so include both standard and prefixed names here.
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

// Generates a short two-tone "ping" using the Web Audio API — no audio
// file needed, so there's nothing extra to download over a slow connection.
export function playNotificationSound() {
  try {
    const win = window as WindowWithWebkitAudio;
    const AudioContextClass = win.AudioContext ?? win.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.15, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(880, now, 0.12);
    playTone(1175, now + 0.1, 0.15);
  } catch {
    // Not critical to app function — fail silently if the browser blocks
    // it (autoplay policy) or doesn't support the Web Audio API.
  }
}
