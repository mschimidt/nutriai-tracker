import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  deleteDoc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { LogEntry, UserStats } from "../types";

// Collections
const LOGS_COLLECTION = 'logs';
const USERS_COLLECTION = 'users';

// -- Logs Operations --

export const saveLog = async (userId: string, entry: Omit<LogEntry, 'id'> & { id?: string }) => {
  try {
    // We add the userId to the document to filter later
    await addDoc(collection(db, LOGS_COLLECTION), {
      ...entry,
      userId,
      // Ensure id is not saved as part of the data if we want Firestore to generate one, 
      // but since the app logic generates IDs based on timestamp, we can store it or let Firestore handle it.
      // To keep it consistent with the UI logic which uses `entry.id` as key:
      timestamp: entry.timestamp || Date.now()
    });
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const getTodayLogs = async (userId: string): Promise<LogEntry[]> => {
  try {
    // Create a query against the collection.
    // Note: Ideally we would use a compound query with timestamp, but that requires creating an index in Firebase Console.
    // To keep this "setup-free" for now, we get all user logs and filter in memory. 
    // For production, you should add .where('timestamp', '>=', startOfDay) and create the index.
    const q = query(collection(db, LOGS_COLLECTION), where("userId", "==", userId));
    
    const querySnapshot = await getDocs(q);
    const logs: LogEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        id: doc.id, // Use Firestore ID
        timestamp: data.timestamp,
        type: data.type,
        title: data.title,
        calories: data.calories,
        details: data.details
      } as LogEntry);
    });

    // Filter for today in JS
    const today = new Date().setHours(0, 0, 0, 0);
    return logs.filter(log => {
      const logDate = new Date(log.timestamp).setHours(0, 0, 0, 0);
      return logDate === today;
    }).sort((a, b) => b.timestamp - a.timestamp);

  } catch (e) {
    console.error("Error fetching logs: ", e);
    return [];
  }
};

export const deleteLog = async (userId: string, logId: string) => {
  try {
    // Delete the document based on the ID
    // Note: In a real app, verify userId matches document owner via Security Rules
    await deleteDoc(doc(db, LOGS_COLLECTION, logId));
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw e;
  }
};

// -- User Stats Operations --

export const saveUserStats = async (userId: string, stats: UserStats) => {
  try {
    // Set (overwrite) the document with the specific userId
    await setDoc(doc(db, USERS_COLLECTION, userId), { stats });
  } catch (e) {
    console.error("Error saving stats: ", e);
    throw e;
  }
};

export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().stats) {
      return docSnap.data().stats as UserStats;
    } else {
      // Default stats if not found
      return { weight: 70, height: 170, tmb: 1600 };
    }
  } catch (e) {
    console.error("Error getting stats: ", e);
    return { weight: 70, height: 170, tmb: 1600 };
  }
};
