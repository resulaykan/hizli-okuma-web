'use client';

import React, { useEffect } from 'react';
import { 
  Trophy, 
  X, 
  RotateCcw, 
  BookOpen, 
  Clock, 
  Zap, 
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatTimeEstimate } from '@/lib/orp';
import { soundEngine } from '@/lib/audio';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  wordsRead: number;
  secondsRead: number;
  wpm: number;
  textTitle?: string;
  onReplay: () => void;
  onOpenLibrary: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  onClose,
  wordsRead,
  secondsRead,
  wpm,
  textTitle,
  onReplay,
  onOpenLibrary,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundEngine.playCelebrationChime(0.35);
      
      // Multi-cannon confetti burst
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // Ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-md animate-in zoom-in-95 duration-200">
      
      <div className="relative w-full max-w-md flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Trophy Icon with Glow */}
        <div className="relative my-2">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-xl shadow-amber-500/30 animate-bounce">
            <Trophy className="w-10 h-10 fill-current" />
          </div>
          <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-spin" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black mt-3">Tebrikler! Metin Tamamlandı</h2>
        <p className="text-xs opacity-70 mt-1 max-w-xs line-clamp-1">
          {textTitle || 'Okuma seansınızı başarıyla tamamladınız.'}
        </p>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-3 gap-2.5 my-6">
          
          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col items-center">
            <BookOpen className="w-4 h-4 text-indigo-500 mb-1" />
            <span className="text-[10px] opacity-60 font-semibold">Kelime</span>
            <span className="text-base font-black font-mono mt-0.5">{wordsRead}</span>
          </div>

          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col items-center">
            <Clock className="w-4 h-4 text-purple-500 mb-1" />
            <span className="text-[10px] opacity-60 font-semibold">Süre</span>
            <span className="text-base font-black font-mono mt-0.5">{formatTimeEstimate(secondsRead)}</span>
          </div>

          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col items-center">
            <Zap className="w-4 h-4 text-amber-500 mb-1" />
            <span className="text-[10px] opacity-60 font-semibold">Hız</span>
            <span className="text-base font-black font-mono mt-0.5 text-amber-500">{wpm} WPM</span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              onClose();
              onReplay();
            }}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tekrar Oku</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenLibrary();
            }}
            className="w-full py-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Yeni Metin Seç</span>
          </button>
        </div>

      </div>

    </div>
  );
};
