import { describe, expect, test } from 'vitest';
import { addGameRecord, parseGameHistory, type LocalGameRecord } from '../../../src/lib/gameHistory';

function record(id: string): LocalGameRecord {
  return {
    id,
    mode: 'pvp-local',
    opponent: 'Jogador local',
    result: 'abandono',
    moves: ['e2e4'],
    finalFen: 'fen',
    finishedAt: '2026-06-08T12:00:00.000Z',
  };
}

describe('gameHistory', () => {
  test('ignora JSON inválido e estruturas fora do contrato', () => {
    expect(parseGameHistory('{')).toEqual([]);
    expect(parseGameHistory(JSON.stringify([{ id: 1 }]))).toEqual([]);
  });

  test('aceita registros válidos', () => {
    expect(parseGameHistory(JSON.stringify([record('1')]))).toEqual([record('1')]);
  });

  test('move registro repetido para o topo sem duplicar', () => {
    expect(addGameRecord([record('1'), record('2')], record('2')).map(({ id }) => id)).toEqual(['2', '1']);
  });

  test('mantém somente os cem registros mais recentes', () => {
    const records = Array.from({ length: 100 }, (_, index) => record(String(index)));
    const result = addGameRecord(records, record('novo'));
    expect(result).toHaveLength(100);
    expect(result[0].id).toBe('novo');
    expect(result.some(({ id }) => id === '99')).toBe(false);
  });
});

test('retorna vazio para valor nulo e para JSON que não é lista', () => {
  expect(parseGameHistory(null)).toEqual([]);
  expect(parseGameHistory('{}')).toEqual([]);
});

test('remove registros inválidos em cada campo do contrato', () => {
  const base = record('ok');
  const invalidos = [
    null,
    { ...base, id: 1 },
    { ...base, mode: 'online' },
    { ...base, opponent: 1 },
    { ...base, result: 'vitoria' },
    { ...base, moves: [1] },
    { ...base, finalFen: 1 },
    { ...base, finishedAt: 1 },
  ];
  expect(parseGameHistory(JSON.stringify([base, ...invalidos]))).toEqual([base]);
});
