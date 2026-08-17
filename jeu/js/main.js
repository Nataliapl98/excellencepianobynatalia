import { QUESTS, AVATARS } from './data.js';
import { getProfile, saveProfile, getProgress, saveProgress, resetAll, levelFromXp, xpProgressInLevel } from './storage.js';
import { playSuccessJingle } from './audio.js';
import { renderFlashcards } from './quests/flashcards.js';
import { renderQuizMozart } from './quests/quizMozart.js';
import { renderRhythm } from './quests/rhythm.js';

const WORLD_W = 600;
const WORLD_H = 900;
const PLAYER_SPEED = 260; // px/s in world units
const QUEST_RADIUS = 70;
const NOTICE_RADIUS = 170;

const QUEST_RENDERERS = {
  flashcards: renderFlashcards,
  mozart: renderQuizMozart,
  rhythm: renderRhythm,
};

const screenCreate = document.getElementById('screen-create');
const screenMap = document.getElementById('screen-map');
const avatarGrid = document.getElementById('avatar-grid');
const createForm = document.getElementById('create-form');
const nameInput = document.getElementById('player-name');
const createStart = document.getElementById('create-start');

const canvas = document.getElementById('map-canvas');
const ctx = canvas.getContext('2d');
const interactBtn = document.getElementById('interact-btn');
const questModal = document.getElementById('quest-modal');
const questContent = document.getElementById('quest-content');
const questClose = document.getElementById('quest-close');
const rewardModal = document.getElementById('reward-modal');

const hudAvatar = document.getElementById('hud-avatar');
const hudName = document.getElementById('hud-name');
const hudLevel = document.getElementById('hud-level');
const hudXpFill = document.getElementById('hud-xpbar-fill');
const hudQuestCount = document.getElementById('hud-quest-count');
const hudCompanions = document.getElementById('hud-companions');
const hudReset = document.getElementById('hud-reset');

let selectedAvatar = null;
let profile = getProfile();
let progress = getProgress();

// ---------- Écran de création de personnage ----------

AVATARS.forEach((emoji) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'avatar-choice';
  btn.textContent = emoji;
  btn.addEventListener('click', () => {
    avatarGrid.querySelectorAll('.avatar-choice').forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedAvatar = emoji;
    updateCreateButton();
  });
  avatarGrid.appendChild(btn);
});

function updateCreateButton() {
  createStart.disabled = !(nameInput.value.trim().length > 0 && selectedAvatar);
}
nameInput.addEventListener('input', updateCreateButton);

createForm.addEventListener('submit', (e) => {
  e.preventDefault();
  profile = { name: nameInput.value.trim().slice(0, 18), avatar: selectedAvatar };
  saveProfile(profile);
  startMap();
});

function goToCreate() {
  screenCreate.classList.add('active');
  screenMap.classList.remove('active');
}

// ---------- HUD ----------

function updateHud() {
  hudAvatar.textContent = profile.avatar;
  hudName.textContent = profile.name;
  const level = levelFromXp(progress.xp);
  hudLevel.textContent = `Niveau ${level}`;
  hudXpFill.style.width = `${(xpProgressInLevel(progress.xp) / 50) * 100}%`;
  const completed = QUESTS.filter((q) => progress.quests[q.id]?.completed).length;
  hudQuestCount.textContent = `${completed}/${QUESTS.length} quêtes`;
  hudCompanions.innerHTML = progress.companions.length
    ? progress.companions.map((c) => `<span class="companion-chip" title="${c.name}">${c.emoji}</span>`).join('')
    : '<span class="companion-hint">Aucun compagnon pour l\'instant</span>';
}

hudReset.addEventListener('click', () => {
  if (confirm('Réinitialiser toute la progression et recommencer une nouvelle aventure ?')) {
    resetAll();
    location.reload();
  }
});

// ---------- Carte / déplacement ----------

let dpr = Math.max(1, window.devicePixelRatio || 1);
function resizeCanvas() {
  dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = WORLD_W * dpr;
  canvas.height = WORLD_H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeCanvas);

const player = { x: 300, y: 520 };
const activeDirs = new Set();
let activeQuest = null;
let paused = false;

const KEY_DIR = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
};

window.addEventListener('keydown', (e) => {
  if (KEY_DIR[e.key]) activeDirs.add(KEY_DIR[e.key]);
  if ((e.key === ' ' || e.key === 'Enter') && activeQuest && !paused) {
    e.preventDefault();
    openQuest(activeQuest);
  }
});
window.addEventListener('keyup', (e) => {
  if (KEY_DIR[e.key]) activeDirs.delete(KEY_DIR[e.key]);
});

document.querySelectorAll('#touch-controls button[data-dir]').forEach((btn) => {
  const dir = btn.dataset.dir;
  const add = (e) => {
    e.preventDefault();
    activeDirs.add(dir);
  };
  const remove = () => activeDirs.delete(dir);
  btn.addEventListener('pointerdown', add);
  btn.addEventListener('pointerup', remove);
  btn.addEventListener('pointerleave', remove);
  btn.addEventListener('pointercancel', remove);
});

interactBtn.addEventListener('click', () => {
  if (activeQuest && !paused) openQuest(activeQuest);
});

// Décor précalculé (statique) pour ne pas scintiller à chaque frame.
const decor = Array.from({ length: 40 }, () => ({
  x: Math.random() * WORLD_W,
  y: Math.random() * WORLD_H,
  r: 2 + Math.random() * 3,
  color: Math.random() > 0.5 ? '#ffe08a' : '#ffffff',
}));
const trees = [
  ...Array.from({ length: 10 }, (_, i) => ({ x: 15 + (i % 2) * 18, y: 30 + i * 90, scale: 0.9 + Math.random() * 0.3 })),
  ...Array.from({ length: 10 }, (_, i) => ({ x: 585 - (i % 2) * 18, y: 30 + i * 90, scale: 0.9 + Math.random() * 0.3 })),
];

function drawTree(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(-4, 5, 8, 14);
  ctx.fillStyle = '#3f9142';
  ctx.beginPath();
  ctx.arc(0, -6, 16, 0, Math.PI * 2);
  ctx.arc(-11, 2, 13, 0, Math.PI * 2);
  ctx.arc(11, 2, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPath() {
  const hub = { x: 300, y: 440 };
  const points = [
    [140, 190],
    [460, 190],
    [300, 700],
    [300, 520],
  ];
  [46, 34].forEach((w, i) => {
    ctx.strokeStyle = i === 0 ? '#e0bd7d' : '#f6e3b4';
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    points.forEach(([px, py]) => {
      ctx.beginPath();
      ctx.moveTo(hub.x, hub.y);
      ctx.lineTo(px, py);
      ctx.stroke();
    });
  });
}

function drawBuilding(q) {
  const done = !!progress.quests[q.id]?.completed;
  const w = 120,
    h = 90;
  ctx.save();
  ctx.translate(q.x, q.y);
  // ombre
  ctx.beginPath();
  ctx.ellipse(0, h / 2 + 6, w / 2.4, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fill();
  // corps
  ctx.fillStyle = q.color;
  roundRect(ctx, -w / 2, -h / 2 + 16, w, h - 16, 14);
  ctx.fill();
  // toit
  ctx.beginPath();
  ctx.moveTo(-w / 2 - 10, -h / 2 + 16);
  ctx.lineTo(0, -h / 2 - 30);
  ctx.lineTo(w / 2 + 10, -h / 2 + 16);
  ctx.closePath();
  ctx.fillStyle = shade(q.color, -20);
  ctx.fill();
  // icone
  ctx.font = '38px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(q.icon, 0, 4);
  ctx.restore();

  // badge complété / point d'exclamation
  if (done) {
    ctx.save();
    ctx.translate(q.x + w / 2 - 6, q.y - h / 2 + 10);
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#2ecc71';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓', 0, 1);
    ctx.restore();
  } else {
    const bounce = Math.sin(performance.now() / 220) * 5;
    ctx.save();
    ctx.translate(q.x, q.y - h / 2 - 26 + bounce);
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#18233f';
    ctx.lineWidth = 4;
    ctx.strokeText('!', 0, 0);
    ctx.fillText('!', 0, 0);
    ctx.restore();
  }

  // étiquette du nom
  ctx.save();
  ctx.font = 'bold 15px "Baloo 2", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#18233f';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.strokeText(q.name, q.x, q.y + h / 2 + 20);
  ctx.fillText(q.name, q.x, q.y + h / 2 + 20);
  ctx.restore();
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.beginPath();
  ctx.ellipse(0, 20, 20, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#18233f';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.font = '28px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(profile.avatar, 0, 2);
  ctx.restore();

  ctx.save();
  ctx.font = 'bold 13px "Baloo 2", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#18233f';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeText(profile.name, player.x, player.y + 40);
  ctx.fillText(profile.name, player.x, player.y + 40);
  ctx.restore();
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function shade(hex, percent) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + percent));
  const b = Math.min(255, Math.max(0, (n & 0xff) + percent));
  return `rgb(${r},${g},${b})`;
}

function draw() {
  ctx.clearRect(0, 0, WORLD_W, WORLD_H);
  const grad = ctx.createLinearGradient(0, 0, 0, WORLD_H);
  grad.addColorStop(0, '#a3e685');
  grad.addColorStop(1, '#6fc451');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);

  decor.forEach((d) => {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fillStyle = d.color;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  drawPath();
  trees.forEach((t) => drawTree(t.x, t.y, t.scale));
  QUESTS.forEach((q) => drawBuilding(q));
  drawPlayer();
}

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  if (!paused) {
    let vx = 0,
      vy = 0;
    if (activeDirs.has('up')) vy -= 1;
    if (activeDirs.has('down')) vy += 1;
    if (activeDirs.has('left')) vx -= 1;
    if (activeDirs.has('right')) vx += 1;
    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy);
      player.x += (vx / len) * PLAYER_SPEED * dt;
      player.y += (vy / len) * PLAYER_SPEED * dt;
      player.x = Math.max(40, Math.min(WORLD_W - 40, player.x));
      player.y = Math.max(40, Math.min(WORLD_H - 40, player.y));
    }

    let nearest = null;
    let nearestDist = Infinity;
    QUESTS.forEach((q) => {
      const dist = Math.hypot(q.x - player.x, q.y - player.y);
      if (dist < NOTICE_RADIUS && dist < nearestDist) {
        nearest = q;
        nearestDist = dist;
      }
    });
    if (nearest && nearestDist < QUEST_RADIUS) {
      activeQuest = nearest;
      const done = !!progress.quests[nearest.id]?.completed;
      interactBtn.textContent = done ? `🔁 Rejouer : ${nearest.name}` : `🚪 Commencer : ${nearest.name}`;
      interactBtn.classList.remove('hidden');
    } else {
      activeQuest = null;
      interactBtn.classList.add('hidden');
    }
  }

  draw();
  requestAnimationFrame(loop);
}

// ---------- Quêtes ----------

function openQuest(quest) {
  paused = true;
  questContent.innerHTML = '';
  questModal.classList.remove('hidden');

  const alreadyDone = !!progress.quests[quest.id]?.completed;
  const renderer = QUEST_RENDERERS[quest.id];

  renderer(questContent, {
    onComplete: ({ stars, xp }) => {
      const prevBest = progress.quests[quest.id]?.stars || 0;
      progress.quests[quest.id] = { completed: true, stars: Math.max(prevBest, stars) };
      if (!alreadyDone) {
        progress.xp += xp;
        if (!progress.companions.find((c) => c.emoji === quest.companion.emoji)) {
          progress.companions.push(quest.companion);
        }
        saveProgress(progress);
        updateHud();
        closeQuestModal();
        showReward(quest, stars, xp);
      } else {
        progress.xp += Math.round(xp / 4);
        saveProgress(progress);
        updateHud();
        closeQuestModal();
      }
    },
  });
}

function closeQuestModal() {
  questModal.classList.add('hidden');
  paused = false;
}

questClose.addEventListener('click', closeQuestModal);

function showReward(quest, stars, xp) {
  playSuccessJingle();
  rewardModal.innerHTML = `
    <div class="modal-inner reward-inner">
      <h2>🏆 Quête accomplie !</h2>
      <p class="reward-quest-name">${quest.name}</p>
      <div class="stars big">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      <p class="reward-xp">+${xp} XP</p>
      <div class="reward-companion">
        <div class="companion-emoji">${quest.companion.emoji}</div>
        <p>Tu as trouvé un nouveau compagnon :<br /><strong>${quest.companion.name}</strong> !</p>
      </div>
      <button id="reward-continue" class="btn-primary">Retour à la carte</button>
    </div>
  `;
  rewardModal.classList.remove('hidden');
  document.getElementById('reward-continue').addEventListener('click', () => {
    rewardModal.classList.add('hidden');
  });
}

// ---------- Démarrage ----------

function startMap() {
  screenCreate.classList.remove('active');
  screenMap.classList.add('active');
  resizeCanvas();
  updateHud();
  requestAnimationFrame(loop);
}

if (profile) {
  startMap();
} else {
  goToCreate();
}
