import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  where,
  getDoc,
  arrayUnion,
  updateDoc,
} from 'firebase/firestore';
import { auth } from './config';
import { db, handleFirestoreError, OperationType } from './config';
import { Expense, GroupFundContribution, KittyContribution, Member, SettlementRecord, Trip, TripInvite, UserProfile } from '../types';
import { normalizePhone10 } from '../utils/invite';

/**
 * Subscribe to all trips in real-time
 */
export function subscribeToTrips(
  onUpdate: (trips: Trip[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'trips';
  const uid = auth.currentUser?.uid;
  if (!uid) {
    onUpdate([]);
    return () => {};
  }
  return onSnapshot(
    query(collection(db, path), where('memberUids', 'array-contains', uid)),
    (snapshot) => {
      const trips: Trip[] = [];
      snapshot.forEach((docSnap) => {
        trips.push(docSnap.data() as Trip);
      });
      trips.sort((a, b) => b.createdAt - a.createdAt);
      onUpdate(trips);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Subscribe to expenses for a specific trip in real-time
 */
export function subscribeToExpenses(
  tripId: string,
  onUpdate: (expenses: Expense[]) => void,
  onError?: (err: unknown) => void
) {
  if (!tripId || tripId === 'trip-goa-2026' || !auth.currentUser?.uid) {
    onUpdate([]);
    return () => {};
  }
  const path = `trips/${tripId}/expenses`;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const expenses: Expense[] = [];
      snapshot.forEach((docSnap) => {
        expenses.push(docSnap.data() as Expense);
      });
      expenses.sort((a, b) => b.createdAt - a.createdAt);
      onUpdate(expenses);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Subscribe to group fund cash pot contributions for a trip in real-time
 */
export function subscribeToGroupFund(
  tripId: string,
  onUpdate: (contributions: GroupFundContribution[]) => void,
  onError?: (err: unknown) => void
) {
  if (!tripId || tripId === 'trip-goa-2026' || !auth.currentUser?.uid) {
    onUpdate([]);
    return () => {};
  }
  const path = `trips/${tripId}/groupFund`;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: GroupFundContribution[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as GroupFundContribution);
      });
      if (items.length === 0) {
        // Fallback check for legacy kitty subcollection
        const legacyPath = `trips/${tripId}/kitty`;
        getDocs(collection(db, legacyPath))
          .then((legacySnap) => {
            if (!legacySnap.empty) {
              const legacyItems: GroupFundContribution[] = [];
              legacySnap.forEach((ds) => legacyItems.push(ds.data() as GroupFundContribution));
              legacyItems.sort((a, b) => b.createdAt - a.createdAt);
              onUpdate(legacyItems);
            } else {
              onUpdate([]);
            }
          })
          .catch(() => onUpdate([]));
        return;
      }
      items.sort((a, b) => b.createdAt - a.createdAt);
      onUpdate(items);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export const subscribeToKitty = subscribeToGroupFund;

/**
 * Subscribe to settlement records for a trip in real-time
 */
export function subscribeToSettlements(
  tripId: string,
  onUpdate: (settlements: SettlementRecord[]) => void,
  onError?: (err: unknown) => void
) {
  if (!tripId || tripId === 'trip-goa-2026' || !auth.currentUser?.uid) {
    onUpdate([]);
    return () => {};
  }
  const path = `trips/${tripId}/settlements`;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: SettlementRecord[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as SettlementRecord);
      });
      items.sort((a, b) => b.createdAt - a.createdAt);
      onUpdate(items);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Save or update a trip in Cloud Firestore
 */
export async function saveTripToCloud(trip: Trip): Promise<void> {
  if (trip.id === 'trip-goa-2026') return;
  const path = `trips/${trip.id}`;
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Sign in with Google before saving a trip.');
  const baseUids = trip.memberUids?.length ? trip.memberUids : [];
  const memberUids = Array.from(new Set([...baseUids, uid, ...(trip.ownerUid ? [trip.ownerUid] : [])]));
  const ownedTrip: Trip = {
    ...trip,
    ownerUid: trip.ownerUid || uid,
    memberUids,
  };
  if (ownedTrip.ownerUid !== uid && !memberUids.includes(uid)) {
    throw new Error('You do not have permission to save this trip.');
  }
  try {
    await setDoc(doc(db, 'trips', trip.id), ownedTrip);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save or update an expense in Cloud Firestore
 */
export async function saveExpenseToCloud(tripId: string, expense: Expense): Promise<void> {
  if (!tripId || tripId === 'trip-goa-2026' || !auth.currentUser?.uid) return;
  const path = `trips/${tripId}/expenses/${expense.id}`;
  try {
    await setDoc(doc(db, 'trips', tripId, 'expenses', expense.id), expense);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete an expense in Cloud Firestore
 */
export async function deleteExpenseFromCloud(tripId: string, expenseId: string): Promise<void> {
  if (!tripId || tripId === 'trip-goa-2026' || !auth.currentUser?.uid) return;
  const path = `trips/${tripId}/expenses/${expenseId}`;
  try {
    await deleteDoc(doc(db, 'trips', tripId, 'expenses', expenseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save a group fund contribution in Cloud Firestore
 */
export async function saveGroupFundContributionToCloud(
  tripId: string,
  contribution: GroupFundContribution
): Promise<void> {
  if (!tripId || tripId === 'trip-goa-2026' || !auth.currentUser?.uid) return;
  const path = `trips/${tripId}/groupFund/${contribution.id}`;
  try {
    await setDoc(doc(db, 'trips', tripId, 'groupFund', contribution.id), contribution);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export const saveKittyContributionToCloud = saveGroupFundContributionToCloud;

/**
 * Delete a group fund contribution from Cloud Firestore
 */
export async function deleteGroupFundContributionFromCloud(
  tripId: string,
  contributionId: string
): Promise<void> {
  if (!tripId || tripId === 'trip-goa-2026' || !auth.currentUser?.uid) return;
  const path = `trips/${tripId}/groupFund/${contributionId}`;
  try {
    await deleteDoc(doc(db, 'trips', tripId, 'groupFund', contributionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export const deleteKittyContributionFromCloud = deleteGroupFundContributionFromCloud;

/**
 * Save a settlement record in Cloud Firestore
 */
export async function saveSettlementToCloud(
  tripId: string,
  settlement: SettlementRecord
): Promise<void> {
  if (!tripId || tripId === 'trip-goa-2026' || !auth.currentUser?.uid) return;
  const path = `trips/${tripId}/settlements/${settlement.id}`;
  try {
    await setDoc(doc(db, 'trips', tripId, 'settlements', settlement.id), settlement);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Seed initial trip and demo data if not yet created in Firestore
 */
export async function seedTripToCloud(
  trip: Trip,
  expenses: Expense[],
  kitty: KittyContribution[],
  settlements: SettlementRecord[]
): Promise<void> {
  try {
    await saveTripToCloud(trip);
    for (const exp of expenses) {
      await saveExpenseToCloud(trip.id, exp);
    }
    for (const kc of kitty) {
      await saveKittyContributionToCloud(trip.id, kc);
    }
    for (const s of settlements) {
      await saveSettlementToCloud(trip.id, s);
    }
  } catch (error) {
    console.error('Error seeding demo trip to cloud:', error);
  }
}

/** Redeem a private QR/link invite. Firestore rules verify the secret against the trip. */
export async function joinTripByInvite(
  tripId: string,
  inviteCode: string,
  profile: { uid: string; displayName: string; email: string }
): Promise<Trip | null> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Sign in with Google before joining a trip.');
  if (!tripId || !inviteCode.trim()) throw new Error('This invite link is invalid.');
  const tripRef = doc(db, 'trips', tripId);
  const initials = profile.displayName.split(/\\s+/).map((part) => part[0] || '').join('').toUpperCase().slice(0, 2) || 'FR';
  const newMember: Member = {
    id: uid,
    name: profile.displayName.slice(0, 80),
    upiId: '',
    avatarColor: 'bg-indigo-600 text-white',
    initials,
    email: profile.email,
  };
  try {
    await updateDoc(tripRef, {
      memberUids: arrayUnion(uid),
      members: arrayUnion(newMember),
      joinCodeAttempt: inviteCode.trim().toUpperCase(),
    });
    const snap = await getDoc(tripRef);
    return snap.exists() ? ({ ...snap.data(), id: snap.id } as Trip) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `trips/${tripId}`);
  }
}

export interface ItineraryStop {
  id: string;
  date: string;
  time: string;
  timeFrom?: string;
  timeTo?: string;
  title: string;
  location: string;
  category: string;
  activities?: string;
  budget: string;
  notes: string;
}

export interface ItineraryTemplate {
  id: string;
  title: string;
  destination: string;
  destinationKey: string;
  currency: string;
  stops: ItineraryStop[];
  authorUid: string;
  createdAt: number;
}

/** Read the saved itinerary for one trip. */
export async function loadTripItinerary(tripId: string): Promise<ItineraryStop[]> {
  if (!tripId || tripId === 'trip-goa-2026' || !auth.currentUser?.uid) return [];
  const path = `trips/${tripId}/itinerary`;
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((item) => item.data() as ItineraryStop)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/** Persist one itinerary stop under its trip; trip membership rules govern access. */
export async function saveTripItineraryStop(tripId: string, stop: ItineraryStop): Promise<void> {
  if (!tripId || tripId === 'trip-goa-2026' || !auth.currentUser?.uid) return;
  const path = `trips/${tripId}/itinerary/${stop.id}`;
  try {
    await setDoc(doc(db, 'trips', tripId, 'itinerary', stop.id), stop);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTripItineraryStop(tripId: string, stopId: string): Promise<void> {
  if (!tripId || tripId === 'trip-goa-2026' || !auth.currentUser?.uid) return;
  const path = `trips/${tripId}/itinerary/${stopId}`;
  try {
    await deleteDoc(doc(db, 'trips', tripId, 'itinerary', stopId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/** Search opt-in public templates by normalized destination. */
export async function searchItineraryTemplates(destination: string): Promise<ItineraryTemplate[]> {
  const key = destination.trim().toLocaleLowerCase().replace(/\\s+/g, ' ');
  if (!key) return [];
  const path = 'itineraryTemplates';
  try {
    const q = query(collection(db, path), where('destinationKey', '==', key));
    const snap = await getDocs(q);
    return snap.docs.map((item) => ({ ...item.data(), id: item.id } as ItineraryTemplate))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/** Publish a sanitized, opt-in copy; private notes and booking details are intentionally excluded. */
export async function publishItineraryTemplate(
  trip: Trip,
  stops: ItineraryStop[],
  authorUid: string
): Promise<void> {
  if (!authorUid || stops.length === 0) throw new Error('Sign in and add at least one stop before publishing.');
  const destination = trip.destination.trim();
  const destinationKey = destination.toLocaleLowerCase().replace(/\\s+/g, ' ');
  const id = `template-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const publicStops = stops.map((stop, index) => ({
    id: `stop-${index + 1}`, date: stop.date, time: stop.time,
    title: stop.title.slice(0, 150), location: stop.location.slice(0, 200),
    category: stop.category.slice(0, 50), budget: stop.budget, notes: '',
  }));
  const template: ItineraryTemplate = {
    id, title: trip.name.slice(0, 120), destination: destination.slice(0, 120),
    destinationKey, currency: trip.currency || 'INR', stops: publicStops,
    authorUid, createdAt: Date.now(),
  };
  try {
    await setDoc(doc(db, 'itineraryTemplates', id), template);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `itineraryTemplates/${id}`);
  }
}

/**
 * Save user profile with mobile phone number in Firestore
 */
export async function saveUserProfileToCloud(profile: UserProfile): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid || uid !== profile.uid) throw new Error('Not authorized to save user profile.');
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), {
      ...profile,
      phoneNumber: normalizePhone10(profile.phoneNumber || ''),
      updatedAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Read user profile from Firestore
 */
export async function getUserProfileFromCloud(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Sync phone numbers of trip members to tripInvites for discovery
 */
export async function syncTripPhoneInvites(trip: Trip, organizerName: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid || trip.id === 'trip-goa-2026' || !trip.members) return;

  for (const member of trip.members) {
    const cleanPhone = normalizePhone10(member.phone || '');
    if (cleanPhone.length === 10) {
      const inviteId = `${trip.id}_${cleanPhone}`;
      const path = `tripInvites/${inviteId}`;
      try {
        const ref = doc(db, 'tripInvites', inviteId);
        const existing = await getDoc(ref);
        if (!existing.exists()) {
          const newInvite: TripInvite = {
            id: inviteId,
            tripId: trip.id,
            tripName: trip.name,
            destination: trip.destination,
            organizerUid: trip.ownerUid || uid,
            organizerName: organizerName || 'Trip Organizer',
            phoneNumber: cleanPhone,
            memberName: member.name,
            inviteCode: trip.inviteCode,
            status: 'invited',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await setDoc(ref, newInvite);
        }
      } catch (error) {
        console.warn('Could not sync trip invite for phone:', cleanPhone, error);
      }
    }
  }
}

/**
 * Listen for trip invitations that match the user's mobile number
 */
export function subscribeToPendingInvitesForPhone(
  phone: string,
  onUpdate: (invites: TripInvite[]) => void,
  onError?: (err: unknown) => void
) {
  const cleanPhone = normalizePhone10(phone);
  const uid = auth.currentUser?.uid;
  if (!cleanPhone || !uid || cleanPhone.length !== 10) {
    onUpdate([]);
    return () => {};
  }

  const path = 'tripInvites';
  const q = query(
    collection(db, path),
    where('phoneNumber', '==', cleanPhone)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const invites: TripInvite[] = [];
      snapshot.forEach((snap) => {
        const data = snap.data() as TripInvite;
        if (data.status === 'invited' || (data.status === 'requested' && data.requestedByUid === uid)) {
          invites.push(data);
        }
      });
      onUpdate(invites);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Friend requests to join a trip that was discovered via their phone number
 */
export async function requestToJoinTripByInvite(
  invite: TripInvite,
  user: { uid: string; displayName: string; email: string }
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid || uid !== user.uid) throw new Error('Sign in before requesting to join.');
  const path = `tripInvites/${invite.id}`;
  try {
    await updateDoc(doc(db, 'tripInvites', invite.id), {
      status: 'requested',
      requestedByUid: user.uid,
      requestedByName: user.displayName,
      requestedByEmail: user.email,
      updatedAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Organizer listens for pending join requests for trips they created
 */
export function subscribeToOrganizerJoinRequests(
  organizerUid: string,
  onUpdate: (requests: TripInvite[]) => void,
  onError?: (err: unknown) => void
) {
  if (!organizerUid) {
    onUpdate([]);
    return () => {};
  }

  const path = 'tripInvites';
  const q = query(
    collection(db, path),
    where('organizerUid', '==', organizerUid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const requests: TripInvite[] = [];
      snapshot.forEach((snap) => {
        const data = snap.data() as TripInvite;
        if (data.status === 'requested') {
          requests.push(data);
        }
      });
      onUpdate(requests);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Organizer accepts a friend's join request:
 * Adds friend to trip.memberUids and trip.members, and marks invite as accepted.
 */
export async function acceptTripJoinRequest(
  trip: Trip,
  invite: TripInvite
): Promise<Trip> {
  const uid = auth.currentUser?.uid;
  if (!uid || trip.ownerUid !== uid) throw new Error('Only the trip organizer can accept join requests.');
  if (!invite.requestedByUid) throw new Error('No user associated with this join request.');

  const friendUid = invite.requestedByUid;
  const friendName = invite.requestedByName || invite.memberName || 'Friend';
  const friendEmail = invite.requestedByEmail || '';

  const memberUids = Array.from(new Set([...(trip.memberUids || [uid]), friendUid]));
  
  // Check if member with this phone already exists in members list
  let updatedMembers = [...trip.members];
  const existingMemberIdx = updatedMembers.findIndex(
    (m) => normalizePhone10(m.phone || '') === invite.phoneNumber
  );

  const initials = friendName.split(/\s+/).map((p) => p[0] || '').join('').toUpperCase().slice(0, 2) || 'FR';

  if (existingMemberIdx >= 0) {
    updatedMembers[existingMemberIdx] = {
      ...updatedMembers[existingMemberIdx],
      id: friendUid,
      name: friendName,
      email: friendEmail,
      phone: invite.phoneNumber,
    };
  } else {
    updatedMembers.push({
      id: friendUid,
      name: friendName,
      upiId: '',
      avatarColor: 'bg-indigo-600 text-white',
      initials,
      phone: invite.phoneNumber,
      email: friendEmail,
    });
  }

  const updatedTrip: Trip = {
    ...trip,
    memberUids,
    members: updatedMembers,
  };

  // 1. Save updated trip to Firestore
  await saveTripToCloud(updatedTrip);

  // 2. Mark invite status as accepted
  try {
    await updateDoc(doc(db, 'tripInvites', invite.id), {
      status: 'accepted',
      updatedAt: Date.now(),
    });
  } catch (e) {
    console.warn('Could not update invite status:', e);
  }

  return updatedTrip;
}

/**
 * Organizer rejects a friend's join request
 */
export async function rejectTripJoinRequest(invite: TripInvite): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid || invite.organizerUid !== uid) throw new Error('Only the trip organizer can reject join requests.');
  const path = `tripInvites/${invite.id}`;
  try {
    await updateDoc(doc(db, 'tripInvites', invite.id), {
      status: 'rejected',
      updatedAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
