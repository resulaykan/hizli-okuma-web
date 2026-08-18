export type AppMode = 'rsvp' | 'guided' | 'schulte' | 'eye-training';

export type Theme = 'dark' | 'light' | 'sepia' | 'oled' | 'cyber' | 'custom';

export type FontFamily = 'lexend' | 'sans' | 'serif' | 'mono';

export type ChunkSize = 1 | 2 | 3;

export type OrpColor = 'red' | 'indigo' | 'emerald' | 'amber' | 'cyan' | 'custom';

export interface CustomColors {
  background: string;
  card: string;
  text: string;
  primary: string;
  orp: string;
}

export interface UserSettings {
  theme: Theme;
  fontFamily: FontFamily;
  chunkSize: ChunkSize;
  fontSize: number; // in px
  orpEnabled: boolean;
  orpColor: OrpColor;
  customOrpHex: string;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  pauseOnPunctuation: boolean;
  autoAccelerate: boolean;
  accelerateStep: number; // e.g. 15 WPM
  accelerateIntervalSeconds: number; // e.g. 30 seconds
  customColors: CustomColors;
}

export interface OrpWord {
  raw: string;
  prefix: string;
  orpChar: string;
  suffix: string;
  orpIndex: number;
  delayMultiplier: number;
}

export interface ChunkItem {
  text: string;
  words: OrpWord[];
  isParagraphEnd: boolean;
  delayMultiplier: number;
}

export interface LibraryItem {
  id: string;
  title: string;
  author: string;
  category: 'edebiyat' | 'tarih' | 'felsefe' | 'bilim' | 'rehber';
  difficulty: 'Kolay' | 'Orta' | 'İleri';
  wordCount: number;
  estimatedMinutesAt300Wpm: number;
  description: string;
  content: string;
}

export interface UserStats {
  totalWordsRead: number;
  totalSecondsRead: number;
  sessionsCompleted: number;
  highestWpm: number;
  averageWpm: number;
  lastActiveDate: string;
  streakDays: number;
  schulteBestTimeSeconds: number | null;
}

export interface ReadingSessionResult {
  wordsRead: number;
  timeSpentSeconds: number;
  averageWpm: number;
  completedAt: string;
  textTitle?: string;
}
