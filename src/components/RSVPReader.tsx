'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  FileText
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

  const containerRef = useRef<HTMLDivElement>(null);
  const sessionStartTimeRef = useRef<number | null>(null);
  const autoAccelCounterRef = useRef<number>(0);

  // Split text into chunks based on settings
  const chunks: ChunkItem[] = useMemo(() => {
    return splitIntoChunks(text, settings.chunkSize, settings.pauseOnPunctuation);
  }, [text, settings.chunkSize, settings.pauseOnPunctuation]);

  const totalChunks = chunks.length;
  const currentChunk = chunks[currentIndex] || null;
  const progressPercent = totalChunks > 0 ? (currentIndex / totalChunks) * 100 : 0;

  const totalWords = useMemo(() => {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }, [text]);

  const remainingWords = useMemo(() => {
    if (totalChunks === 0) return 0;
    const remainingChunks = totalChunks - currentIndex;
    return Math.min(totalWords, remainingChunks * settings.chunkSize);
  }, [totalChunks, currentIndex, totalWords, settings.chunkSize]);

  // ORP focal colors map
  const orpColorClass = useMemo(() => {
    switch (settings.orpColor) {
      case 'red': return 'text-red-500 dark:text-red-400';
      case 'indigo': return 'text-indigo-600 dark:text-indigo-400';
      case 'emerald': return 'text-emerald-500 dark:text-emerald-400';
      case 'amber': return 'text-amber-500 dark:text-amber-400';
      case 'cyan': return 'text-cyan-500 dark:text-cyan-400';
      case 'custom': return '';
      default: return 'text-red-500';
    }
  }, [settings.orpColor]);

  // Handle countdown cleanly
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

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const togglePlay = () => {
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
  };

  const reset = () => {
    setIsPlaying(false);
    setCountdown(null);
    setCurrentIndex(0);
    setSessionElapsedSeconds(0);
    sessionStartTimeRef.current = null;
    autoAccelCounterRef.current = 0;
  };

  const jumpWords = (delta: number) => {
    const chunkDelta = Math.round(delta / settings.chunkSize);
    setCurrentIndex(prev => Math.max(0, Math.min(totalChunks - 1, prev + chunkDelta)));
  };

  // Preset speed buttons
  const speedPresets = [
    { label: '200', value: 200, title: 'Başlangıç' },
    { label: '350', value: 350, title: 'Orta' },
    { label: '500', value: 500, title: 'Hızlı' },
    { label: '700', value: 700, title: 'İleri' },
    { label: '900', value: 900, title: 'Master' },
  ];

  return (
    <div 
      ref={containerRef}
      className={`relative w-full max-w-4xl mx-auto flex flex-col justify-between rounded-3xl transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none h-screen p-6 md:p-12 justify-center'
          : 'border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden'
      }`}
      style={{
        backgroundColor: settings.theme === 'custom' 
          ? settings.customColors.card 
          : settings.theme === 'light'
          ? '#ffffff'
          : settings.theme === 'sepia'
          ? '#f4ecd8'
          : settings.theme === 'oled'
          ? '#000000'
          : '#0f172a'
      }}
    >
      {/* Top Header Controls / Info */}
      <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-black/5 dark:border-white/5 opacity-80 text-xs sm:text-sm">
        
        {/* Left: Progress Indicator */}
        <div className="flex items-center gap-2 font-medium">
          <span className="font-mono font-semibold">
            {totalChunks > 0 ? currentIndex + 1 : 0} / {totalChunks}
          </span>
          <span className="opacity-40">•</span>
          <span className="opacity-70 hidden sm:inline">
            {remainingWords} kelime kaldı
          </span>
          <span className="opacity-40 hidden sm:inline">•</span>
          <span className="flex items-center gap-1 opacity-70">
            <Clock className="w-3.5 h-3.5" />
            ~{estimateReadingTime(remainingWords, wpm)}
          </span>
        </div>

        {/* Right: Mode status & quick buttons */}
        <div className="flex items-center gap-2">
          {settings.autoAccelerate && (
            <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 animate-pulse">
              <TrendingUp className="w-3 h-3" />
              Oto-Hızlanma
            </span>
          )}

          <button
            onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
            className={`p-1.5 rounded-lg transition-colors ${settings.soundEnabled ? 'text-indigo-500 bg-indigo-500/10' : 'opacity-50 hover:opacity-100'}`}
            title={settings.soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-black/5 dark:bg-white/5 relative">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-150 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Speed Boost Notification Badge */}
      {speedBoostNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/30 animate-bounce flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 fill-current" />
          {speedBoostNotification}
        </div>
      )}

      {/* Main Display Area (The Focal Reader Box) */}
      <div 
        onClick={togglePlay}
        className={`relative w-full flex flex-col items-center justify-center cursor-pointer select-none transition-all ${
          isFullscreen ? 'min-h-[60vh]' : 'h-64 sm:h-80'
        }`}
      >
        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-xs bg-black/10 dark:bg-black/40 animate-in fade-in duration-150">
            <div className="text-8xl sm:text-9xl font-black tracking-tighter text-indigo-500 drop-shadow-2xl animate-pulse">
              {countdown > 0 ? countdown : 'BAŞLA!'}
            </div>
          </div>
        )}

        {/* ORP Alignment Top & Bottom Anchor Crosshairs */}
        {settings.orpEnabled && settings.chunkSize === 1 && totalChunks > 0 && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-6 items-center opacity-30">
            <div className="w-0.5 h-4 bg-current rounded-full" />
            <div className="w-0.5 h-4 bg-current rounded-full" />
          </div>
        )}

        {/* Word Display */}
        {totalChunks > 0 ? (
          <div 
            className={`w-full px-4 text-center font-bold tracking-tight transition-opacity duration-75 ${
              countdown !== null ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ fontSize: `${settings.fontSize}px`, lineHeight: 1.15 }}
          >
            {settings.chunkSize === 1 && currentChunk?.words[0] && settings.orpEnabled ? (
              // Single Word SPRITZ-ORP Perfectly Centered Layout
              <div className="inline-flex items-baseline justify-center w-full">
                {/* Prefix (Right-aligned to focal point) */}
                <span className="w-1/2 text-right pr-0.5 tracking-tight font-medium opacity-90">
                  {currentChunk.words[0].prefix}
                </span>

                {/* ORP Letter (Stationary Focus Point) */}
                <span 
                  className={`font-black tracking-normal scale-105 shrink-0 ${orpColorClass}`}
                  style={settings.orpColor === 'custom' ? { color: settings.customOrpHex } : {}}
                >
                  {currentChunk.words[0].orpChar}
                </span>

                {/* Suffix (Left-aligned from focal point) */}
                <span className="w-1/2 text-left pl-0.5 tracking-tight font-medium opacity-90">
                  {currentChunk.words[0].suffix}
                </span>
              </div>
            ) : (
              // Multi-word Chunk or Standard RSVP Layout
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {currentChunk?.words.map((w, idx) => (
                  <span key={idx} className="font-semibold opacity-95">
                    {w.raw}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Empty State Prompt
          <div className="flex flex-col items-center gap-3 opacity-40 hover:opacity-70 transition-opacity">
            <FileText className="w-12 h-12 stroke-[1.5]" />
            <div className="text-center">
              <p className="font-semibold text-base sm:text-lg">Okunacak Metin Bekleniyor</p>
              <p className="text-xs mt-1">Aşağıdaki alana metin yapıştırın veya kütüphaneden seçin</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenLibrary();
              }}
              className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow hover:bg-indigo-700 transition-colors"
            >
              Kütüphaneyi Aç
            </button>
          </div>
        )}
      </div>

      {/* Scrubber Timeline Bar */}
      {totalChunks > 0 && (
        <div className="px-5 sm:px-8 py-2">
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

      {/* Bottom Control Bar */}
      <div className="p-4 sm:p-6 border-t border-black/5 dark:border-white/5 flex flex-col gap-4">
        
        {/* Speed Adjustment & Presets */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* WPM Slider & Value */}
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
            <div className="flex items-center gap-1 text-xs font-bold shrink-0 opacity-75">
              <span>Hız:</span>
              <span className="font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-bold min-w-[65px] text-center">
                {wpm} WPM
              </span>
            </div>

            <input 
              type="range"
              min="100"
              max="1200"
              step="25"
              value={wpm}
              onChange={(e) => onWpmChange(Number(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-black/10 dark:bg-white/10"
            />
          </div>

          {/* Quick Speed Preset Chips */}
          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {speedPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => onWpmChange(preset.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  wpm === preset.value
                    ? 'bg-indigo-600 text-white shadow-sm scale-105'
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
            className="p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-30"
            title="10 Kelime Geri (←)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={reset}
            disabled={totalChunks === 0 || (currentIndex === 0 && !isPlaying)}
            className="p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-colors disabled:opacity-30"
            title="Başa Dön (R)"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Large Main Play/Pause Button */}
          <button
            onClick={togglePlay}
            disabled={totalChunks === 0}
            className={`flex-1 max-w-[200px] sm:max-w-[240px] py-3 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-95 ${
              totalChunks === 0
                ? 'opacity-40 bg-gray-500/20 cursor-not-allowed shadow-none'
                : isPlaying || countdown !== null
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
            }`}
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
            className="p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-30"
            title="10 Kelime İleri (→)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
