import { afterEach, describe, expect, it } from 'vitest';
import { pluralCategories } from '@/shared/core';
import { cellKeyOf, splitCellKey, useEdits } from './editsStore';
import { editsToChanges } from './changes';

afterEach(() => useEdits.getState().reset());

describe('editsStore / changes', () => {
  it('cellKey roundtrip сохраняет langCode с дефисом (pt-BR)', () => {
    const k = cellKeyOf('key-1', 'pt-BR');
    expect(splitCellKey(k)).toEqual({ keyId: 'key-1', langCode: 'pt-BR' });
  });

  it('set/remove/reset ведут счётчик правок', () => {
    const s = useEdits.getState();
    s.setEdit(cellKeyOf('k1', 'ru'), { value: 'x' });
    s.setEdit(cellKeyOf('k2', 'de'), { value: 'y' });
    expect(Object.keys(useEdits.getState().edits)).toHaveLength(2);
    useEdits.getState().removeEdit(cellKeyOf('k1', 'ru'));
    expect(Object.keys(useEdits.getState().edits)).toHaveLength(1);
    useEdits.getState().reset();
    expect(Object.keys(useEdits.getState().edits)).toHaveLength(0);
  });

  it('editsToChanges различает value (strings) и plural', () => {
    const changes = editsToChanges({
      'k1:ru': { value: 'привет' },
      'k2:ar': { plural: { one: 'one', other: 'other' } },
    });
    expect(changes).toContainEqual({ keyId: 'k1', langCode: 'ru', value: 'привет' });
    expect(changes).toContainEqual({ keyId: 'k2', langCode: 'ar', plural: { one: 'one', other: 'other' } });
  });

  it('pluralCategories: en → one/other, ru включает few/many', () => {
    expect(pluralCategories('en')).toEqual(['one', 'other']);
    const ru = pluralCategories('ru');
    expect(ru).toContain('few');
    expect(ru).toContain('many');
    expect(ru[ru.length - 1]).toBe('other');
  });
});
