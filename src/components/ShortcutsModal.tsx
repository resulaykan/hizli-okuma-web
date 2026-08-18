'use client';

import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Boşluk (Space)', desc: 'Okumayı Başlat / Duraklat' },
    { key: '← (Sol Ok)', desc: '10 Kelime Geri Sar' },
    { key: '→ (Sağ Ok)', desc: '10 Kelime İleri Sar' },
    { key: '↑ (Yukarı Ok)', desc: 'Okuma Hızını +25 WPM Artır' },
    { key: '↓ (Aşağı Ok)', desc: 'Okuma Hızını -25 WPM Azalt' },
    { key: 'R', desc: 'Metni Başa Sar / Sıfırla' },
    { key: 'F', desc: 'Tam Ekran Modunu Aç / Kapat' },
    { key: 'M', desc: 'Ses Efektini Aç / Kapat' },
    { key: '1 / 2 / 3', desc: 'Kelime Blok Boyutunu Değiştir (1x, 2x, 3x)' },
    { key: 'Esc', desc: 'Pencereleri veya Tam Ekranı Kapat' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        
        <div className="p-5 sm:p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">Klavye Kısayolları</h2>
              <p className="text-xs opacity-60">Uygulamayı klavyenizle yıldırım hızında yönetin</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
          {shortcuts.map((sc, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs sm:text-sm"
            >
              <span className="opacity-80 font-medium">{sc.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-black/10 dark:border-white/10 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
