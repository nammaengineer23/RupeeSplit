import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const rules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8');

test('trip reads and writes require Firebase-authenticated membership', () => {
  assert.match(rules, /allow get: if isValidId\(tripId\) && isTripMember\(resource\.data\)/);
  assert.match(rules, /allow list: if request\.auth != null[\s\S]*?request\.auth\.uid in resource\.data\.memberUids/);
  assert.match(rules, /incoming\(\)\.ownerUid == request\.auth\.uid/);
  assert.match(rules, /allow delete: if request\.auth != null && existing\(\)\.ownerUid == request\.auth\.uid/);
});

test('trip subcollections inherit membership checks', () => {
  assert.ok((rules.match(/canAccessTrip\(tripId\)/g) || []).length >= 12);
  assert.match(rules, /function canAccessTrip\(tripId\)[\s\S]*?isTripMember\(get\([\s\S]*?\)\.data\)/);
});

test('invite redemption requires the secret token and adds only the signed-in user', () => {
  assert.match(rules, /incoming\(\)\.joinCodeAttempt == existing\(\)\.inviteCode/);
  assert.match(rules, /request\.auth\.uid in incoming\(\)\.memberUids/);
  assert.match(rules, /incoming\(\)\.members\[incoming\(\)\.members\.size\(\) - 1\]\.id == request\.auth\.uid/);
});

test('there is no public allow-all trip access rule', () => {
  assert.doesNotMatch(rules, /match \/trips\/\{tripId\}\s*\{[\s\S]{0,500}?allow (?:read|write): if true/);
});
