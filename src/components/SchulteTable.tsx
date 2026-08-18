'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  Play, 
  Timer, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { recordSchulteTime, loadStoredStats } from '@/lib/storage';
import { soundEngine } from '@/lib/audio';

function createShuffledGrid(): number[] {
  const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
}

export const SchulteTable: React.FC = () => {
  const [grid, setGrid] = useState<number[]>(createShuffledGrid);
  const [currentNumber, setCurrentNumber] = useState<number>(1);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bestScore, setBestScore] = useState<number | null>(() => loadStoredStats().schulteBestTimeSeconds);
  const [errorCell, setErrorCell] = useState<number | null>(null);

  const handleStart = useCallback(() => {
    setGrid(createShuffledGrid());
    setCurrentNumber(1);
    setIsCompleted(false);
    setElapsedTime(0);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const startPerf = performance.now();
    const interval = setInterval(() => {
      setElapsedTime((performance.now() - startPerf) / 1000);
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleCellClick = (num: number) => {
    if (!isPlaying) {
      handleStart();
      return;
    }

    if (num === currentNumber) {
      soundEngine.playCountdownTick(false, 0.15);
      if (currentNumber === 25) {
        // Completed!
        setIsPlaying(false);
        setIsCompleted(true);
        const finalTime = elapsedTime;
        
        soundEngine.playCelebrationChime(0.4);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        const updatedStats = recordSchulteTime(Number(finalTime.toFixed(2)));
        setBestScore(updatedStats.schulteBestTimeSeconds);
      } else {
        setCurrentNumber(prev => prev + 1);
      }
    } else {
      // Wrong number clicked
      setErrorCell(num);
      setTimeout(() => setErrorCell(null), 300);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6">
      
      {/* Header & Best Score */}
      <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs opacity-60 font-semibold">En İyi Derece</p>
            <p className="text-sm font-bold font-mono">
              {bestScore ? `${bestScore.toFixed(2)} sn` : 'Henüz Yok'}
            </p>
          </div>
        </div>

        {/* Live Timer */}
        <div className="flex items-center gap-2 font-mono">
          <Timer className="w-5 h-5 opacity-60" />
          <span className="text-2xl font-black tracking-tight">
            {elapsedTime.toFixed(2)} <span className="text-xs font-normal opacity-60">sn</span>
          </span>
        </div>

        {/* Next Target Indicator */}
        <div className="flex flex-col items-end">
          <span className="text-xs opacity-60 font-semibold">Hedef Sayı</span>
          <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {currentNumber <= 25 ? currentNumber : '✓'}
          </span>
        </div>
      </div>

      {/* 5x5 Schulte Grid */}
      <div className="relative w-full aspect-square max-w-md p-3 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-2xl">
        
        {/* Center Anchor Dot for Peripheral Vision Focus */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-500/40 pointer-events-none z-10 animate-ping" />

        <div className="w-full h-full grid grid-cols-5 gap-2">
          {grid.map((num) => {
            const isPassed = isPlaying && num < currentNumber;
            const isError = errorCell === num;

            return (
              <button
                key={num}
                onClick={() => handleCellClick(num)}
                className={`w-full h-full rounded-2xl text-lg sm:text-2xl font-black font-mono transition-all flex items-center justify-center select-none shadow-sm active:scale-90 ${
                  isError
                    ? 'bg-red-500 text-white animate-shake'
                    : isPassed
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 opacity-60'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:scale-105 border border-black/5 dark:border-white/5'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Completion Modal Overlay */}
        {isCompleted && (
          <div className="absolute inset-0 z-30 rounded-3xl bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black">Harika Sonuç!</h3>
            <p className="text-sm opacity-80 mt-1">
              5x5 Schulte Tablosunu tamamladınız.
            </p>
            <div className="text-4xl font-black font-mono my-4 text-emerald-400">
              {elapsedTime.toFixed(2)} sn
            </div>
            <button
              onClick={handleStart}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-sm shadow-lg flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tekrar Oyna</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls & Instructions */}
      <div className="w-full flex items-center justify-between gap-4">
        <button
          onClick={handleStart}
          className="flex-1 py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          {isPlaying ? (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>Yeniden Başlat</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Egzersize Başla</span>
            </>
          )}
        </button>
      </div>

      {/* Guide Note */}
      <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs opacity-75 space-y-1.5 w-full">
        <div className="font-bold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
          <HelpCircle className="w-4 h-4" />
          <span>Schulte Tablosu Nasıl Çalışır?</span>
        </div>
        <p>
          Gözünüzü tablonun tam ortasındaki kırmızı noktaya sabitleyin. Gözlerinizi hareket ettirmeden, çevresel (periferik) görüşünüzle 1&apos;den 25&apos;e kadar olan sayıları sırasıyla bulun ve tıklayın. Bu egzersiz görüş açınızı genişletir ve okuma hızınızı ikiye katlar.
        </p>
      </div>

    </div>
  );
};
