import { NOTES } from '../data.js';
import { playTone } from '../audio.js';

const ROUNDS = 8;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function starsFor(correct) {
  if (correct >= 7) return 3;
  if (correct >= 5) return 2;
  if (correct >= 3) return 1;
  return 0;
}

export function renderFlashcards(container, { onComplete }) {
  const order = shuffle(NOTES).slice(0, ROUNDS);
  let index = 0;
  let correct = 0;
  let locked = false;

  container.innerHTML = `
    <h2 class="quest-title">🎼 Les Notes Mystères</h2>
    <p class="quest-instructions">Regarde la note sur la portée, puis retrouve-la sur le clavier !</p>
    <div class="quest-progress"><span id="fc-progress">Carte 1/${ROUNDS}</span></div>
    <div class="staff-wrap">
      <svg id="fc-staff" viewBox="0 0 220 180" class="staff-svg">
        <g stroke="#18233f" stroke-width="2">
          <line x1="20" y1="40" x2="200" y2="40" />
          <line x1="20" y1="60" x2="200" y2="60" />
          <line x1="20" y1="80" x2="200" y2="80" />
          <line x1="20" y1="100" x2="200" y2="100" />
          <line x1="20" y1="120" x2="200" y2="120" />
        </g>
        <text x="20" y="128" font-size="70" fill="#18233f" font-family="serif">𝄞</text>
        <g id="fc-ledger"></g>
        <ellipse id="fc-note" cx="150" cy="80" rx="11" ry="8" fill="#ff6b9d" stroke="#18233f" stroke-width="2" />
      </svg>
    </div>
    <div id="fc-feedback" class="feedback"></div>
    <div id="fc-keyboard" class="keyboard-keys"></div>
  `;

  const keyboardEl = container.querySelector('#fc-keyboard');
  NOTES.forEach((n) => {
    const btn = document.createElement('button');
    btn.className = 'piano-key';
    btn.dataset.letter = n.letter;
    btn.dataset.octave = n.octave;
    keyboardEl.appendChild(btn);
  });

  function showRound() {
    const note = order[index];
    container.querySelector('#fc-progress').textContent = `Carte ${index + 1}/${ROUNDS}`;
    container.querySelector('#fc-note').setAttribute('cy', note.y);
    const ledgerG = container.querySelector('#fc-ledger');
    ledgerG.innerHTML = note.ledger
      ? `<line x1="136" y1="${note.y}" x2="164" y2="${note.y}" stroke="#18233f" stroke-width="2" />`
      : '';
    container.querySelector('#fc-feedback').textContent = '';
    container.querySelectorAll('.piano-key').forEach((k) => (k.className = 'piano-key'));
    locked = false;
  }

  keyboardEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.piano-key');
    if (!btn || locked) return;
    locked = true;
    const note = order[index];
    const isRight = btn.dataset.letter === note.letter && Number(btn.dataset.octave) === note.octave;
    playTone(note.freq);
    const feedback = container.querySelector('#fc-feedback');
    if (isRight) {
      correct++;
      btn.classList.add('correct');
      feedback.textContent = `✅ Bravo, c'était un ${note.name} !`;
      feedback.className = 'feedback ok';
    } else {
      btn.classList.add('wrong');
      const rightBtn = [...keyboardEl.children].find(
        (k) => k.dataset.letter === note.letter && Number(k.dataset.octave) === note.octave
      );
      if (rightBtn) rightBtn.classList.add('correct');
      feedback.textContent = `❌ C'était en fait un ${note.name}.`;
      feedback.className = 'feedback bad';
    }
    setTimeout(() => {
      index++;
      if (index < ROUNDS) {
        showRound();
      } else {
        finish();
      }
    }, 900);
  });

  function finish() {
    const stars = starsFor(correct);
    container.innerHTML = `
      <div class="quest-summary">
        <h2>🎉 Quête terminée !</h2>
        <p>${correct}/${ROUNDS} notes bien reconnues</p>
        <div class="stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
        <button id="fc-continue" class="btn-primary">Continuer l'aventure</button>
      </div>
    `;
    container.querySelector('#fc-continue').addEventListener('click', () => {
      onComplete({ stars, xp: correct * 10 });
    });
  }

  showRound();
}
