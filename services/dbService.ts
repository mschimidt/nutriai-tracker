import { db } from '../firebase';
import { collection, doc, setDoc, addDoc, query, where, onSnapshot, orderBy, getDoc } from 'firebase/firestore';
import { LogEntry, UserProfile } from '../types';

// Collection references
const USERS_COLLECTION = 'users';

export const saveUserProfile = async (userId: string, profile: UserProfile) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  // Merge true allows updating specific fields without overwriting everything
  await setDoc(userRef, { profile }, { merge: true });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists() && snapshot.data().profile) {
    return snapshot.data().profile as UserProfile;
  }
  return null;
};

export const addLogEntry = async (userId: string, entry: LogEntry) => {
  // Store logs in a subcollection: users/{userId}/logs
  const logsRef = collection(db, USERS_COLLECTION, userId, 'logs');
  
  // We remove the ID from the object because Firestore generates one, 
  // or we use the timestamp ID. Let's let Firestore generate or use the existing ID as doc ID.
  const { id, ...data } = entry;
  await setDoc(doc(logsRef, id), data);
};

export const subscribeToLogs = (userId: string, callback: (logs: LogEntry[]) => void) => {
  const logsRef = collection(db, USERS_COLLECTION, userId, 'logs');
  // Order by timestamp desc
  const q = query(logsRef, orderBy('timestamp', 'asc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const logs: LogEntry[] = [];
    snapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() } as LogEntry);
    });
    callback(logs);
  });

  return unsubscribe;
};
