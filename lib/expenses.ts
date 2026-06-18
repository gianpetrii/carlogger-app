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
import type { Expense } from '@/types';

function fromFirestore(id: string, data: Record<string, unknown>): Expense {
  return {
    ...(data as Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>),
    id,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
  };
}

export async function getExpenses(
  userId: string,
  vehicleId?: string,
): Promise<Expense[]> {
  const conditions = [where('userId', '==', userId)];
  if (vehicleId) conditions.push(where('vehicleId', '==', vehicleId));

  const q = query(
    collection(db, 'expenses'),
    ...conditions,
    orderBy('date', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => fromFirestore(d.id, d.data()));
}

export async function addExpense(
  data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'expenses'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateExpense(
  id: string,
  updates: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
): Promise<void> {
  await updateDoc(doc(db, 'expenses', id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteExpense(id: string): Promise<void> {
  await deleteDoc(doc(db, 'expenses', id));
}
