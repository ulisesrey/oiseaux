import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const STORAGE_KEY = 'oiseaux_user_data';

export interface UserStats {
  progress: { [key: string]: number };
  stars: number;
  lives: number;
  lastHeartRefresh: number; 
  username?: string;        
  supabaseId?: string;      
  played_dates?: string[]; // <-- Added our new array!
}

const DEFAULT_STATS: UserStats = {
  progress: {},
  stars: 0,
  lives: 5,
  lastHeartRefresh: Date.now(),
  played_dates: [],
};

// --- DATE HELPERS ---

// 1. Safely formats a JavaScript Date into 'YYYY-MM-DD'
export const toYYYYMMDD = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 2. Calculates the current streak by counting backwards from today
export const calculateStreak = (playedDates: string[] | undefined): number => {
  if (!playedDates || playedDates.length === 0) return 0;
  
  const dateSet = new Set(playedDates);
  let streak = 0;
  const today = new Date();
  
  // Look backward day by day (up to 5 years)
  for (let i = 0; i < 1825; i++) { 
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = toYYYYMMDD(d);
    
    // If we are checking today (i === 0) and they haven't played yet, 
    // it DOES NOT break the streak. They still have until midnight!
    if (i === 0 && !dateSet.has(dateStr)) {
      continue;
    }
    
    if (dateSet.has(dateStr)) {
      streak++;
    } else {
      break; // The chain is broken! Stop counting.
    }
  }
  
  return streak;
};

// --- CORE FUNCTIONS ---

export const registerUserLocal = async (username: string, supabaseId: string): Promise<UserStats> => {
  const stats = await getUserStats();
  stats.username = username;
  stats.supabaseId = supabaseId;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  return stats;
};

export const saveLevelCompletion = async (levelIdx: number | string): Promise<void> => {
  try {
    const stats = await getUserStats();
    const key = levelIdx.toString();
    
    if (!stats.progress) stats.progress = {};
    stats.progress[key] = (stats.progress[key] || 0) + 1;
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Error saving progress", e);
  }
};

export const getUserStats = async (): Promise<UserStats> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_STATS;

    let stats: UserStats = { ...DEFAULT_STATS, ...JSON.parse(data) };

    const REFRESH_RATE = 2 * 60 * 1000; // 1h
    if (Date.now() - stats.lastHeartRefresh > REFRESH_RATE && stats.lives < 5) {
      stats.lives = 5; 
      stats.lastHeartRefresh = Date.now();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }

    return stats;
  } catch (e) {
    return DEFAULT_STATS;
  }
};

// --- UPDATED: Now tracks daily play and pushes to Supabase! ---
export const addStars = async (amount: number) => {
  const stats = await getUserStats();
  stats.stars += amount;
  
  // 1. Handle the Dates
  if (!stats.played_dates) stats.played_dates = [];
  const todayStr = toYYYYMMDD(new Date());
  
  let datesUpdated = false;
  if (!stats.played_dates.includes(todayStr)) {
    stats.played_dates.push(todayStr); // Add today!
    datesUpdated = true;
  }
  
  // 2. Save Locally
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));

  // 3. Sync to Supabase
  if (stats.supabaseId) {
    // Only update the dates array if they actually played for the first time today
    const updatePayload: any = { stars: stats.stars };
    if (datesUpdated) {
      updatePayload.played_dates = stats.played_dates;
    }

    supabase
      .from('users')
      .update(updatePayload)
      .eq('id', stats.supabaseId)
      .then(({ error }) => {
        if (error) console.error("Error syncing to cloud:", error);
      });
  }
};

export const updateLives = async (newLives: number) => {
  const stats = await getUserStats();
  stats.lives = Math.max(0, newLives);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};