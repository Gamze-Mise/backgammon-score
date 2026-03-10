export const PLAYER_IDS = ["player1", "player2"] as const;
export type PlayerId = (typeof PLAYER_IDS)[number];

export function isValidPlayerId(id: string): id is PlayerId {
  return PLAYER_IDS.includes(id as PlayerId);
}
