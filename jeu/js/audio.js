// Petits utilitaires audio (Web Audio API) : sons de note et clics de rythme.
// Aucun fichier audio externe requis : tout est synthétisé.

let ctx;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function playTone(freq, duration = 0.6) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, c.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration + 0.05);
}

export function playClick(pitch = 880) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'triangle';
  osc.frequency.value = pitch;
  gain.gain.setValueAtTime(0.3, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.15);
}

export function playSuccessJingle() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => setTimeout(() => playTone(f, 0.35), i * 120));
}

// Joue un motif rythmique. onsets = temps (en "temps") où frapper.
// beatDuration = durée d'un temps en secondes.
export function playRhythmPattern(onsets, beatDuration = 0.5) {
  onsets.forEach((t) => setTimeout(() => playClick(), t * beatDuration * 1000));
  return onsets[onsets.length - 1] * beatDuration * 1000 + 200;
}
