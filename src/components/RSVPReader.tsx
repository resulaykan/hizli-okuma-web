'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Flame, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  FileText,
  Minus,
  Plus,
  Compass
} from 'lucide-react';
import { ChunkItem, UserSettings } from '@/types';
import { splitIntoChunks, estimateReadingTime } from '@/lib/orp';
import { soundEngine } from '@/lib/audio';

interface RSVPReaderProps {
  text: string;
  wpm: number;
  onWpmChange: (wpm: number) => void;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onReadingComplete: (wordsCount: number, secondsRead: number, averageWpm: number) => void;
  onOpenLibrary: () => void;
}

export const RSVPReader: React.FC<RSVPReaderProps> = ({
  text,
  wpm,
  onWpmChange,
  settings,
  onUpdateSettings,
  onReadingComplete,
  onOpenLibrary,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);
  const [speedBoostNotification, setSpeedBoostNotification] = useState<string | null>(null);
  const [showContextSnippet, setShowContextSnippet] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const sessionStartTimeRef = useRef<number | null>(null);
  const autoAccelCounterRef = useRef<number>(0);

  // Split text into chunks based on settings
  const chunks: ChunkItem[] = useMemo(() => {
    return splitIntoChunks(text, settings.chunkSize, settings.pauseOnPunctuation);
  }, [text, settings.chunkSize, settings.pauseOnPunctuation]);

  const totalChunks = chunks.length;
  const currentChunk = chunks[currentIndex] || null;
  const progressPercent = totalChunks > 0 ? ((currentIndex + 1) / totalChunks) * 100 : 0;

  const totalWords = useMemo(() => {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }, [text]);

  const remainingWords = useMemo(() => {
    if (totalChunks === 0) return 0;
    const remainingChunks = totalChunks - currentIndex;
    return Math.min(totalWords, remainingChunks * settings.chunkSize);
  }, [totalChunks, currentIndex, totalWords, settings.chunkSize]);

  // Context snippet (surrounding words for sentence comprehension)
  const contextSnippet = useMemo(() => {
    if (totalChunks === 0) return { before: '', active: '', after: '' };
    const rawWords = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordIdx = currentIndex * settings.chunkSize;
    
    const beforeWords = rawWords.slice(Math.max(0, wordIdx - 4), wordIdx).join(' ');
    const activeWords = rawWords.slice(wordIdx, wordIdx + settings.chunkSize).join(' ');
    const afterWords = rawWords.slice(wordIdx + settings.chunkSize, Math.min(rawWords.length, wordIdx + settings.chunkSize + 5)).join(' ');

    return { before: beforeWords, active: activeWords, after: afterWords };
  }, [text, currentIndex, settings.chunkSize, totalChunks]);

  // ORP focal color styling
  const orpColorClass = useMemo(() => {
    switch (settings.orpColor) {
      case 'red': return 'text-rose-500 dark:text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]';
      case 'indigo': return 'text-indigo-600 dark:text-indigo-400 drop-shadow-[0_0_12px_rgba(99,102,241,0.4)]';
      case 'emerald': return 'text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]';
      case 'amber': return 'text-amber-500 dark:text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]';
      case 'cyan': return 'text-cyan-500 dark:text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]';
      case 'custom': return '';
      default: return 'text-rose-500';
    }
  }, [settings.orpColor]);

  // Handle countdown
  useEffect(() => {
    let cdTimer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      if (settings.soundEnabled) {
        soundEngine.playCountdownTick(false, settings.soundVolume);
      }
      cdTimer = setTimeout(() => {
        if (countdown === 1) {
          if (settings.soundEnabled) {
            soundEngine.playCountdownTick(true, settings.soundVolume);
          }
          setCountdown(null);
          setIsPlaying(true);
          sessionStartTimeRef.current = Date.now();
        } else {
          setCountdown(countdown - 1);
        }
      }, 750);
    }
    return () => clearTimeout(cdTimer);
  }, [countdown, settings.soundEnabled, settings.soundVolume]);

  // Dynamic pacing and playback loop
  useEffect(() => {
    if (!isPlaying) return;

    if (settings.soundEnabled) {
      soundEngine.playMetronomeTick(settings.soundVolume);
    }

    const baseMs = (60000 / wpm) * settings.chunkSize;
    const chunkDelayMultiplier = chunks[currentIndex]?.delayMultiplier || 1.0;
    const delay = baseMs * chunkDelayMultiplier;

    const timer = setTimeout(() => {
      if (currentIndex >= totalChunks - 1) {
        setIsPlaying(false);
        const totalSecs = sessionElapsedSeconds + (sessionStartTimeRef.current ? (Date.now() - sessionStartTimeRef.current) / 1000 : 1);
        onReadingComplete(totalWords, totalSecs, wpm);
        return;
      }

      setCurrentIndex((prev) => prev + 1);

      if (settings.autoAccelerate) {
        autoAccelCounterRef.current += delay;
        if (autoAccelCounterRef.current >= settings.accelerateIntervalSeconds * 1000) {
          autoAccelCounterRef.current = 0;
          const nextWpm = Math.min(1500, wpm + settings.accelerateStep);
          onWpmChange(nextWpm);
          setSpeedBoostNotification(`+${settings.accelerateStep} WPM Hızlandınız! (${nextWpm} WPM)`);
          setTimeout(() => setSpeedBoostNotification(null), 2500);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [
    isPlaying, 
    currentIndex, 
    totalChunks, 
    wpm, 
    settings, 
    chunks, 
    totalWords, 
    sessionElapsedSeconds, 
    onReadingComplete, 
    onWpmChange
  ]);

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    if (totalChunks === 0) return;

    if (isPlaying || countdown !== null) {
      setIsPlaying(false);
      setCountdown(null);
      if (sessionStartTimeRef.current) {
        setSessionElapsedSeconds(prev => prev + (Date.now() - (sessionStartTimeRef.current || Date.now())) / 1000);
        sessionStartTimeRef.current = null;
      }
    } else {
      if (currentIndex >= totalChunks - 1) {
        setCurrentIndex(0);
        setSessionElapsedSeconds(0);
      }
      setCountdown(3);
    }
  }, [totalChunks, isPlaying, countdown, currentIndex]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCountdown(null);
    setCurrentIndex(0);
    setSessionElapsedSeconds(0);
    sessionStartTimeRef.current = null;
    autoAccelCounterRef.current = 0;
  }, []);

  const jumpWords = useCallback((delta: number) => {
    const chunkDelta = Math.round(delta / settings.chunkSize);
    setCurrentIndex(prev => Math.max(0, Math.min(totalChunks - 1, prev + chunkDelta)));
  }, [settings.chunkSize, totalChunks]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Keyboard shortcut listener dedicated to RSVP reader
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'j') {
        e.preventDefault();
        jumpWords(-10);
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'l') {
        e.preventDefault();
        jumpWords(10);
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        reset();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, jumpWords, reset, toggleFullscreen]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Preset speed buttons
  const speedPresets = [
    { label: '200', value: 200, title: 'Başlangıç' },
    { label: '350', value: 350, title: 'Orta' },
    { label: '500', value: 500, title: 'Hızlı' },
    { label: '700', value: 700, title: 'İleri' },
    { label: '900', value: 900, title: 'Master' },
  ];

  // Card Stage Styling
  const getStageStyleClass = () => {
    if (isFullscreen) return 'fixed inset-0 z-50 rounded-none h-screen p-6 md:p-12 justify-center bg-black text-white';
    
    switch (settings.theme) {
      case 'light':
        return 'card-stage-light text-slate-900';
      case 'sepia':
        return 'card-stage-sepia text-[#2e2117]';
      case 'oled':
        return 'card-stage-oled text-white';
      case 'cyber':
        return 'card-stage-cyber text-cyan-50';
      case 'custom':
        return 'border border-black/10 dark:border-white/10 shadow-2xl';
      default: // dark
        return 'card-stage-dark text-slate-100';
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full max-w-4xl mx-auto flex flex-col justify-between rounded-3xl transition-all duration-300 overflow-hidden ${getStageStyleClass()}`}
      style={settings.theme === 'custom' ? {
        backgroundColor: settings.customColors.card,
        color: settings.customColors.text,
      } : {}}
    >
      {/* Top Header Bar: Stats, Pacing, Fullscreen */}
      <div className="flex items-center justify-between px-6 sm:px-8 py-3.5 border-b border-black/5 dark:border-white/5 text-xs sm:text-sm">
        
        {/* Left: Progress Badge & Word Count */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 font-mono text-xs font-bold">
            <span className="text-indigo-600 dark:text-indigo-400">{totalChunks > 0 ? currentIndex + 1 : 0}</span>
            <span className="opacity-40">/</span>
            <span className="opacity-70">{totalChunks}</span>
          </div>

          <span className="opacity-30 hidden sm:inline">•</span>
          
          <span className="opacity-70 text-xs hidden sm:inline font-medium">
            {remainingWords} kelime kaldı
          </span>

          <span className="opacity-30 hidden sm:inline">•</span>

          <span className="flex items-center gap-1 opacity-70 text-xs font-mono">
            <Clock className="w-3.5 h-3.5" />
            ~{estimateReadingTime(remainingWords, wpm)}
          </span>
        </div>

        {/* Right: Quick actions & toggles */}
        <div className="flex items-center gap-1.5">
          {settings.autoAccelerate && (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-3 h-3" />
              Oto-Hızlanma
            </span>
          )}

          <button
            onClick={() => setShowContextSnippet(!showContextSnippet)}
            className={`p-1.5 px-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
              showContextSnippet
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                : 'opacity-50 hover:opacity-100'
            }`}
            title="Cümle Bağlamını Aç / Kapat"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bağlam</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
            className={`p-2 rounded-xl transition-colors ${settings.soundEnabled ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' : 'opacity-50 hover:opacity-100'}`}
            title={settings.soundEnabled ? "Sesi Kapat (M)" : "Sesi Aç (M)"}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title={isFullscreen ? "Tam Ekrandan Çık (F)" : "Tam Ekran (F)"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress Bar with Gradient Glow */}
      <div className="w-full h-1 bg-black/5 dark:bg-white/5 relative overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-150 ease-out shadow-[0_0_8px_rgba(99,102,241,0.6)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Speed Boost Notification Badge */}
      {speedBoostNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 animate-bounce flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 fill-current" />
          {speedBoostNotification}
        </div>
      )}

      {/* Main Focal Chamber (Where the Magic Happens) */}
      <div 
        onClick={togglePlay}
        className={`relative w-full flex flex-col items-center justify-center cursor-pointer select-none transition-all ${
          isFullscreen ? 'min-h-[60vh]' : 'h-72 sm:h-84'
        }`}
      >
        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-xs bg-black/20 dark:bg-black/50 animate-in fade-in duration-150">
            <div className="text-8xl sm:text-9xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400 drop-shadow-2xl animate-pulse">
              {countdown > 0 ? countdown : 'BAŞLA!'}
            </div>
          </div>
        )}

        {/* ORP Alignment Top & Bottom Hairline Guides */}
        {settings.orpEnabled && settings.chunkSize === 1 && totalChunks > 0 && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-6 items-center">
            {/* Top guide notch with glowing center dot */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-4 bg-indigo-500 dark:bg-indigo-400 rounded-full opacity-60" />
            </div>
            {/* Bottom guide notch */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-4 bg-indigo-500 dark:bg-indigo-400 rounded-full opacity-60" />
            </div>
          </div>
        )}

        {/* Word Display Stream */}
        {totalChunks > 0 ? (
          <div className="w-full flex flex-col items-center justify-center gap-4">
            
            <div 
              className={`w-full px-4 text-center font-bold tracking-tight transition-opacity duration-75 ${
                countdown !== null ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ fontSize: `${settings.fontSize}px`, lineHeight: 1.15 }}
            >
              {settings.chunkSize === 1 && currentChunk?.words[0] && settings.orpEnabled ? (
                // Spritz ORP Alignment: Prefix (right 50%), ORP char (dead center), Suffix (left 50%)
                <div className="inline-flex items-baseline justify-center w-full">
                  
                  {/* Prefix */}
                  <span className="w-1/2 text-right pr-0.5 tracking-tight font-medium opacity-90">
                    {currentChunk.words[0].prefix}
                  </span>

                  {/* High-Precision ORP Character */}
                  <span 
                    className={`font-black tracking-normal scale-105 shrink-0 transition-transform ${orpColorClass}`}
                    style={settings.orpColor === 'custom' ? { color: settings.customOrpHex } : {}}
                  >
                    {currentChunk.words[0].orpChar}
                  </span>

                  {/* Suffix */}
                  <span className="w-1/2 text-left pl-0.5 tracking-tight font-medium opacity-90">
                    {currentChunk.words[0].suffix}
                  </span>

                </div>
              ) : (
                // Multi-word Chunk Layout
                <div className="flex items-center justify-center gap-2.5 flex-wrap">
                  {currentChunk?.words.map((w, idx) => (
                    <span key={idx} className="font-semibold opacity-95">
                      {w.raw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Context Sentence Breadcrumb Preview */}
            {showContextSnippet && countdown === null && (
              <div className="max-w-md px-6 text-center text-xs opacity-50 font-normal leading-relaxed truncate select-none transition-opacity duration-200">
                <span className="opacity-60">{contextSnippet.before} </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded opacity-100">
                  {contextSnippet.active}
                </span>
                <span className="opacity-60"> {contextSnippet.after}</span>
              </div>
            )}

          </div>
        ) : (
          // Empty State Prompt
          <div className="flex flex-col items-center gap-3 opacity-50 hover:opacity-80 transition-opacity">
            <FileText className="w-12 h-12 stroke-[1.5]" />
            <div className="text-center">
              <p className="font-bold text-base sm:text-lg">Okunacak Metin Bekleniyor</p>
              <p className="text-xs mt-1 opacity-70">Metin yapıştırın veya kütüphaneden seçin</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenLibrary();
              }}
              className="mt-2 text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 text-white shadow hover:bg-indigo-700 transition-colors"
            >
              Kütüphaneyi Aç
            </button>
          </div>
        )}
      </div>

      {/* Scrubber Timeline Bar */}
      {totalChunks > 0 && (
        <div className="px-6 sm:px-8 py-2">
          <div className="flex items-center gap-3">
            <input 
              type="range"
              min="0"
              max={totalChunks - 1}
              value={currentIndex}
              onChange={(e) => setCurrentIndex(Number(e.target.value))}
              disabled={isPlaying}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-black/10 dark:bg-white/10"
            />
          </div>
        </div>
      )}

      {/* Modern Control Island / Dock */}
      <div className="p-4 sm:p-6 border-t border-black/5 dark:border-white/5 flex flex-col gap-4">
        
        {/* Speed Adjustment & Quick Presets */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* WPM Slider, Stepper & Value */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-md">
            <div className="flex items-center gap-1 text-xs font-bold shrink-0 opacity-75">
              <span>Hız:</span>
              <span className="font-mono px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold min-w-[70px] text-center border border-indigo-500/20">
                {wpm} WPM
              </span>
            </div>

            <button
              onClick={() => onWpmChange(Math.max(100, wpm - 25))}
              className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100"
              title="-25 WPM (↓)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <input 
              type="range"
              min="100"
              max="1200"
              step="25"
              value={wpm}
              onChange={(e) => onWpmChange(Number(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-black/10 dark:bg-white/10"
            />

            <button
              onClick={() => onWpmChange(Math.min(1500, wpm + 25))}
              className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100"
              title="+25 WPM (↑)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Speed Preset Chips */}
          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {speedPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => onWpmChange(preset.value)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  wpm === preset.value
                    ? 'bg-indigo-600 text-white shadow-sm font-bold scale-105 shadow-indigo-500/25'
                    : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10'
                }`}
                title={preset.title}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action Buttons (Rewind, Play/Pause, Fast Forward, Reset) */}
        <div className="flex items-center justify-center gap-3 pt-1">
          
          <button
            onClick={() => jumpWords(-10)}
            disabled={totalChunks === 0 || currentIndex === 0}
            className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-30"
            title="10 Kelime Geri (← / J)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={reset}
            disabled={totalChunks === 0 || (currentIndex === 0 && !isPlaying)}
            className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 transition-colors disabled:opacity-30"
            title="Başa Dön (R)"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Large Main Play/Pause Button */}
          <button
            onClick={togglePlay}
            disabled={totalChunks === 0}
            className={`flex-1 max-w-[200px] sm:max-w-[250px] py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl transition-all active:scale-95 ${
              totalChunks === 0
                ? 'opacity-40 bg-gray-500/20 cursor-not-allowed shadow-none'
                : isPlaying || countdown !== null
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30 ring-4 ring-amber-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 ring-4 ring-indigo-600/20'
            }`}
            title="Başlat / Duraklat (Space)"
          >
            {isPlaying || countdown !== null ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Duraklat</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{currentIndex > 0 && currentIndex < totalChunks - 1 ? 'Devam Et' : 'Başlat'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => jumpWords(10)}
            disabled={totalChunks === 0 || currentIndex >= totalChunks - 1}
            className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-30"
            title="10 Kelime İleri (→ / L)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
