import { RHYTHM_PATTERNS } from '../data.js';
import { playRhythmPattern } from '../audio.js';

const ROUNDS = 5;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function starsFor(correct) {
  if (correct >= 5) return 3;
  if (correct >= 4) return 2;
  if (correct >= 2) return 1;
  return 0;
}

function pickSequence() {
  const seq = [];
  let last = null;
  for (let i = 0; i < ROUNDS; i++) {
    let choice;
    do {
      choice = RHYTHM_PATTERNS[Math.floor(Math.random() * RHYTHM_PATTERNS.length)];
    } while (choice.id === last && RHYTHM_PATTERNS.length > 1);
    last = choice.id;
    seq.push(choice);
  }
  return seq;
}

export function renderRhythm(container, { onComplete }) {
  const sequence = pickSequence();
  let index = 0;
  let correct = 0;
  let locked = false;

  function showRound() {
    locked = true;
    const target = sequence[index];
    const choices = shuffle(RHYTHM_PATTERNS);
    container.innerHTML = `
      <h2 class="quest-title">🥁 La Cabane du Rythme</h2>
      <div class="quest-progress"><span>Rythme ${index + 1}/${ROUNDS}</span></div>
      <p class="quest-instructions">Écoute le rythme joué, puis retrouve-le parmi les choix !</p>
      <button id="rh-listen" class="listen-btn">🔊 Écouter le rythme</button>
      <div class="rhythm-choices">
        ${choices
          .map((c) => `<button class="rhythm-choice" data-id="${c.id}" disabled>${c.label}</button>`)
          .join('')}
      </div>
      <div id="rh-feedback" class="feedback"></div>
    `;

    const listenBtn = container.querySelector('#rh-listen');
    const choiceButtons = container.querySelectorAll('.rhythm-choice');

    function playIt() {
      listenBtn.classList.add('playing');
      const dur = playRhythmPattern(target.onsets, 0.5);
      setTimeout(() => listenBtn.classList.remove('playing'), dur);
    }

    listenBtn.addEventListener('click', playIt);
    setTimeout(playIt, 300);
    setTimeout(() => {
      locked = false;
      choiceButtons.forEach((b) => (b.disabled = false));
    }, 1300);

    choiceButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (locked) return;
        locked = true;
        const feedback = container.querySelector('#rh-feedback');
        const isRight = btn.dataset.id === target.id;
        if (isRight) {
          correct++;
          btn.classList.add('correct');
          feedback.textContent = `✅ Bravo, c'était bien "${target.name}" !`;
          feedback.className = 'feedback ok';
        } else {
          btn.classList.add('wrong');
          const rightBtn = [...choiceButtons].find((b) => b.dataset.id === target.id);
          if (rightBtn) rightBtn.classList.add('correct');
          feedback.textContent = `❌ C'était "${target.name}".`;
          feedback.className = 'feedback bad';
        }
        setTimeout(() => {
          index++;
          if (index < ROUNDS) {
            showRound();
          } else {
            finish();
          }
        }, 1100);
      });
    });
  }

  function finish() {
    const stars = starsFor(correct);
    container.innerHTML = `
      <div class="quest-summary">
        <h2>🎉 Quête terminée !</h2>
        <p>${correct}/${ROUNDS} rythmes bien reconnus</p>
        <div class="stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
        <button id="rh-continue" class="btn-primary">Continuer l'aventure</button>
      </div>
    `;
    container.querySelector('#rh-continue').addEventListener('click', () => {
      onComplete({ stars, xp: correct * 12 });
    });
  }

  showRound();
}
