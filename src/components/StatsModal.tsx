'use client';

import React from 'react';
import { 
  X, 
  BarChart3, 
  Flame, 
  BookOpen, 
  Clock, 
  Zap, 
  Trophy, 
  RotateCcw
} from 'lucide-react';
import { UserStats } from '@/types';
import { formatTimeEstimate } from '@/lib/orp';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onResetStats: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onResetStats,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">Okuma İstatistikleri</h2>
              <p className="text-xs opacity-60">Gelişiminizi ve okuma performansınızı takip edin</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Stats Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Streak Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-red-500/15 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                <Flame className="w-6 h-6 fill-current" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Günlük Okuma Serisi</p>
                <p className="text-sm opacity-80 font-medium">Her gün okuyarak beyninizi eğitin</p>
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
              {stats.streakDays} Gün
            </div>
          </div>

          {/* 4-Stat Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Total Words Read */}
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between opacity-60 text-xs font-semibold">
                <span>Okunan Kelime</span>
                <BookOpen className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black font-mono">
                {stats.totalWordsRead.toLocaleString('tr-TR')}
              </p>
              <p className="text-[11px] opacity-50 font-medium">{stats.sessionsCompleted} oturum tamamlandı</p>
            </div>

            {/* Total Time Read */}
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between opacity-60 text-xs font-semibold">
                <span>Toplam Süre</span>
                <Clock className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black font-mono">
                {formatTimeEstimate(stats.totalSecondsRead)}
              </p>
              <p className="text-[11px] opacity-50 font-medium">Toplam okuma süresi</p>
            </div>

            {/* Highest WPM */}
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between opacity-60 text-xs font-semibold">
                <span>En Yüksek Hız</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black font-mono text-amber-500">
                {stats.highestWpm} <span className="text-xs font-normal">WPM</span>
              </p>
              <p className="text-[11px] opacity-50 font-medium">Ulaşılan zirve hız</p>
            </div>

            {/* Schulte Record */}
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between opacity-60 text-xs font-semibold">
                <span>Schulte Tablosu</span>
                <Trophy className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-500">
                {stats.schulteBestTimeSeconds ? `${stats.schulteBestTimeSeconds} sn` : '-'}
              </p>
              <p className="text-[11px] opacity-50 font-medium">5x5 en iyi derece</p>
            </div>

          </div>

          {/* Reset Stats Option */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                if (confirm('Tüm okuma istatistiklerini sıfırlamak istediğinize emin misiniz?')) {
                  onResetStats();
                }
              }}
              className="text-xs opacity-50 hover:opacity-100 hover:text-red-500 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>İstatistikleri Sıfırla</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
