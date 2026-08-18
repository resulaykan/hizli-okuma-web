'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  BookOpen, 
  UploadCloud, 
  Clipboard, 
  Search, 
  ArrowRight
} from 'lucide-react';
import { PRESET_LIBRARY } from '@/lib/library';
import { estimateReadingTime } from '@/lib/orp';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectText: (text: string, title?: string) => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectText,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customInput, setCustomInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'upload'>('presets');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [importedFilename, setImportedFilename] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Tümü' },
    { id: 'edebiyat', label: 'Edebiyat' },
    { id: 'tarih', label: 'Tarih' },
    { id: 'felsefe', label: 'Felsefe' },
    { id: 'bilim', label: 'Bilim & Teknoloji' },
    { id: 'rehber', label: 'Rehberler' },
  ];

  const filteredLibrary = PRESET_LIBRARY.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFileUpload = (file: File) => {
    if (!file) return;
    setImportedFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setCustomInput(content);
        setActiveTab('custom');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCustomInput(text);
    } catch {
      alert('Panoya erişim izni verilemedi.');
    }
  };

  const wordCount = customInput.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">Metin Kütüphanesi & Yükleme</h2>
              <p className="text-xs opacity-60">Seçkin eserlerden okuyun veya kendi belgenizi yükleyin</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 flex items-center gap-2 border-b border-black/5 dark:border-white/10">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'presets'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            Hazır Kütüphane ({PRESET_LIBRARY.length})
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'custom'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            Özel Metin Yapıştır
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            Dosya Yükle (.txt, .md)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              
              {/* Search and Category Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="text"
                    placeholder="Başlık, yazar veya konu ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-black/5 dark:bg-white/5 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Library Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {filteredLibrary.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectText(item.content, item.title);
                      onClose();
                    }}
                    className="p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-black/2 dark:bg-white/2 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 hover:border-indigo-500/40 cursor-pointer transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          {item.category}
                        </span>
                        <span className="text-[11px] opacity-60 font-medium">
                          {item.difficulty}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm sm:text-base mt-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs opacity-60 font-medium mt-0.5">
                        {item.author}
                      </p>
                      <p className="text-xs opacity-75 mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-xs opacity-60">
                      <span>{item.wordCount} kelime</span>
                      <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                        Seç ve Oku
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: CUSTOM TEXT INPUT */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-semibold opacity-70">
                  <span>{wordCount} kelime</span>
                  <span>•</span>
                  <span>{customInput.length} karakter</span>
                  <span>•</span>
                  <span>~{estimateReadingTime(wordCount, 300)} (300 WPM)</span>
                </div>

                <button
                  onClick={handlePasteClipboard}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Panodan Yapıştır</span>
                </button>
              </div>

              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Buraya okumak istediğiniz herhangi bir makale, kitap bölümü, haber veya ders notunu yapıştırın..."
                className="w-full h-64 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 outline-none resize-none focus:ring-2 focus:ring-indigo-500 font-sans text-sm sm:text-base leading-relaxed"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setCustomInput('')}
                  className="px-4 py-2 rounded-xl text-xs font-bold opacity-60 hover:opacity-100"
                >
                  Temizle
                </button>

                <button
                  onClick={() => {
                    if (customInput.trim().length > 0) {
                      onSelectText(customInput, importedFilename || 'Özel Metin');
                      onClose();
                    }
                  }}
                  disabled={wordCount === 0}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 disabled:opacity-40"
                >
                  Metni Okumaya Başla
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.text"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-64 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-500/10 scale-98'
                    : 'border-black/15 dark:border-white/15 hover:border-indigo-500 bg-black/2 dark:bg-white/2 hover:bg-black/5'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-base">Metin Dosyasını Buraya Sürükleyin</h4>
                <p className="text-xs opacity-60 mt-1 max-w-xs">
                  .txt veya .md formatındaki dosyalarınızı yükleyerek anında hızlı okuma motoruna aktarın
                </p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow hover:bg-indigo-700"
                >
                  Dosya Seç
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
