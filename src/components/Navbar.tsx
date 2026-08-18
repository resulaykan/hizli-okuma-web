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
  Settings2,
  Sun,
  Moon
} from 'lucide-react';
import { AppMode, UserSettings } from '@/types';

interface NavbarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onOpenLibrary: () => void;
  onOpenStats: () => void;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  settings: UserSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onModeChange,
  onOpenLibrary,
  onOpenStats,
  onOpenShortcuts,
  onOpenSettings,
  onToggleTheme,
  settings,
}) => {
  const modes = [
    { id: 'rsvp' as AppMode, label: 'RSVP Odak', icon: Zap },
    { id: 'guided' as AppMode, label: 'Biyonik Akış', icon: BookOpen },
    { id: 'schulte' as AppMode, label: 'Schulte 5x5', icon: Grid3X3 },
    { id: 'eye-training' as AppMode, label: 'Göz Egzersizi', icon: Eye },
  ];

  // Dynamic Theme Navbar Styling
  const getNavStyles = () => {
    switch (settings.theme) {
      case 'light':
        return 'bg-white/85 border-slate-200/80 text-slate-900 shadow-xs';
      case 'sepia':
        return 'bg-[#f4ecd8]/90 border-[#e6dbb9] text-[#4a392c] shadow-xs';
      case 'oled':
        return 'bg-black/90 border-white/15 text-white';
      case 'cyber':
        return 'bg-[#080d1a]/85 border-cyan-500/20 text-cyan-50';
      case 'custom':
        return 'border-black/5 dark:border-white/10';
      default: // dark
        return 'bg-slate-950/80 border-white/10 text-slate-100 shadow-md';
    }
  };

  const getActiveTabStyles = (isActive: boolean) => {
    if (!isActive) {
      return settings.theme === 'light'
        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
        : settings.theme === 'sepia'
        ? 'text-[#5b4636]/70 hover:text-[#5b4636] hover:bg-[#e6dbb9]/50'
        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5';
    }

    switch (settings.theme) {
      case 'light':
        return 'bg-white text-indigo-600 shadow-sm font-bold border border-slate-200/60';
      case 'sepia':
        return 'bg-[#fcf7ec] text-[#4a392c] shadow-sm font-bold border border-[#e6dbb9]';
      case 'oled':
        return 'bg-white text-black font-bold';
      case 'cyber':
        return 'bg-cyan-950/60 text-cyan-400 font-bold border border-cyan-500/30';
      default: // dark
        return 'bg-slate-800 text-indigo-400 shadow-sm font-bold border border-white/10';
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-all duration-300 ${getNavStyles()}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Zap className="w-5 h-5 fill-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-1.5">
                Hızlı Okuma <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">PRO</span>
              </span>
              <span className="text-[10px] sm:text-[11px] opacity-60 font-medium hidden sm:inline-block">
                Bilimsel RSVP & Odak Platformu
              </span>
            </div>
          </div>

          {/* Center Mode Selector (Desktop / Tablet) */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = currentMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => onModeChange(mode.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all duration-150 ${getActiveTabStyles(isActive)}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenLibrary}
              title="Metin Kütüphanesi & Dosya Yükle"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Library className="w-3.5 h-3.5" />
              <span>Kütüphane</span>
            </button>

            {/* Quick 1-Click Theme Switcher */}
            <button
              onClick={onToggleTheme}
              title={settings.theme === 'light' ? "Karanlık Mod'a Geç" : "Aydınlık Mod'a Geç"}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-75 hover:opacity-100"
            >
              {settings.theme === 'light' ? (
                <Moon className="w-4.5 h-4.5 text-indigo-600" />
              ) : (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              )}
            </button>

            <button
              onClick={onOpenStats}
              title="Okuma İstatistikleri"
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-75 hover:opacity-100"
            >
              <BarChart3 className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={onOpenShortcuts}
              title="Klavye Kısayolları (?)"
              className="hidden lg:flex p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-75 hover:opacity-100"
            >
              <Keyboard className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={onOpenSettings}
              title="Uygulama Ayarları"
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-75 hover:opacity-100 relative"
            >
              <Settings2 className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t px-2 py-1.5 flex items-center justify-around shadow-lg transition-colors ${getNavStyles()}`}>
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
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
