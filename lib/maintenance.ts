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
import type { MaintenanceRecord } from '@/types';

function fromFirestore(id: string, data: Record<string, unknown>): MaintenanceRecord {
  return {
    ...(data as Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>),
    id,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
  };
}

export async function getMaintenanceRecords(
  userId: string,
  vehicleId?: string,
): Promise<MaintenanceRecord[]> {
  const conditions = [where('userId', '==', userId)];
  if (vehicleId) conditions.push(where('vehicleId', '==', vehicleId));

  const q = query(
    collection(db, 'maintenance'),
    ...conditions,
    orderBy('date', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => fromFirestore(d.id, d.data()));
}

export async function addMaintenanceRecord(
  data: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'maintenance'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMaintenanceRecord(
  id: string,
  updates: Partial<Omit<MaintenanceRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
): Promise<void> {
  await updateDoc(doc(db, 'maintenance', id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMaintenanceRecord(id: string): Promise<void> {
  await deleteDoc(doc(db, 'maintenance', id));
}
