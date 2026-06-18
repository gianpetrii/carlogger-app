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
import type { Vehicle } from '@/types';

function fromFirestore(id: string, data: Record<string, unknown>): Vehicle {
  return {
    ...(data as Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>),
    id,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
  };
}

export async function getVehicles(userId: string): Promise<Vehicle[]> {
  const q = query(
    collection(db, 'vehicles'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => fromFirestore(d.id, d.data()));
}

export async function addVehicle(
  data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'vehicles'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateVehicle(
  id: string,
  updates: Partial<Omit<Vehicle, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
): Promise<void> {
  await updateDoc(doc(db, 'vehicles', id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteVehicle(id: string): Promise<void> {
  await deleteDoc(doc(db, 'vehicles', id));
}
