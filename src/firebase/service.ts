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
import { Expense, KittyContribution, Member, SettlementRecord, Trip } from '../types';

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
 * Subscribe to kitty cash pot contributions for a trip in real-time
 */
export function subscribeToKitty(
  tripId: string,
  onUpdate: (contributions: KittyContribution[]) => void,
  onError?: (err: unknown) => void
) {
  const path = `trips/${tripId}/kitty`;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: KittyContribution[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as KittyContribution);
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
 * Subscribe to settlement records for a trip in real-time
 */
export function subscribeToSettlements(
  tripId: string,
  onUpdate: (settlements: SettlementRecord[]) => void,
  onError?: (err: unknown) => void
) {
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
  const path = `trips/${trip.id}`;
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Sign in with Google before saving a trip.');
  const ownedTrip: Trip = {
    ...trip,
    ownerUid: trip.ownerUid || uid,
    memberUids: trip.memberUids?.length ? trip.memberUids : [uid],
  };
  if (ownedTrip.ownerUid !== uid && !ownedTrip.memberUids.includes(uid)) {
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
  const path = `trips/${tripId}/expenses/${expenseId}`;
  try {
    await deleteDoc(doc(db, 'trips', tripId, 'expenses', expenseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save a kitty contribution in Cloud Firestore
 */
export async function saveKittyContributionToCloud(
  tripId: string,
  contribution: KittyContribution
): Promise<void> {
  const path = `trips/${tripId}/kitty/${contribution.id}`;
  try {
    await setDoc(doc(db, 'trips', tripId, 'kitty', contribution.id), contribution);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save a settlement record in Cloud Firestore
 */
export async function saveSettlementToCloud(
  tripId: string,
  settlement: SettlementRecord
): Promise<void> {
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
  title: string;
  location: string;
  category: string;
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
  const path = `trips/${tripId}/itinerary/${stop.id}`;
  try {
    await setDoc(doc(db, 'trips', tripId, 'itinerary', stop.id), stop);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTripItineraryStop(tripId: string, stopId: string): Promise<void> {
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
