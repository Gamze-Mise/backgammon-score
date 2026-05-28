export const GIFS = {
  // Special result reactions (gammon).
  mars: [
    "https://i.giphy.com/media/12uXi1GXBbrAL2/giphy.gif", // wow
    "https://i.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif",
    "https://i.giphy.com/media/5GoVLqeAOo6PK/giphy.gif",
    "https://i.giphy.com/media/111ebonMs90YLu/giphy.gif",
    "https://i.giphy.com/media/l0Exk8EUzSLsrErEQ/giphy.gif",
    "https://i.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif",
  ],
  // “Saved” reactions should be quick and upbeat.
  scoreEntered: [
    "https://i.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "https://i.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
    "https://i.giphy.com/media/5GoVLqeAOo6PK/giphy.gif",
    "https://i.giphy.com/media/l0Exk8EUzSLsrErEQ/giphy.gif",
    "https://i.giphy.com/media/111ebonMs90YLu/giphy.gif",
    "https://i.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
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
