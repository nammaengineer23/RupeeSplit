import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

const projectId = 'rupeesplit-rules-test';
const rules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8');
const env = await initializeTestEnvironment({
  projectId,
  firestore: { rules },
});

const owner = env.authenticatedContext('owner-uid').firestore();
const member = env.authenticatedContext('member-uid', { email: 'member@example.com' }).firestore();
const outsider = env.authenticatedContext('outsider-uid').firestore();
const unauthenticated = env.unauthenticatedContext().firestore();

const tripId = 'trip-security-test';
const inviteCode = 'ABCDEFGHJKLMNPQRSTUV';
const ownerMember = { id: 'owner-uid', name: 'Owner', upiId: '', avatarColor: '', initials: 'O' };
const memberProfile = { id: 'member-uid', name: 'Member', upiId: '', avatarColor: '', initials: 'M', email: 'member@example.com' };
const trip = {
  id: tripId,
  name: 'Private Test Trip',
  destination: 'Bengaluru',
  startDate: '2026-10-28',
  endDate: '2026-10-29',
  currency: 'INR',
  members: [ownerMember],
  inviteCode,
  ownerUid: 'owner-uid',
  memberUids: ['owner-uid'],
  createdAt: 1793145600000,
};

test('Firestore rules enforce private trip ownership and invite redemption', async (t) => {
  t.after(async () => env.cleanup());

  // Authenticated owner can create a uniquely identified private trip.
  await assertSucceeds(setDoc(doc(owner, 'trips', tripId), trip));

  // The same trip document ID cannot be claimed by a different owner.
  await assertFails(setDoc(doc(outsider, 'trips', tripId), {
    ...trip, ownerUid: 'outsider-uid', memberUids: ['outsider-uid'],
  }));

  // No unauthenticated or unrelated-user trip discovery/read.
  await assertFails(getDoc(doc(unauthenticated, 'trips', tripId)));
  await assertFails(getDocs(collection(unauthenticated, 'trips')));
  await assertFails(getDoc(doc(outsider, 'trips', tripId)));
  await assertFails(getDocs(query(collection(outsider, 'trips'), where('inviteCode', '==', inviteCode))));

  // Outsiders cannot read or write expense records before redemption.
  await assertFails(setDoc(doc(outsider, 'trips', tripId, 'expenses', 'expense-1'), {
    id: 'expense-1', tripId, title: 'Private', amount: 100, category: 'Food & Drinks',
    date: '2026-10-28', paidBy: { type: 'SINGLE', singlePayerId: 'owner-uid' },
    splitType: 'EQUAL', splits: [{ memberId: 'owner-uid', amount: 100 }], createdAt: 1,
  }));
  await assertFails(getDocs(collection(outsider, 'trips', tripId, 'kitty')));
  await assertFails(getDocs(collection(outsider, 'trips', tripId, 'settlements')));
  await assertFails(getDocs(collection(outsider, 'trips', tripId, 'itinerary')));

  // The invite secret grants only the authenticated account's own membership.
  await assertSucceeds(updateDoc(doc(member, 'trips', tripId), {
    memberUids: arrayUnion('member-uid'),
    members: arrayUnion(memberProfile),
    joinCodeAttempt: inviteCode,
  }));
  await assertSucceeds(getDoc(doc(member, 'trips', tripId)));
  await assertSucceeds(getDocs(query(collection(member, 'trips'), where('memberUids', 'array-contains', 'member-uid'))));

  // A member cannot edit trip settings or alter the trip while redeeming an invite.
  await assertFails(updateDoc(doc(member, 'trips', tripId), { name: 'Hijacked trip' }));
  await assertFails(updateDoc(doc(outsider, 'trips', tripId), {
    name: 'Hijacked during join',
    memberUids: arrayUnion('outsider-uid'),
    members: arrayUnion({ id: 'outsider-uid', name: 'Outsider', upiId: '', avatarColor: '', initials: 'O' }),
    joinCodeAttempt: inviteCode,
  }));

  // A wrong token cannot add an unrelated account.
  await assertFails(updateDoc(doc(outsider, 'trips', tripId), {
    memberUids: arrayUnion('outsider-uid'),
    members: arrayUnion({ id: 'outsider-uid', name: 'Outsider', upiId: '', avatarColor: '', initials: 'O' }),
    joinCodeAttempt: 'WRONGWRONGWRONGWRONG',
  }));

  // Members can access child records; non-members cannot.
  await assertSucceeds(setDoc(doc(member, 'trips', tripId, 'expenses', 'expense-2'), {
    id: 'expense-2', tripId, title: 'Shared', amount: 25, category: 'Food & Drinks',
    date: '2026-10-28', paidBy: { type: 'SINGLE', singlePayerId: 'member-uid' },
    splitType: 'EQUAL', splits: [{ memberId: 'member-uid', amount: 25 }], createdAt: 2,
  }));
  await assertFails(getDoc(doc(outsider, 'trips', tripId, 'expenses', 'expense-2')));
  await assertSucceeds(getDocs(collection(member, 'trips', tripId, 'expenses')));
  await assertSucceeds(getDocs(collection(member, 'trips', tripId, 'kitty')));
  await assertSucceeds(getDocs(collection(member, 'trips', tripId, 'settlements')));
  await assertSucceeds(getDocs(collection(member, 'trips', tripId, 'itinerary')));
});
