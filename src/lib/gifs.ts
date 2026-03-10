/** Reaction GIFs shown on score entry and stats recalculate */
export const GIFS = {
  win: [
    "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
    "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  ],
  lose: [
    "https://media.giphy.com/media/3o7TKsQ8MJHyTASsRy/giphy.gif",
    "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif",
    "https://media.giphy.com/media/l0HlPwMAzhN2s2s2c/giphy.gif",
  ],
  mars: [
    "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
    "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
    "https://media.giphy.com/media/12uXi1GXBbrAL2/giphy.gif",
  ],
  scoreEntered: [
    "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  ],
} as const;

export function getRandomGif(key: keyof typeof GIFS): string {
  const list = GIFS[key];
  return list[Math.floor(Math.random() * list.length)];
}
