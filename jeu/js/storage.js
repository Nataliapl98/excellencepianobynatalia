// Sauvegarde locale (localStorage) du profil et de la progression.

const PROFILE_KEY = 'epn_game_profile';
const PROGRESS_KEY = 'epn_game_progress';

export function getProfile() {
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getProgress() {
  const raw = localStorage.getItem(PROGRESS_KEY);
  if (raw) return JSON.parse(raw);
  return { xp: 0, quests: {}, companions: [] };
}

export function saveProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function resetAll() {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(PROGRESS_KEY);
}

export function levelFromXp(xp) {
  return Math.floor(xp / 50) + 1;
}

export function xpProgressInLevel(xp) {
  return xp % 50;
}
