export const GAME_HISTORY_KEY = 'cesuchess.game-history.v1';

export type GameMode = 'pvp-local' | 'bot';
export type GameResult = 'brancas' | 'pretas' | 'empate' | 'abandono';

export interface LocalGameRecord {
  id: string;
  mode: GameMode;
  opponent: string;
  result: GameResult;
  moves: string[];
  finalFen: string;
  finishedAt: string;
}

export function parseGameHistory(raw: string | null): LocalGameRecord[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isLocalGameRecord).slice(0, 100);
  } catch {
    return [];
  }
}

export function addGameRecord(
  records: LocalGameRecord[],
  record: LocalGameRecord
): LocalGameRecord[] {
  return [record, ...records.filter(({ id }) => id !== record.id)].slice(0, 100);
}

function isLocalGameRecord(value: unknown): value is LocalGameRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<LocalGameRecord>;
  return (
    typeof record.id === 'string' &&
    (record.mode === 'pvp-local' || record.mode === 'bot') &&
    typeof record.opponent === 'string' &&
    (record.result === 'brancas' ||
      record.result === 'pretas' ||
      record.result === 'empate' ||
      record.result === 'abandono') &&
    Array.isArray(record.moves) &&
    record.moves.every((move) => typeof move === 'string') &&
    typeof record.finalFen === 'string' &&
    typeof record.finishedAt === 'string'
  );
}
