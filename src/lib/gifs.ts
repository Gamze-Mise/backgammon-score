/** Reaction GIFs shown on score entry and stats recalculate */
export const GIFS = {
  win: [
    "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
    "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
    "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  ],
  mars: [
    "https://media.giphy.com/media/12uXi1GXBbrAL2/giphy.gif",
    "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
    "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
    "https://media.giphy.com/media/12uXi1GXBbrAL2/giphy.gif",
    "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
    "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
  ],
  scoreEntered: [
    "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
    "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
  ],
} as const;

const previousByKey: Partial<Record<keyof typeof GIFS, string>> = {};

export function getRandomGif(key: keyof typeof GIFS): string {
  const list = GIFS[key];
  const previous = previousByKey[key];
  let next = list[Math.floor(Math.random() * list.length)];
  while (next === previous) {
    next = list[Math.floor(Math.random() * list.length)];
  }
  previousByKey[key] = next;
  return next;
}
