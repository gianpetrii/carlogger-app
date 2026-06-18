import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { FuelEntry } from '@/types';

function fromFirestore(id: string, data: Record<string, unknown>): FuelEntry {
  return {
    ...(data as Omit<FuelEntry, 'id' | 'createdAt' | 'updatedAt'>),
    id,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
  };
}

export async function getFuelEntries(
  userId: string,
  vehicleId?: string,
): Promise<FuelEntry[]> {
  const conditions = [where('userId', '==', userId)];
  if (vehicleId) conditions.push(where('vehicleId', '==', vehicleId));

  const q = query(
    collection(db, 'fuel'),
    ...conditions,
    orderBy('date', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => fromFirestore(d.id, d.data()));
}

export async function addFuelEntry(
  data: Omit<FuelEntry, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'fuel'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateFuelEntry(
  id: string,
  updates: Partial<Omit<FuelEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
): Promise<void> {
  await updateDoc(doc(db, 'fuel', id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteFuelEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, 'fuel', id));
}
