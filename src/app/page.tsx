'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Navbar 
} from '@/components/Navbar';
import { 
  RSVPReader 
} from '@/components/RSVPReader';
import { 
  GuidedReader 
} from '@/components/GuidedReader';
import { 
  SchulteTable 
} from '@/components/SchulteTable';
import { 
  EyeTraining 
} from '@/components/EyeTraining';
import { 
  LibraryModal 
} from '@/components/LibraryModal';
import { 
  SettingsModal 
} from '@/components/SettingsModal';
import { 
  StatsModal 
} from '@/components/StatsModal';
import { 
  ShortcutsModal 
} from '@/components/ShortcutsModal';
import { 
  CompletionModal 
} from '@/components/CompletionModal';
import { 
  AppMode, 
  UserSettings, 
  UserStats, 
  ReadingSessionResult 
} from '@/types';
import { 
  loadStoredSettings, 
  saveStoredSettings, 
  loadStoredWpm, 
  saveStoredWpm, 
  loadStoredStats, 
  recordReadingSession, 
  DEFAULT_STATS,
  loadLastCustomText,
  saveLastCustomText
} from '@/lib/storage';
import { PRESET_LIBRARY } from '@/lib/library';
import { 
  Clipboard, 
  FileText, 
  BookOpen, 
  Trash2, 
  Bookmark,
  Activity,
  Trophy,
  Flame
} from 'lucide-react';
import { estimateReadingTime } from '@/lib/orp';

export default function Home() {
  // --- Global App States (Lazy initialized from LocalStorage) ---
  const [currentMode, setCurrentMode] = useState<AppMode>('rsvp');
  const [settings, setSettings] = useState<UserSettings>(loadStoredSettings);
  const [wpm, setWpm] = useState<number>(loadStoredWpm);
  const [stats, setStats] = useState<UserStats>(loadStoredStats);

  const [text, setText] = useState<string>(() => {
    const last = loadLastCustomText();
    return last || PRESET_LIBRARY[0]?.content || '';
  });

  const [textTitle, setTextTitle] = useState<string>(() => {
    const last = loadLastCustomText();
    return last ? 'Kayıtlı Metin' : (PRESET_LIBRARY[0]?.title || 'Atatürk’ün Gençliğe Hitabesi');
  });

  // --- Modals Visibility States ---
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [completedSession, setCompletedSession] = useState<ReadingSessionResult | null>(null);

  // --- Save Changes to LocalStorage ---
  const handleUpdateSettings = useCallback((newSettings: UserSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  }, []);

  const handleToggleTheme = useCallback(() => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    handleUpdateSettings({ ...settings, theme: nextTheme });
  }, [settings, handleUpdateSettings]);

  const handleUpdateWpm = useCallback((newWpm: number) => {
    setWpm(newWpm);
    saveStoredWpm(newWpm);
  }, []);

  const handleTextChange = useCallback((newText: string, title?: string) => {
    setText(newText);
    if (title) setTextTitle(title);
    saveLastCustomText(newText);
  }, []);

  // --- Reading Completed Handler ---
  const handleReadingComplete = useCallback((wordsCount: number, secondsRead: number, averageWpm: number) => {
    const updatedStats = recordReadingSession(wordsCount, secondsRead, averageWpm);
    setStats(updatedStats);

    setCompletedSession({
      wordsRead: wordsCount,
      timeSpentSeconds: secondsRead,
      averageWpm: averageWpm,
      completedAt: new Date().toISOString(),
      textTitle: textTitle
    });
  }, [textTitle]);

  // --- Global Keyboard Shortcuts Listener ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // Close open modals on Escape
      if (e.key === 'Escape') {
        setIsLibraryOpen(false);
        setIsSettingsOpen(false);
        setIsStatsOpen(false);
        setIsShortcutsOpen(false);
        setCompletedSession(null);
        return;
      }

      // Open Shortcuts Modal on ? or K
      if (e.key === '?' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
        return;
      }

      // Increase / Decrease WPM
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleUpdateWpm(Math.min(1500, wpm + 25));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleUpdateWpm(Math.max(100, wpm - 25));
      }

      // Sound mute toggle on M
      if (e.key.toLowerCase() === 'm') {
        handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
      }

      // Chunk size shortcuts (1, 2, 3)
      if (e.key === '1') handleUpdateSettings({ ...settings, chunkSize: 1 });
      if (e.key === '2') handleUpdateSettings({ ...settings, chunkSize: 2 });
      if (e.key === '3') handleUpdateSettings({ ...settings, chunkSize: 3 });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wpm, settings, handleUpdateWpm, handleUpdateSettings]);

  // --- Dynamic Theme Background Classes ---
  const themeClass = useMemo(() => {
    switch (settings.theme) {
      case 'light':
        return 'bg-light-ambient text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-700';
      case 'sepia':
        return 'bg-sepia-ambient text-[#2e2117] selection:bg-[#d8c39e] selection:text-[#2b1f14]';
      case 'oled':
        return 'bg-oled-ambient text-white selection:bg-white/20 selection:text-white';
      case 'cyber':
        return 'bg-cyber-ambient text-cyan-50 selection:bg-cyan-500/30 selection:text-cyan-200';
      case 'custom':
        return '';
      default: // dark
        return 'bg-dark-ambient text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200';
    }
  }, [settings.theme]);

  const customThemeStyle = useMemo(() => {
    if (settings.theme === 'custom') {
      return {
        backgroundColor: settings.customColors.background,
        color: settings.customColors.text,
      };
    }
    return {};
  }, [settings.theme, settings.customColors]);

  const fontFamilyClass = useMemo(() => {
    switch (settings.fontFamily) {
      case 'lexend': return 'font-lexend';
      case 'sans': return 'font-sans-custom';
      case 'serif': return 'font-serif-custom';
      case 'mono': return 'font-mono-custom';
      default: return 'font-lexend';
    }
  }, [settings.fontFamily]);

  const handlePasteClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        handleTextChange(clipboardText, 'Panodan Yapıştırılan Metin');
      }
    } catch {
      alert('Panoya erişim izni alınamadı.');
    }
  };

  const wordCount = useMemo(() => {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }, [text]);

  const getTextareaClasses = () => {
    switch (settings.theme) {
      case 'light':
        return 'bg-white border-slate-200/90 text-slate-900 focus:border-indigo-500 card-stage-light';
      case 'sepia':
        return 'bg-[#fdfaf4] border-[#e7dcbe] text-[#2e2117] focus:border-[#5b4636] card-stage-sepia';
      case 'oled':
        return 'bg-black border-white/20 text-white focus:border-white card-stage-oled';
      case 'cyber':
        return 'bg-[#090e1f] border-cyan-500/25 text-cyan-50 focus:border-cyan-400';
      default:
        return 'bg-[#0f172a]/90 backdrop-blur-md border-white/10 text-slate-100 focus:border-indigo-500 card-stage-dark';
    }
  };

  // Curated quick library presets for 1-click loading
  const quickPresets = PRESET_LIBRARY.slice(0, 6);

  return (
    <div 
      className={`min-h-screen flex flex-col justify-between transition-colors duration-300 pb-20 md:pb-0 ${themeClass} ${fontFamilyClass}`}
      style={customThemeStyle}
    >
      {/* Top Navbar */}
      <Navbar
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleTheme={handleToggleTheme}
        settings={settings}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-center gap-6">
        
        {/* Dynamic Mode Renderer */}
        {currentMode === 'rsvp' && (
          <RSVPReader
            text={text}
            wpm={wpm}
            onWpmChange={handleUpdateWpm}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onReadingComplete={handleReadingComplete}
            onOpenLibrary={() => setIsLibraryOpen(true)}
          />
        )}

        {currentMode === 'guided' && (
          <GuidedReader
            text={text}
            wpm={wpm}
            onWpmChange={handleUpdateWpm}
            settings={settings}
            onReadingComplete={handleReadingComplete}
            onOpenLibrary={() => setIsLibraryOpen(true)}
          />
        )}

        {currentMode === 'schulte' && (
          <SchulteTable />
        )}

        {currentMode === 'eye-training' && (
          <EyeTraining />
        )}

        {/* Quick Text Library Tags & Editor Bar (Visible for RSVP & Guided modes) */}
        {(currentMode === 'rsvp' || currentMode === 'guided') && (
          <div className="w-full max-w-4xl mx-auto space-y-3.5 pt-2">
            
            {/* Quick 1-Click Library Presets Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-1 shrink-0">
                <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
                <span>Önerilen Eserler:</span>
              </span>
              {quickPresets.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTextChange(item.content, item.title)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap transition-all border shrink-0 ${
                    textTitle === item.title
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                      : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 opacity-70 hover:opacity-100 hover:border-indigo-500/30'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>

            {/* Quick action bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Aktif Okuma Metni</span>
                </span>
                {textTitle && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 max-w-[200px] sm:max-w-xs truncate">
                    {textTitle}
                  </span>
                )}
                {wordCount > 0 && (
                  <span className="text-[11px] opacity-50 hidden sm:inline font-mono">
                    ({wordCount} kelime • ~{estimateReadingTime(wordCount, wpm)})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLibraryOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors border border-indigo-500/20"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Kütüphaneden Seç</span>
                </button>

                <button
                  onClick={handlePasteClipboard}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Yapıştır</span>
                </button>

                {text.length > 0 && (
                  <button
                    onClick={() => handleTextChange('', '')}
                    className="p-1.5 rounded-xl opacity-50 hover:opacity-100 hover:text-red-500 transition-colors"
                    title="Metni Temizle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Textarea */}
            <textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value, 'Özel Metin')}
              placeholder="Buraya okumak istediğiniz metni yapıştırın veya doğrudan yazın..."
              rows={3}
              className={`w-full p-4 rounded-2xl border outline-none resize-y text-xs sm:text-sm font-sans focus:ring-2 focus:ring-indigo-500 transition-all leading-relaxed ${getTextareaClasses()}`}
            />
          </div>
        )}

        {/* Live Persistent Stats Bar (Portfolio Metric Showcase) */}
        <div className="w-full max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold opacity-60">Toplam Kelime</p>
              <p className="text-sm font-bold font-mono">{stats.totalWordsRead.toLocaleString('tr-TR')}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold opacity-60">Rekor Hız</p>
              <p className="text-sm font-bold font-mono">{stats.highestWpm} WPM</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold opacity-60">Günlük Seri</p>
              <p className="text-sm font-bold font-mono">{stats.streakDays} Gün</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold opacity-60">Schulte 5x5</p>
              <p className="text-sm font-bold font-mono">
                {stats.schulteBestTimeSeconds ? `${stats.schulteBestTimeSeconds.toFixed(1)} sn` : '-'}
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Modern Footer */}
      <footer className="w-full border-t border-black/5 dark:border-white/5 py-6 px-4 text-center text-xs opacity-60 flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="flex items-center gap-1.5">
          <span>Geliştirici:</span>
          <a
            href="https://github.com/resulaykan"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold hover:text-indigo-500 transition-colors inline-flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>@resulaykan</span>
          </a>
        </div>
        <span className="hidden sm:inline opacity-40">•</span>
        <div className="flex items-center gap-1">
          <span>Açık Kaynak Kodlu Hızlı Okuma & Bilişsel Odak Platformu</span>
        </div>
      </footer>

      {/* --- Global Modals --- */}
      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectText={handleTextChange}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        onResetStats={() => {
          setStats(DEFAULT_STATS);
          localStorage.removeItem('hizli_okuma_stats_v2');
        }}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {completedSession && (
        <CompletionModal
          isOpen={!!completedSession}
          onClose={() => setCompletedSession(null)}
          wordsRead={completedSession.wordsRead}
          secondsRead={completedSession.timeSpentSeconds}
          wpm={completedSession.averageWpm}
          textTitle={completedSession.textTitle}
          onReplay={() => {
            // Handled
          }}
          onOpenLibrary={() => setIsLibraryOpen(true)}
        />
      )}

    </div>
  );
}