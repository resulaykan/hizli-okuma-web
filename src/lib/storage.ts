import { UserSettings, UserStats } from '@/types';

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  fontFamily: 'lexend',
  chunkSize: 1,
  fontSize: 56,
  orpEnabled: true,
  orpColor: 'red',
  customOrpHex: '#ef4444',
  soundEnabled: false,
  soundVolume: 0.5,
  pauseOnPunctuation: true,
  autoAccelerate: false,
  accelerateStep: 15,
  accelerateIntervalSeconds: 30,
  customColors: {
    background: '#090d16',
    card: '#111827',
    text: '#f8fafc',
    primary: '#6366f1',
    orp: '#ef4444'
  }
};

export const DEFAULT_STATS: UserStats = {
  totalWordsRead: 0,
  totalSecondsRead: 0,
  sessionsCompleted: 0,
  highestWpm: 300,
  averageWpm: 300,
  lastActiveDate: new Date().toISOString().split('T')[0],
  streakDays: 1,
  schulteBestTimeSeconds: null
};

const SETTINGS_KEY = 'hizli_okuma_settings_v2';
const STATS_KEY = 'hizli_okuma_stats_v2';
const WPM_KEY = 'hizli_okuma_wpm_v2';
const CUSTOM_TEXT_KEY = 'hizli_okuma_last_text_v2';

export function loadStoredSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      customColors: {
        ...DEFAULT_SETTINGS.customColors,
        ...(parsed.customColors || {})
      }
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadStoredWpm(): number {
  if (typeof window === 'undefined') return 300;
  try {
    const raw = localStorage.getItem(WPM_KEY);
    if (!raw) return 300;
    const val = Number(raw);
    return isNaN(val) || val < 100 || val > 1500 ? 300 : val;
  } catch {
    return 300;
  }
}

export function saveStoredWpm(wpm: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WPM_KEY, String(wpm));
  } catch {
    // Ignore
  }
}

export function loadStoredStats(): UserStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function recordReadingSession(wordsCount: number, secondsRead: number, wpm: number): UserStats {
  const current = loadStoredStats();
  const today = new Date().toISOString().split('T')[0];

  // Calculate streak
  let newStreak = current.streakDays || 1;
  if (current.lastActiveDate) {
    const lastDate = new Date(current.lastActiveDate);
    const currentDate = new Date(today);
    const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  const updatedWords = current.totalWordsRead + wordsCount;
  const updatedSeconds = current.totalSecondsRead + Math.max(1, Math.round(secondsRead));
  const updatedSessions = current.sessionsCompleted + 1;
  const updatedHighest = Math.max(current.highestWpm, wpm);
  
  // Running average calculation
  const totalMins = updatedSeconds / 60;
  const updatedAvg = totalMins > 0 ? Math.round(updatedWords / totalMins) : wpm;

  const newStats: UserStats = {
    ...current,
    totalWordsRead: updatedWords,
    totalSecondsRead: updatedSeconds,
    sessionsCompleted: updatedSessions,
    highestWpm: updatedHighest,
    averageWpm: updatedAvg,
    lastActiveDate: today,
    streakDays: newStreak
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    } catch {
      // Ignore
    }
  }

  return newStats;
}

export function recordSchulteTime(timeSeconds: number): UserStats {
  const current = loadStoredStats();
  const currentBest = current.schulteBestTimeSeconds;
  const newBest = currentBest === null ? timeSeconds : Math.min(currentBest, timeSeconds);

  const newStats: UserStats = {
    ...current,
    schulteBestTimeSeconds: newBest
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    } catch {
      // Ignore
    }
  }

  return newStats;
}

export function loadLastCustomText(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(CUSTOM_TEXT_KEY) || '';
  } catch {
    return '';
  }
}

export function saveLastCustomText(text: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_TEXT_KEY, text);
  } catch {
    // Ignore
  }
}
