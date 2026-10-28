import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const rules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8');
const authContext = await readFile(new URL('../src/firebase/authContext.tsx', import.meta.url), 'utf8');
const tripModal = await readFile(new URL('../src/components/TripModal.tsx', import.meta.url), 'utf8');
const joinModal = await readFile(new URL('../src/components/JoinTripModal.tsx', import.meta.url), 'utf8');
const service = await readFile(new URL('../src/firebase/service.ts', import.meta.url), 'utf8');

test('trip reads and writes require Firebase-authenticated membership', () => {
  assert.match(rules, /allow get: if isValidId\(tripId\) && isTripMember\(resource\.data\)/);
  assert.match(rules, /allow list: if request\.auth != null[\s\S]*?resource\.data\.memberUids\.hasAny\(\[request\.auth\.uid\]\)/);
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
  assert.match(rules, /incoming\(\)\.diff\(existing\(\)\)\.affectedKeys\(\)\.hasOnly\(\['members', 'memberUids', 'joinCodeAttempt'\]\)/);
  assert.doesNotMatch(rules, /isTripMember\(existing\(\)\)\s*&&\s*incoming\(\)\.memberUids == existing\(\)\.memberUids/);
});

test('there is no public allow-all trip access rule', () => {
  assert.doesNotMatch(rules, /match \/trips\/\{tripId\}\s*\{[\s\S]{0,500}?allow (?:read|write): if true/);
});

test('authentication never trusts a cached or demo profile', () => {
  assert.doesNotMatch(authContext, /rupeesplit_persistent_user|loginAsDemoUser|loginAsDemo|demo.?user/i);
  assert.doesNotMatch(authContext, /localStorage\.(?:getItem|setItem)\(/);
  assert.match(authContext, /onAuthStateChanged\(auth,/);
  assert.match(authContext, /setUser\(null\)/);
});

test('new trip identities are collision-resistant and never reused by destination/name', () => {
  assert.match(tripModal, /crypto\.randomUUID\(\)/);
  assert.match(tripModal, /crypto\.getRandomValues\(new Uint8Array\(20\)\)/);
  assert.match(service, /query\(collection\(db, path\), where\('memberUids', 'array-contains', uid\)\)/);
});

test('joining accepts a complete private invite link, not public code lookup', () => {
  assert.match(joinModal, /Trip Invite Link/);
  assert.match(service, /const uid = auth\.currentUser\?\.uid/);
  assert.match(service, /incoming\(\)\.joinCodeAttempt/);
  assert.doesNotMatch(service, /where\(['"]inviteCode['"]/);
});
