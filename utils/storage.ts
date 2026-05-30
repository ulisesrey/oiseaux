import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase'; // <-- Add this import

const STORAGE_KEY = 'oiseaux_user_data';

export interface UserStats {
  progress: { [key: string]: number };
  stars: number;
  lives: number;
  lastHeartRefresh: number; // To recover lives over time later!
  username?: string;        // <-- Added for Supabase leaderboard
  supabaseId?: string;      // <-- Added for Supabase leaderboard
}

const DEFAULT_STATS: UserStats = {
  progress: {},
  stars: 0,
  lives: 5,
  lastHeartRefresh: Date.now(),
};

// --- NEW FUNCTION: Save Supabase credentials locally ---
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
    
    // Initialize progress object if it doesn't exist
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

    // 1000 ms * 60 sec * 60 min * 24 hrs = 1 day
    const REFRESH_RATE = 2 * 60 * 1000; // 1h
    if (Date.now() - stats.lastHeartRefresh > REFRESH_RATE && stats.lives < 5) {
      stats.lives = 5; // Change to stats.lives + 1 ?
      stats.lastHeartRefresh = Date.now();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }

    return stats;
  } catch (e) {
    return DEFAULT_STATS;
  }
};

export const addStars = async (amount: number) => {
  const stats = await getUserStats();
  stats.stars += amount;
  
  // 1. Save locally so the app works offline instantly
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));

  // 2. Sync to the cloud in the background (if they are registered)
  if (stats.supabaseId) {
    supabase
      .from('users')
      .update({ stars: stats.stars })
      .eq('id', stats.supabaseId)
      .then(({ error }) => {
        if (error) console.error("Error syncing stars to cloud:", error);
      });
  }
};

export const updateLives = async (newLives: number) => {
  const stats = await getUserStats();
  stats.lives = Math.max(0, newLives);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};