'use client';

import React from 'react';
import { 
  X, 
  Settings2, 
  Palette, 
  Type, 
  Eye, 
  Volume2, 
  TrendingUp, 
  Check
} from 'lucide-react';
import { FontFamily, OrpColor, Theme, UserSettings } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const themes: { id: Theme; name: string; previewBg: string; previewText: string }[] = [
    { id: 'dark', name: 'Koyu Gece', previewBg: 'bg-slate-900', previewText: 'text-white' },
    { id: 'light', name: 'Aydınlık', previewBg: 'bg-white border border-gray-200', previewText: 'text-slate-900' },
    { id: 'sepia', name: 'Sepya Kitap', previewBg: 'bg-[#f4ecd8]', previewText: 'text-[#5b4636]' },
    { id: 'oled', name: 'AMOLED Siyah', previewBg: 'bg-black', previewText: 'text-white' },
    { id: 'cyber', name: 'Cyber Gece', previewBg: 'bg-[#0b0f19]', previewText: 'text-cyan-400' },
    { id: 'custom', name: 'Özel Renkler', previewBg: 'bg-gradient-to-tr from-pink-500 to-indigo-600', previewText: 'text-white' },
  ];

  const fontOptions: { id: FontFamily; name: string; desc: string; className: string }[] = [
    { id: 'lexend', name: 'Lexend', desc: 'Hızlı Okuma ve Odak Fontu', className: 'font-lexend' },
    { id: 'sans', name: 'Inter / Sans', desc: 'Modern & Sade', className: 'font-sans-custom' },
    { id: 'serif', name: 'Merriweather', desc: 'Kitap & Klasik', className: 'font-serif-custom' },
    { id: 'mono', name: 'JetBrains Mono', desc: 'Sabit Genişlikli', className: 'font-mono-custom' },
  ];

  const orpColors: { id: OrpColor; label: string; colorClass: string; hex: string }[] = [
    { id: 'red', label: 'Kırmızı', colorClass: 'bg-red-500', hex: '#ef4444' },
    { id: 'indigo', label: 'İndigo', colorClass: 'bg-indigo-600', hex: '#4f46e5' },
    { id: 'emerald', label: 'Zümrüt', colorClass: 'bg-emerald-500', hex: '#10b981' },
    { id: 'amber', label: 'Kehribar', colorClass: 'bg-amber-500', hex: '#f59e0b' },
    { id: 'cyan', label: 'Camgöbeği', colorClass: 'bg-cyan-500', hex: '#06b6d4' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">Uygulama Ayarları</h2>
              <p className="text-xs opacity-60">Okuma deneyiminizi ve görsel tercihlerinizi özelleştirin</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* THEME SELECTION */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-70">
              <Palette className="w-4 h-4 text-indigo-500" />
              <span>Görünüm ve Tema</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onUpdateSettings({ ...settings, theme: t.id })}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    settings.theme === t.id
                      ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                      : 'border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full ${t.previewBg}`} />
                    <span className="text-xs font-bold">{t.name}</span>
                  </div>
                  {settings.theme === t.id && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </button>
              ))}
            </div>

            {/* Custom Color Palette Editor if theme === 'custom' */}
            {settings.theme === 'custom' && (
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-3 animate-in fade-in">
                <p className="text-xs font-bold">Özel Renk Paletini Düzenle</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block opacity-60 mb-1">Arka Plan</label>
                    <input 
                      type="color" 
                      value={settings.customColors.background}
                      onChange={(e) => onUpdateSettings({
                        ...settings,
                        customColors: { ...settings.customColors, background: e.target.value }
                      })}
                      className="w-full h-8 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block opacity-60 mb-1">Kart Rengi</label>
                    <input 
                      type="color" 
                      value={settings.customColors.card}
                      onChange={(e) => onUpdateSettings({
                        ...settings,
                        customColors: { ...settings.customColors, card: e.target.value }
                      })}
                      className="w-full h-8 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block opacity-60 mb-1">Yazı Rengi</label>
                    <input 
                      type="color" 
                      value={settings.customColors.text}
                      onChange={(e) => onUpdateSettings({
                        ...settings,
                        customColors: { ...settings.customColors, text: e.target.value }
                      })}
                      className="w-full h-8 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block opacity-60 mb-1">Vurgu Rengi</label>
                    <input 
                      type="color" 
                      value={settings.customColors.primary}
                      onChange={(e) => onUpdateSettings({
                        ...settings,
                        customColors: { ...settings.customColors, primary: e.target.value }
                      })}
                      className="w-full h-8 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FONT FAMILY */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-70">
              <Type className="w-4 h-4 text-indigo-500" />
              <span>Yazı Tipi (Tipografi)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {fontOptions.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onUpdateSettings({ ...settings, fontFamily: f.id })}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    settings.fontFamily === f.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500/50 ring-2 ring-indigo-500/20'
                      : 'border-black/5 dark:border-white/10 hover:bg-black/2 dark:hover:bg-white/2'
                  }`}
                >
                  <div className={f.className}>
                    <p className="text-sm font-bold">{f.name}</p>
                    <p className="text-xs opacity-60 mt-0.5">{f.desc}</p>
                  </div>
                  {settings.fontFamily === f.id && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* ORP FOCAL POINT & COLORS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-70">
              <Eye className="w-4 h-4 text-indigo-500" />
              <span>ORP Odaklama ve Renk</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/5 dark:bg-white/5">
              <div>
                <p className="text-xs font-bold">Spritz ORP Odak Çizgisi ve Harf Vurgusu</p>
                <p className="text-[11px] opacity-60">Gözün kelimeyi en hızlı tanıdığı harfi renklendirir ve sabit odakta tutar</p>
              </div>
              <button
                onClick={() => onUpdateSettings({ ...settings, orpEnabled: !settings.orpEnabled })}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.orpEnabled ? 'bg-indigo-600' : 'bg-gray-400/40'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.orpEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {settings.orpEnabled && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-semibold opacity-75 mr-1">Odak Rengi:</span>
                {orpColors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onUpdateSettings({ ...settings, orpColor: c.id, customOrpHex: c.hex })}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${c.colorClass} ${
                      settings.orpColor === c.id ? 'ring-4 ring-indigo-500/40 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  >
                    {settings.orpColor === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* FONT SIZE & CHUNK SIZE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Font Size */}
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Yazı Boyutu</span>
                <span className="font-mono bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded">
                  {settings.fontSize}px
                </span>
              </div>
              <input 
                type="range"
                min="24"
                max="100"
                step="2"
                value={settings.fontSize}
                onChange={(e) => onUpdateSettings({ ...settings, fontSize: Number(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-black/10 dark:bg-white/10"
              />
            </div>

            {/* Chunk Size */}
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-2">
              <div className="text-xs font-bold">Kelime Grubu (Blok Okuma)</div>
              <div className="flex gap-2">
                {[1, 2, 3].map((size) => (
                  <button
                    key={size}
                    onClick={() => onUpdateSettings({ ...settings, chunkSize: size as 1 | 2 | 3 })}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      settings.chunkSize === size
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {size}x {size === 1 ? 'Tek' : 'Kelime'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ADVANCED ENGINE OPTIONS: PUNCTUATION & ACCELERATE */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-70">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span>Gelişmiş Okuma Motoru</span>
            </div>

            {/* Punctuation Pause */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/5 dark:bg-white/5">
              <div>
                <p className="text-xs font-bold">Akıllı Noktalama Duraklaması</p>
                <p className="text-[11px] opacity-60">Nokta ve virgülde beynin kavraması için otomatik ek mikro gecikme verir</p>
              </div>
              <button
                onClick={() => onUpdateSettings({ ...settings, pauseOnPunctuation: !settings.pauseOnPunctuation })}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.pauseOnPunctuation ? 'bg-indigo-600' : 'bg-gray-400/40'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.pauseOnPunctuation ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {/* Auto Accelerate */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/5 dark:bg-white/5">
              <div>
                <p className="text-xs font-bold">Kademeli Otomatik Hızlanma</p>
                <p className="text-[11px] opacity-60">Okuma esnasında her 30 saniyede bir hızı otomatik +15 WPM artırır</p>
              </div>
              <button
                onClick={() => onUpdateSettings({ ...settings, autoAccelerate: !settings.autoAccelerate })}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.autoAccelerate ? 'bg-indigo-600' : 'bg-gray-400/40'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.autoAccelerate ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* SOUND EFFECTS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-70">
              <Volume2 className="w-4 h-4 text-indigo-500" />
              <span>Ses Efektleri</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/5 dark:bg-white/5">
              <div>
                <p className="text-xs font-bold">Metronom ve Geri Sayım Sesi</p>
                <p className="text-[11px] opacity-60">Web Audio API ile üretilen ritmik ahşap tıkırtı efekti</p>
              </div>
              <button
                onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.soundEnabled ? 'bg-indigo-600' : 'bg-gray-400/40'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.soundEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
