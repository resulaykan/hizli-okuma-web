'use client';

import React from 'react';
import { 
  Zap, 
  BookOpen, 
  Grid3X3, 
  Eye, 
  Library, 
  BarChart3, 
  Keyboard, 
  Settings2
} from 'lucide-react';
import { AppMode, UserSettings } from '@/types';

interface NavbarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onOpenLibrary: () => void;
  onOpenStats: () => void;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
  settings: UserSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onModeChange,
  onOpenLibrary,
  onOpenStats,
  onOpenShortcuts,
  onOpenSettings,
}) => {
  const modes = [
    { id: 'rsvp' as AppMode, label: 'RSVP Odak', icon: Zap },
    { id: 'guided' as AppMode, label: 'Biyonik Akış', icon: BookOpen },
    { id: 'schulte' as AppMode, label: 'Schulte 5x5', icon: Grid3X3 },
    { id: 'eye-training' as AppMode, label: 'Göz Egzersizi', icon: Eye },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-colors duration-300 border-black/5 dark:border-white/10 bg-white/70 dark:bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Zap className="w-5 h-5 fill-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
                Hızlı Okuma <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-semibold dark:bg-indigo-400/15 dark:text-indigo-300">PRO</span>
              </span>
              <span className="text-[11px] opacity-60 font-medium hidden sm:inline-block">
                Bilimsel RSVP & Odaklama Platformu
              </span>
            </div>
          </div>

          {/* Center Mode Selector (Desktop / Tablet) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = currentMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => onModeChange(mode.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenLibrary}
              title="Metin Kütüphanesi & Yükle"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
            >
              <Library className="w-4 h-4" />
              <span className="hidden sm:inline">Kütüphane</span>
            </button>

            <button
              onClick={onOpenStats}
              title="Okuma İstatistikleri"
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-80 hover:opacity-100"
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenShortcuts}
              title="Klavye Kısayolları"
              className="hidden lg:flex p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-80 hover:opacity-100"
            >
              <Keyboard className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenSettings}
              title="Ayarlar"
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-80 hover:opacity-100 relative"
            >
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Ultra Smooth on Phones) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-black/5 dark:border-white/10 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                  : 'opacity-60 hover:opacity-100 text-current'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] mt-0.5">{mode.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
