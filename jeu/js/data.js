// Données du jeu : notes, questions Mozart, rythmes.

// Notes diatoniques de Do4 à Sol5, avec leur position verticale sur une
// portée de clé de sol (5 lignes espacées de 20px, ligne du haut = y:40)
// et leur fréquence (Hz) pour la synthèse audio.
export const NOTES = [
  { name: 'Do', letter: 'C', octave: 4, y: 140, ledger: true, freq: 261.63 },
  { name: 'Ré', letter: 'D', octave: 4, y: 130, freq: 293.66 },
  { name: 'Mi', letter: 'E', octave: 4, y: 120, freq: 329.63 },
  { name: 'Fa', letter: 'F', octave: 4, y: 110, freq: 349.23 },
  { name: 'Sol', letter: 'G', octave: 4, y: 100, freq: 392.0 },
  { name: 'La', letter: 'A', octave: 4, y: 90, freq: 440.0 },
  { name: 'Si', letter: 'B', octave: 4, y: 80, freq: 493.88 },
  { name: 'Do', letter: 'C', octave: 5, y: 70, freq: 523.25 },
  { name: 'Ré', letter: 'D', octave: 5, y: 60, freq: 587.33 },
  { name: 'Mi', letter: 'E', octave: 5, y: 50, freq: 659.25 },
  { name: 'Fa', letter: 'F', octave: 5, y: 40, freq: 698.46 },
  { name: 'Sol', letter: 'G', octave: 5, y: 30, freq: 783.99 },
];

export const MOZART_QUESTIONS = [
  {
    q: "Dans quel pays est né Mozart ?",
    choices: ["L'Autriche", "La France", "L'Allemagne", "L'Italie"],
    answer: 0,
  },
  {
    q: "À quel âge Mozart a-t-il commencé à composer de la musique ?",
    choices: ["18 ans", "12 ans", "5 ans", "25 ans"],
    answer: 2,
  },
  {
    q: "Quel est le prénom complet de Mozart ?",
    choices: [
      "Wolfgang Amadeus Mozart",
      "Ludwig Amadeus Mozart",
      "Wolfgang Frédéric Mozart",
      "Johann Amadeus Mozart",
    ],
    answer: 0,
  },
  {
    q: "En plus du piano, quel instrument Mozart jouait-il déjà enfant ?",
    choices: ["La guitare", "Le violon", "La flûte", "Le tambour"],
    answer: 1,
  },
  {
    q: "Comment s'appelle ce célèbre opéra de Mozart avec un instrument magique ?",
    choices: ["Carmen", "Le Barbier de Séville", "La Flûte enchantée", "La Traviata"],
    answer: 2,
  },
  {
    q: "À quelle période musicale appartient Mozart ?",
    choices: ["Baroque", "Classique", "Romantique", "Moderne"],
    answer: 1,
  },
];

// Motifs rythmiques sur 2 temps.
// onsets = instants (en temps) où l'on entend un son.
export const RHYTHM_PATTERNS = [
  { id: 'QQ', label: '♩ ♩', name: 'noire - noire', onsets: [0, 1] },
  { id: 'QE', label: '♩ ♫', name: 'noire - deux croches', onsets: [0, 1, 1.5] },
  { id: 'EQ', label: '♫ ♩', name: 'deux croches - noire', onsets: [0, 0.5, 1] },
  { id: 'EE', label: '♫ ♫', name: 'deux croches - deux croches', onsets: [0, 0.5, 1, 1.5] },
];

export const QUESTS = [
  {
    id: 'flashcards',
    name: 'Les Notes Mystères',
    icon: '🎼',
    x: 140,
    y: 190,
    color: '#ff6b9d',
    companion: { emoji: '🐰', name: 'Doremi le Lapin' },
  },
  {
    id: 'mozart',
    name: 'Le Secret de Mozart',
    icon: '🎻',
    x: 460,
    y: 190,
    color: '#a259ff',
    companion: { emoji: '🦉', name: 'Wolfy la Chouette' },
  },
  {
    id: 'rhythm',
    name: 'La Cabane du Rythme',
    icon: '🥁',
    x: 300,
    y: 700,
    color: '#ffb703',
    companion: { emoji: '🐬', name: 'Tempo le Dauphin' },
  },
];

export const AVATARS = ['👦🏻', '👧🏻', '👦🏽', '👧🏽', '👦🏿', '👧🏿'];
