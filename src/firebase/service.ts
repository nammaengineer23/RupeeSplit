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
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import { Expense, KittyContribution, SettlementRecord, Trip } from '../types';

/**
 * Subscribe to all trips in real-time
 */
export function subscribeToTrips(
  onUpdate: (trips: Trip[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'trips';
  return onSnapshot(
    collection(db, path),
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
  try {
    await setDoc(doc(db, 'trips', trip.id), trip);
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

/**
 * Search for a trip by 6-character inviteCode (e.g. "GOA-2026")
 */
export async function findTripByCode(inviteCode: string): Promise<Trip | null> {
  const path = 'trips';
  try {
    const q = query(
      collection(db, path),
      where('inviteCode', '==', inviteCode.toUpperCase().trim())
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as Trip;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}
