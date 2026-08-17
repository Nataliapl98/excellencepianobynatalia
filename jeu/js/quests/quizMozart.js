import { MOZART_QUESTIONS } from '../data.js';

function starsFor(correct, total) {
  const ratio = correct / total;
  if (ratio >= 1) return 3;
  if (ratio >= 0.66) return 2;
  if (ratio >= 0.33) return 1;
  return 0;
}

export function renderQuizMozart(container, { onComplete }) {
  let index = 0;
  let correct = 0;
  let locked = false;
  const total = MOZART_QUESTIONS.length;

  function showQuestion() {
    const item = MOZART_QUESTIONS[index];
    locked = false;
    container.innerHTML = `
      <h2 class="quest-title">🎻 Le Secret de Mozart</h2>
      <div class="quest-progress"><span>Question ${index + 1}/${total}</span></div>
      <p class="quiz-question">${item.q}</p>
      <div class="quiz-choices">
        ${item.choices
          .map((c, i) => `<button class="quiz-choice" data-i="${i}">${c}</button>`)
          .join('')}
      </div>
      <div id="mz-feedback" class="feedback"></div>
    `;
    container.querySelectorAll('.quiz-choice').forEach((btn) => {
      btn.addEventListener('click', () => onAnswer(Number(btn.dataset.i)));
    });
  }

  function onAnswer(i) {
    if (locked) return;
    locked = true;
    const item = MOZART_QUESTIONS[index];
    const buttons = container.querySelectorAll('.quiz-choice');
    const feedback = container.querySelector('#mz-feedback');
    if (i === item.answer) {
      correct++;
      buttons[i].classList.add('correct');
      feedback.textContent = '✅ Exact !';
      feedback.className = 'feedback ok';
    } else {
      buttons[i].classList.add('wrong');
      buttons[item.answer].classList.add('correct');
      feedback.textContent = '❌ Pas tout à fait...';
      feedback.className = 'feedback bad';
    }
    setTimeout(() => {
      index++;
      if (index < total) {
        showQuestion();
      } else {
        finish();
      }
    }, 1000);
  }

  function finish() {
    const stars = starsFor(correct, total);
    container.innerHTML = `
      <div class="quest-summary">
        <h2>🎉 Quête terminée !</h2>
        <p>${correct}/${total} bonnes réponses</p>
        <div class="stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
        <button id="mz-continue" class="btn-primary">Continuer l'aventure</button>
      </div>
    `;
    container.querySelector('#mz-continue').addEventListener('click', () => {
      onComplete({ stars, xp: correct * 10 });
    });
  }

  showQuestion();
}
