import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { simplifyDebts } from './settlement';
import type { Member, MemberBalance } from '../types';

const members: Member[] = [
  { id: 'a', name: 'A', upiId: '', avatarColor: '', initials: 'A' },
  { id: 'b', name: 'B', upiId: '', avatarColor: '', initials: 'B' },
  { id: 'c', name: 'C', upiId: '', avatarColor: '', initials: 'C' },
];

function balances(entries: Array<[string, number]>): Record<string, MemberBalance> {
  return Object.fromEntries(entries.map(([memberId, netBalance]) => [memberId, {
    memberId, totalPaid: 0, totalOwed: 0, kittyContributed: 0, netBalance,
  }]));
}

describe('simplifyDebts', () => {
  it('preserves one-paise balances without rounding to whole rupees', () => {
    const result = simplifyDebts(members, balances([['a', -0.01], ['b', 0.01]]));
    assert.equal(result.length, 1);
    assert.equal(result[0].amount, 0.01);
    assert.equal(result[0].fromMemberId, 'a');
    assert.equal(result[0].toMemberId, 'b');
  });

  it('conserves total debtor and creditor amounts in paise', () => {
    const result = simplifyDebts(members, balances([
      ['a', -10.25], ['b', -4.10], ['c', 14.35],
    ]));
    const paid = result.reduce((sum, item) => sum + Math.round(item.amount * 100), 0);
    assert.equal(paid, 1435);
    assert.equal(result.reduce((sum, item) => sum + Math.round(item.amount * 100), 0), 1435);
  });

  it('does not create transfers for balanced members', () => {
    assert.deepEqual(simplifyDebts(members, balances([['a', 0], ['b', 0], ['c', 0]])), []);
  });

  it('settles multiple debtors without exceeding a creditor balance', () => {
    const result = simplifyDebts(members, balances([
      ['a', -7.25], ['b', -2.75], ['c', 10],
    ]));
    assert.equal(result.length, 2);
    assert.equal(result.reduce((sum, item) => sum + item.amount, 0), 10);
    assert.ok(result.every((item) => item.amount > 0));
  });
});
