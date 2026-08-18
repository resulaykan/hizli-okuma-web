'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Sparkles, 
  Clock,
  Layers
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

  const togglePlay = () => {
    if (totalActualWords === 0) return;
    if (currentActualIndex >= totalActualWords - 1) {
      setActiveWordIndex(actualWordIndices[0] || 0);
    }
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setIsPlaying(false);
    setActiveWordIndex(actualWordIndices[0] || 0);
  };

  const handleWordClick = (index: number) => {
    setActiveWordIndex(index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* Top Controls & Mode Options */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
        
        {/* Left: Reading stats */}
        <div className="flex items-center gap-3 text-xs font-semibold opacity-80">
          <span>{currentActualIndex + 1} / {totalActualWords} kelime</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            ~{estimateReadingTime(Math.max(0, totalActualWords - currentActualIndex), wpm)}
          </span>
        </div>

        {/* Right: Bionic and Dimming Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBionicEnabled(!bionicEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
        className="relative min-h-[350px] max-h-[500px] overflow-y-auto p-6 sm:p-10 rounded-3xl border border-black/5 dark:border-white/10 shadow-xl leading-relaxed transition-all"
        style={{
          fontSize: `${Math.max(18, Math.round(settings.fontSize * 0.4))}px`,
          lineHeight: '1.8',
          backgroundColor: settings.theme === 'custom' 
            ? settings.customColors.card 
            : settings.theme === 'light'
            ? '#ffffff'
            : settings.theme === 'sepia'
            ? '#fdf6e3'
            : settings.theme === 'oled'
            ? '#000000'
            : '#0f172a'
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
                      ? 'bg-indigo-500 text-white shadow-md font-bold ring-4 ring-indigo-500/20'
                      : dimUnfocused && !isActive
                      ? 'opacity-30'
                      : isPast
                      ? 'opacity-75'
                      : 'opacity-95'
                  }`}
                >
                  {bionicEnabled && !isActive ? (
                    <>
                      <strong className="font-extrabold text-indigo-900 dark:text-indigo-200">
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
            <p className="font-semibold">Okunacak Metin Bulunamadı</p>
            <button
              onClick={onOpenLibrary}
              className="mt-3 text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-600 text-white"
            >
              Kütüphaneden Metin Seç
            </button>
          </div>
        )}
      </div>

      {/* Bottom Sticky Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
        
        {/* Speed Slider */}
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-sm">
          <span className="text-xs font-bold opacity-75 shrink-0">Hız:</span>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 min-w-[60px] text-center">
            {wpm} WPM
          </span>
          <input 
            type="range"
            min="100"
            max="800"
            step="25"
            value={wpm}
            onChange={(e) => onWpmChange(Number(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-black/10 dark:bg-white/10"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
            title="Başa Dön"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            disabled={totalActualWords === 0}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${
              isPlaying
                ? 'bg-amber-500 text-white shadow-amber-500/25'
                : 'bg-indigo-600 text-white shadow-indigo-600/25 hover:bg-indigo-700'
            }`}
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
