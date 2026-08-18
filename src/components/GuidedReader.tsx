'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Sparkles, 
  Clock,
  Layers,
  Minus,
  Plus
} from 'lucide-react';
import { UserSettings } from '@/types';
import { generateBionicWords, estimateReadingTime } from '@/lib/orp';
import { soundEngine } from '@/lib/audio';

interface GuidedReaderProps {
  text: string;
  wpm: number;
  onWpmChange: (wpm: number) => void;
  settings: UserSettings;
  onReadingComplete: (wordsCount: number, secondsRead: number, averageWpm: number) => void;
  onOpenLibrary: () => void;
}

export const GuidedReader: React.FC<GuidedReaderProps> = ({
  text,
  wpm,
  onWpmChange,
  settings,
  onReadingComplete,
  onOpenLibrary,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [bionicEnabled, setBionicEnabled] = useState(true);
  const [dimUnfocused, setDimUnfocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Split text into words while keeping whitespace and formatting
  const parsedWords = useMemo(() => {
    return generateBionicWords(text);
  }, [text]);

  // Actual countable words (excluding pure whitespace)
  const actualWordIndices = useMemo(() => {
    const indices: number[] = [];
    parsedWords.forEach((pw, idx) => {
      if (pw.bold.length > 0 || pw.rest.trim().length > 0) {
        indices.push(idx);
      }
    });
    return indices;
  }, [parsedWords]);

  const totalActualWords = actualWordIndices.length;
  const currentActualPosition = actualWordIndices.indexOf(activeWordIndex);
  const currentActualIndex = currentActualPosition !== -1 ? currentActualPosition : 0;

  // Auto-scroll to active word smoothly
  useEffect(() => {
    if (isPlaying && activeWordRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, [isPlaying, activeWordIndex]);

  // Guided playback loop
  useEffect(() => {
    if (!isPlaying || totalActualWords === 0) return;

    const msPerWord = (60000 / wpm);

    const step = () => {
      const nextPos = currentActualPosition + 1;
      if (nextPos >= totalActualWords) {
        setIsPlaying(false);
        onReadingComplete(totalActualWords, (totalActualWords / wpm) * 60, wpm);
        return;
      }

      const nextRealIndex = actualWordIndices[nextPos];
      setActiveWordIndex(nextRealIndex);

      if (settings.soundEnabled) {
        soundEngine.playMetronomeTick(settings.soundVolume);
      }

      timerRef.current = setTimeout(step, msPerWord);
    };

    timerRef.current = setTimeout(step, msPerWord);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentActualPosition, totalActualWords, actualWordIndices, wpm, settings, onReadingComplete]);

  const togglePlay = useCallback(() => {
    if (totalActualWords === 0) return;
    if (currentActualIndex >= totalActualWords - 1) {
      setActiveWordIndex(actualWordIndices[0] || 0);
    }
    setIsPlaying(prev => !prev);
  }, [totalActualWords, currentActualIndex, actualWordIndices]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setActiveWordIndex(actualWordIndices[0] || 0);
  }, [actualWordIndices]);

  // Dedicated keyboard shortcut listener for Guided mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, reset]);

  const handleWordClick = (index: number) => {
    setActiveWordIndex(index);
  };

  const getContainerStyles = () => {
    switch (settings.theme) {
      case 'light':
        return 'bg-white border-slate-200/80 card-shadow-light text-slate-900';
      case 'sepia':
        return 'bg-[#fcf7ec] border-[#e6dbb9] card-shadow-sepia text-[#2e2117]';
      case 'oled':
        return 'bg-black border-white/20 card-shadow-oled text-white';
      case 'cyber':
        return 'bg-[#0b1021] border-cyan-500/20 text-cyan-50';
      default:
        return 'bg-[#0f172a] border-white/10 card-shadow-dark text-slate-100';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-5">
      
      {/* Top Controls & Mode Options */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
        
        {/* Left: Reading stats */}
        <div className="flex items-center gap-3 text-xs font-semibold opacity-80">
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {currentActualIndex + 1} / {totalActualWords} kelime
          </span>
          <span className="opacity-40">•</span>
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5" />
            ~{estimateReadingTime(Math.max(0, totalActualWords - currentActualIndex), wpm)}
          </span>
        </div>

        {/* Right: Bionic and Dimming Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBionicEnabled(!bionicEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              bionicEnabled
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Biyonik Vurgu</span>
          </button>

          <button
            onClick={() => setDimUnfocused(!dimUnfocused)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              dimUnfocused
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Odak Karartması</span>
          </button>
        </div>
      </div>

      {/* Main Guided Paragraph Reader Container */}
      <div 
        ref={containerRef}
        className={`relative min-h-[350px] max-h-[500px] overflow-y-auto p-6 sm:p-10 rounded-3xl border transition-all ${getContainerStyles()}`}
        style={{
          fontSize: `${Math.max(18, Math.round(settings.fontSize * 0.4))}px`,
          lineHeight: '1.85',
        }}
      >
        {totalActualWords > 0 ? (
          <div className="space-y-4">
            {parsedWords.map((wordObj, index) => {
              const isPureWhitespace = /^\s+$/.test(wordObj.raw);
              if (isPureWhitespace) {
                return <span key={index}>{wordObj.raw}</span>;
              }

              const isActive = index === activeWordIndex;
              const isPast = index < activeWordIndex;

              return (
                <span
                  key={index}
                  ref={isActive ? activeWordRef : null}
                  onClick={() => handleWordClick(index)}
                  className={`inline cursor-pointer rounded px-0.5 transition-all duration-100 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md font-bold ring-4 ring-indigo-500/25'
                      : dimUnfocused && !isActive
                      ? 'opacity-25'
                      : isPast
                      ? 'opacity-70'
                      : 'opacity-95'
                  }`}
                >
                  {bionicEnabled && !isActive ? (
                    <>
                      <strong className="font-extrabold text-indigo-700 dark:text-indigo-300">
                        {wordObj.bold}
                      </strong>
                      <span>{wordObj.rest}</span>
                    </>
                  ) : (
                    wordObj.raw
                  )}
                </span>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-16">
            <Eye className="w-12 h-12 stroke-[1.5] mb-2" />
            <p className="font-bold">Okunacak Metin Bulunamadı</p>
            <button
              onClick={onOpenLibrary}
              className="mt-3 text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 text-white shadow hover:bg-indigo-700"
            >
              Kütüphaneden Metin Seç
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
        
        {/* Speed Slider & Stepper */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-sm">
          <span className="text-xs font-bold opacity-75 shrink-0">Hız:</span>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 min-w-[65px] text-center">
            {wpm} WPM
          </span>

          <button
            onClick={() => onWpmChange(Math.max(100, wpm - 25))}
            className="p-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100"
            title="-25 WPM (↓)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <input 
            type="range"
            min="100"
            max="800"
            step="25"
            value={wpm}
            onChange={(e) => onWpmChange(Number(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-black/10 dark:bg-white/10"
          />

          <button
            onClick={() => onWpmChange(Math.min(1200, wpm + 25))}
            className="p-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100"
            title="+25 WPM (↑)"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
            title="Başa Dön (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            disabled={totalActualWords === 0}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
              isPlaying
                ? 'bg-amber-500 text-white shadow-amber-500/25'
                : 'bg-indigo-600 text-white shadow-indigo-600/25 hover:bg-indigo-700'
            }`}
            title="Başlat / Duraklat (Space)"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Duraklat</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Kılavuzu Başlat</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
