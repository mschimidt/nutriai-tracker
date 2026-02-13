import { LogEntry, UserStats } from "../types";

const STORAGE_KEY_PREFIX = 'nutriai_data_';
const STATS_KEY_PREFIX = 'nutriai_stats_';

export const getStorageKey = (userId: string) => `${STORAGE_KEY_PREFIX}${userId}`;
export const getStatsKey = (userId: string) => `${STATS_KEY_PREFIX}${userId}`;

export const saveLog = (userId: string, entry: LogEntry) => {
  const key = getStorageKey(userId);
  const currentData = localStorage.getItem(key);
  const logs: LogEntry[] = currentData ? JSON.parse(currentData) : [];
  logs.push(entry);
  localStorage.setItem(key, JSON.stringify(logs));
};

export const getLogs = (userId: string): LogEntry[] => {
  const key = getStorageKey(userId);
  const currentData = localStorage.getItem(key);
  return currentData ? JSON.parse(currentData) : [];
};

export const getTodayLogs = (userId: string): LogEntry[] => {
  const logs = getLogs(userId);
  const today = new Date().setHours(0, 0, 0, 0);
  return logs.filter(log => {
    const logDate = new Date(log.timestamp).setHours(0, 0, 0, 0);
    return logDate === today;
  }).sort((a, b) => b.timestamp - a.timestamp); // Newest first
};

export const saveUserStats = (userId: string, stats: UserStats) => {
  localStorage.setItem(getStatsKey(userId), JSON.stringify(stats));
};

export const getUserStats = (userId: string): UserStats => {
  const data = localStorage.getItem(getStatsKey(userId));
  return data ? JSON.parse(data) : { weight: 70, height: 170, tmb: 1600 };
};

export const deleteLog = (userId: string, logId: string) => {
  const key = getStorageKey(userId);
  const logs = getLogs(userId);
  const newLogs = logs.filter(l => l.id !== logId);
  localStorage.setItem(key, JSON.stringify(newLogs));
};
