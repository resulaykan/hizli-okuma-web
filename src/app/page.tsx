'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  ArrowRightIcon, 
  BookOpenIcon, 
  PauseIcon, 
  ArrowPathIcon,
  Cog6ToothIcon,
  XMarkIcon,
  SwatchIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PaintBrushIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ClockIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  StopIcon
} from '@heroicons/react/24/outline';

// Tipler
type Theme = 'default' | 'sepia' | 'dark' | 'custom';
type ChunkSize = 1 | 2 | 3;
type FontSize = number;
type FontFamily = 'sans' | 'serif' | 'mono';

const SAMPLE_TEXT = `Ey Türk gençliği! Birinci vazifen; Türk istiklalini, Türk cumhuriyetini, ilelebet muhafaza ve müdafaa etmektir. Mevcudiyetinin ve istikbalinin yegâne temeli budur. Bu temel, senin en kıymetli hazinendir. İstikbalde dahi, seni bu hazineden mahrum etmek isteyecek dâhilî ve haricî bedhahların olacaktır. Bir gün, istiklal ve cumhuriyeti müdafaa mecburiyetine düşersen, vazifeye atılmak için, içinde bulunacağın vaziyetin imkân ve şeraitini düşünmeyeceksin!`;

export default function Home() {
  // --- State Yönetimi ---
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [wpm, setWpm] = useState(300);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const readerRef = useRef<HTMLDivElement>(null);

  // Ayarlar State'i
  const [settings, setSettings] = useState({
    theme: 'default' as Theme,
    chunkSize: 1 as ChunkSize,
    fontSize: 64,
    fontFamily: 'sans' as FontFamily,
    soundEnabled: false, // Ses ayarı
    customColors: {
      background: '#ffffff',
      text: '#1e293b',
      primary: '#4f46e5',
    }
  });

  // --- Ses Motoru ---
  const playSound = useCallback((type: 'tick' | 'tock') => {
    if (!settings.soundEnabled) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'tick') {
        // Geri sayım sesi (Yüksek ton)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else {
        // Metronom sesi (Tok, kısa ses)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, ctx.currentTime); // Daha düşük frekans
        gain.gain.setValueAtTime(0.05, ctx.currentTime); // Daha düşük ses
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      console.error("Audio error", e);
    }
  }, [settings.soundEnabled]);


  // --- LocalStorage İşlemleri ---
  useEffect(() => {
    const savedSettings = localStorage.getItem('hizli-okuma-settings');
    const savedWpm = localStorage.getItem('hizli-okuma-wpm');

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          ...parsed,
          customColors: { ...prev.customColors, ...(parsed.customColors || {}) }
        }));
      } catch (e) {
        console.error('Ayarlar yüklenemedi:', e);
      }
    }

    if (savedWpm) {
      setWpm(Number(savedWpm));
    }
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('hizli-okuma-settings', JSON.stringify(settings));
    localStorage.setItem('hizli-okuma-wpm', String(wpm));
  }, [settings, wpm, isLoaded]);


  // --- Mantık Motoru ---

  const chunks = useMemo(() => {
    const rawWords = text.trim().split(/\s+/).filter(word => word.length > 0);
    const result = [];
    for (let i = 0; i < rawWords.length; i += settings.chunkSize) {
      result.push(rawWords.slice(i, i + settings.chunkSize).join(' '));
    }
    return result;
  }, [text, settings.chunkSize]);

  const totalChunks = chunks.length;

  const estimatedTime = useMemo(() => {
    if (totalChunks === 0) return '0 sn';
    const totalWords = chunks.length * settings.chunkSize;
    const seconds = (totalWords / wpm) * 60;
    if (seconds < 60) return `${Math.ceil(seconds)} sn`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.ceil(seconds % 60);
    return `${minutes} dk ${remainingSeconds > 0 ? remainingSeconds + ' sn' : ''}`;
  }, [chunks.length, settings.chunkSize, wpm]);

  // Geri Sayım Efekti
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      playSound('tick'); // Ses çal
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      playSound('tick'); // Son bip (GO!)
      setCountdown(null);
      setIsPlaying(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, playSound]);

  // Okuma Loop'u
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && currentIndex < totalChunks) {
      const msPerChunk = (60000 / wpm) * settings.chunkSize;
      
      interval = setInterval(() => {
        playSound('tock'); // Metronom sesi çal
        setCurrentIndex((prev) => {
          if (prev >= totalChunks - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, msPerChunk);
    } else if (currentIndex >= totalChunks) {
      setIsPlaying(false);
    }

    return () => clearInterval(interval);
  }, [isPlaying, wpm, currentIndex, totalChunks, settings.chunkSize, playSound]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // --- Yardımcı Fonksiyonlar ---

  const togglePlay = () => {
    if (totalChunks === 0) return;

    if (isPlaying || countdown !== null) {
      setIsPlaying(false);
      setCountdown(null);
    } else {
      if (currentIndex >= totalChunks - 1) setCurrentIndex(0);
      setCountdown(3);
    }
  };

  const toggleFullscreen = () => {
    if (!readerRef.current) return;

    if (!document.fullscreenElement) {
      readerRef.current.requestFullscreen().catch(err => {
        console.error(`Tam ekran hatası: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const reset = () => {
    setIsPlaying(false);
    setCountdown(null);
    setCurrentIndex(0);
  };

  const loadSampleText = () => {
    setText(SAMPLE_TEXT);
    reset();
  };

  const pasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
      reset();
    } catch (err) {
      console.error('Pano erişim hatası:', err);
      alert('Panoya erişilemedi.');
    }
  };

  const updateCustomColor = (key: keyof typeof settings.customColors, value: string) => {
    setSettings(prev => ({
      ...prev,
      customColors: {
        ...prev.customColors,
        [key]: value
      }
    }));
  };

  const progress = totalChunks > 0 ? (currentIndex / totalChunks) * 100 : 0;

  // --- Stil ve Renk Hesaplamaları ---

  const getThemeStyle = () => {
    if (settings.theme === 'custom') {
      return {
        backgroundColor: settings.customColors.background,
        color: settings.customColors.text,
      };
    }
    return {};
  };

  const getReaderStyle = () => {
     const style: any = { fontFamily: fontFamilies[settings.fontFamily] };
     if (settings.theme === 'custom') {
      style.backgroundColor = settings.customColors.background;
      style.borderColor = settings.customColors.text + '20';
      style.color = settings.customColors.text;
    }
    return style;
  }

  const getPrimaryStyle = () => {
    if (settings.theme === 'custom') {
      return { backgroundColor: settings.customColors.primary, color: '#ffffff' };
    }
    return {};
  };

  const themeClasses = {
    default: 'bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-slate-900',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]',
    dark: 'bg-gray-950 text-gray-100',
    custom: '',
  };

  const readerBgClasses = {
    default: 'bg-white border-slate-200 shadow-xl',
    sepia: 'bg-[#fdf6e3] border-[#e6dbb9] shadow-lg shadow-[#d3cbb1]/50',
    dark: 'bg-gray-900 border-gray-800 shadow-2xl shadow-black/50',
    custom: 'shadow-xl',
  };

  const fontFamilies = {
    sans: 'ui-sans-serif, system-ui, sans-serif',
    serif: 'ui-serif, Georgia, serif',
    mono: 'ui-monospace, SFMono-Regular, monospace',
  };

  return (
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-500 ${themeClasses[settings.theme]}`}
      style={{ ...getThemeStyle(), fontFamily: fontFamilies[settings.fontFamily] }}
    >
      
      {/* Navbar */}
      <nav 
        className="fixed top-0 right-0 z-40 p-6 flex justify-end w-full"
      >
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full transition-colors hover:bg-black/5"
        >
          <Cog6ToothIcon className="w-6 h-6" />
        </button>
      </nav>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={() => setIsSettingsOpen(false)} />
          <div className={`fixed right-0 top-0 h-full w-80 max-w-full z-50 p-6 shadow-2xl transition-transform duration-300 transform translate-x-0 overflow-y-auto ${settings.theme === 'dark' ? 'bg-gray-900 border-l border-gray-800' : 'bg-white'}`}
             style={settings.theme === 'custom' ? { backgroundColor: settings.customColors.background, color: settings.customColors.text, borderLeft: `1px solid ${settings.customColors.text}20` } : {}}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">Ayarlar</h2>
              <button onClick={() => setIsSettingsOpen(false)}><XMarkIcon className="w-6 h-6" /></button>
            </div>

            <div className="space-y-8">
              
              {/* Ses Ayarı */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-black/5">
                <div className="flex items-center gap-2 text-sm font-semibold opacity-80">
                  {settings.soundEnabled ? <SpeakerWaveIcon className="w-5 h-5" /> : <SpeakerXMarkIcon className="w-5 h-5" />}
                  <span>Ses Efektleri</span>
                </div>
                <button 
                  onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.soundEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  style={settings.soundEnabled && settings.theme === 'custom' ? { backgroundColor: settings.customColors.primary } : {}}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.soundEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Tema Seçimi */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold opacity-70">
                  <SwatchIcon className="w-4 h-4" /> Tema
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'default', name: 'Normal', class: 'bg-white border-gray-200 text-slate-900' },
                    { id: 'sepia', name: 'Sepya', class: 'bg-[#f4ecd8] border-[#e6dbb9] text-[#5b4636]' },
                    { id: 'dark', name: 'Koyu', class: 'bg-gray-900 border-gray-700 text-white' },
                    { id: 'custom', name: 'Özel', class: 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white border-transparent' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSettings({ ...settings, theme: t.id as Theme })}
                      className={`h-12 rounded-lg border flex items-center justify-center text-xs font-medium transition-all ${t.class} ${settings.theme === t.id ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Özel Renk Seçiciler */}
              {settings.theme === 'custom' && (
                <div className="space-y-3 p-4 rounded-xl bg-black/5 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center gap-2 text-sm font-semibold opacity-70 mb-2">
                    <PaintBrushIcon className="w-4 h-4" /> Renkleri Düzenle
                  </div>
                   <div className="flex items-center justify-between">
                    <label className="text-xs font-medium opacity-80">Arka Plan</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono opacity-60">{settings.customColors.background}</span>
                      <input 
                        type="color" 
                        value={settings.customColors.background}
                        onChange={(e) => updateCustomColor('background', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                      />
                    </div>
                  </div>
                   <div className="flex items-center justify-between">
                    <label className="text-xs font-medium opacity-80">Yazı Rengi</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono opacity-60">{settings.customColors.text}</span>
                      <input 
                        type="color" 
                        value={settings.customColors.text}
                        onChange={(e) => updateCustomColor('text', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                      />
                    </div>
                  </div>
                   <div className="flex items-center justify-between">
                    <label className="text-xs font-medium opacity-80">Ana Renk</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono opacity-60">{settings.customColors.primary}</span>
                      <input 
                        type="color" 
                        value={settings.customColors.primary}
                        onChange={(e) => updateCustomColor('primary', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

               {/* Font Seçimi */}
               <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold opacity-70">
                  <span className="text-base font-serif">Aa</span> Yazı Tipi
                </div>
                <div className="flex rounded-lg bg-black/5 p-1">
                  {[
                    { id: 'sans', name: 'Sans', font: 'font-sans' },
                    { id: 'serif', name: 'Serif', font: 'font-serif' },
                    { id: 'mono', name: 'Mono', font: 'font-mono' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSettings({ ...settings, fontFamily: f.id as FontFamily })}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${f.font} ${settings.fontFamily === f.id ? 'bg-white shadow text-black' : 'text-current opacity-60 hover:opacity-100'}`}
                      style={settings.fontFamily === f.id && settings.theme === 'custom' ? { color: settings.customColors.primary } : {}}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diğer Ayarlar */}
               <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold opacity-70">
                  <EyeIcon className="w-4 h-4" /> Kelime Grubu
                </div>
                <div className="flex rounded-lg bg-black/5 p-1">
                  {[1, 2, 3].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSettings({ ...settings, chunkSize: size as ChunkSize })}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${settings.chunkSize === size ? 'bg-white shadow text-black' : 'text-current opacity-60 hover:opacity-100'}`}
                      style={settings.chunkSize === size && settings.theme === 'custom' ? { color: settings.customColors.primary } : {}}
                    >
                      {size}x
                    </button>
                  ))}
                </div>
              </div>

               <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-semibold opacity-70">
                  <div className="flex items-center gap-2">
                    <MagnifyingGlassIcon className="w-4 h-4" /> Yazı Boyutu
                  </div>
                  <span className="text-xs bg-black/5 px-2 py-0.5 rounded font-mono">{settings.fontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="30" 
                  max="150" 
                  step="2"
                  value={settings.fontSize}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSettings({ ...settings, fontSize: val });
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-black/10"
                  style={{ accentColor: settings.theme === 'custom' ? settings.customColors.primary : undefined }}
                />
              </div>

            </div>
          </div>
        </>
      )}

      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 flex flex-col justify-center gap-8 w-full min-h-[calc(100vh-4rem)]">
        
        {/* Reader Display */}
        <div 
          ref={readerRef}
          className={`relative rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col justify-between ${readerBgClasses[settings.theme]} ${isFullscreen ? 'p-12' : ''}`}
          style={getReaderStyle()}
        >
          
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 h-1.5 w-full bg-black/5 z-10">
            <div 
              className={`h-full transition-all duration-300 ease-linear ${settings.theme === 'default' ? 'bg-indigo-600' : settings.theme === 'sepia' ? 'bg-[#5b4636]' : settings.theme === 'dark' ? 'bg-indigo-500' : ''}`}
              style={{ 
                width: `${progress}%`,
                backgroundColor: settings.theme === 'custom' ? settings.customColors.primary : undefined
              }}
            ></div>
          </div>

          {/* Main Text Area */}
          <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center relative ${isFullscreen ? 'h-screen' : 'h-72 md:h-96'}`}>
            
             {/* Geri Sayım Overlay - Şeffaf Glow Tasarım */}
             {countdown !== null && (
               <div className="absolute inset-0 flex items-center justify-center z-50 bg-white/60 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                 <div 
                    className="flex items-center justify-center animate-pulse"
                    style={{ 
                      color: settings.theme === 'custom' ? settings.customColors.primary : settings.theme === 'sepia' ? '#5b4636' : '#4f46e5',
                      filter: `drop-shadow(0 0 30px ${settings.theme === 'custom' ? settings.customColors.primary : settings.theme === 'sepia' ? '#5b463680' : '#4f46e580'})`
                    }}
                 >
                   <span className="text-[10rem] font-black tracking-tighter leading-none">
                     {countdown > 0 ? countdown : '!'}
                   </span>
                 </div>
               </div>
            )}

            {totalChunks > 0 ? (
              <span 
                className={`font-bold tracking-tight transition-all duration-75 ${countdown !== null ? 'opacity-0' : 'opacity-100'}`}
                style={{ fontSize: `${settings.fontSize}px`, lineHeight: 1.2 }}
              >
                 {chunks[currentIndex]}
              </span>
            ) : (
              <div className="opacity-40 flex flex-col items-center gap-2">
                <BookOpenIcon className="w-12 h-12" />
                <span className="text-xl font-medium">Metin Bekleniyor</span>
              </div>
            )}
          </div>

          {/* Control Bar */}
          <div 
            className="border-t p-6 transition-colors z-10"
            style={{ 
              backgroundColor: settings.theme === 'custom' ? settings.customColors.text + '05' : 'rgba(0,0,0,0.02)',
              borderColor: settings.theme === 'custom' ? settings.customColors.text + '10' : 'rgba(0,0,0,0.05)'
            }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              <div className="flex flex-col gap-3 w-full md:w-auto flex-1 max-w-md">
                <div className="flex justify-between items-center text-sm font-medium opacity-80">
                  <span className="flex items-center gap-1.5">
                    Hız <span className="opacity-60 text-xs">(WPM)</span>
                  </span>
                  <span className="font-mono bg-black/5 px-2 py-0.5 rounded text-xs">
                    {wpm}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs opacity-50">Yavaş</span>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="25"
                    value={wpm}
                    onChange={(e) => setWpm(Number(e.target.value))}
                    className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${settings.theme === 'sepia' ? 'accent-[#5b4636] bg-[#e6dbb9]' : settings.theme === 'default' ? 'accent-indigo-600 bg-gray-200' : settings.theme === 'dark' ? 'accent-indigo-500 bg-gray-700' : 'bg-black/10'}`}
                    style={{ accentColor: settings.theme === 'custom' ? settings.customColors.primary : undefined }}
                  />
                  <span className="text-xs opacity-50">Hızlı</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={toggleFullscreen}
                  className="p-3 bg-black/5 hover:bg-black/10 rounded-xl transition-colors"
                  title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran"}
                >
                  {isFullscreen ? <ArrowsPointingInIcon className="w-6 h-6" /> : <ArrowsPointingOutIcon className="w-6 h-6" />}
                </button>

                <button 
                  onClick={reset}
                  className="p-3 bg-black/5 hover:bg-red-100 text-slate-700 hover:text-red-600 rounded-xl transition-colors"
                  title="Bitir ve Başa Dön"
                >
                  <StopIcon className="w-6 h-6" />
                </button>
                
                <button 
                  onClick={togglePlay}
                  disabled={totalChunks === 0}
                  className={`flex-1 md:flex-none px-8 py-3 font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 min-w-[160px]
                    ${totalChunks === 0 
                      ? 'bg-black/10 opacity-50 cursor-not-allowed shadow-none' 
                      : settings.theme === 'sepia'
                        ? 'bg-[#5b4636] text-[#f4ecd8] hover:bg-[#4a392c]'
                        : settings.theme === 'default' 
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30'
                          : settings.theme === 'dark'
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : ''
                    }`}
                  style={settings.theme === 'custom' && totalChunks > 0 ? { backgroundColor: settings.customColors.primary, color: '#ffffff' } : {}}
                >
                  {isPlaying || countdown !== null ? (
                    <> <PauseIcon className="w-5 h-5" /> Duraklat </>
                  ) : (
                    <> Başlat <ArrowRightIcon className="w-5 h-5" /> </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
           <div className="flex justify-between items-end px-1">
            <label htmlFor="content" className="block text-sm font-bold opacity-70">
              Okuma Metni
            </label>
            <div className="flex items-center gap-3">
              {text.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-medium opacity-60 animate-in fade-in">
                  <ClockIcon className="w-3.5 h-3.5" />
                  ~{estimatedTime}
                </div>
              )}
              
              <div className="h-4 w-px bg-black/10 mx-1"></div>

              <button
                onClick={loadSampleText}
                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100"
              >
                <DocumentTextIcon className="w-3.5 h-3.5" />
                Örnek
              </button>
              <button
                onClick={pasteFromClipboard}
                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100"
              >
                <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                Yapıştır
              </button>
            </div>
          </div>
          
          <textarea
            id="content"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={`w-full h-40 p-5 rounded-xl border shadow-sm outline-none resize-none transition-all placeholder:opacity-40 focus:ring-2 
              ${settings.theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 text-white focus:ring-indigo-500' 
                : settings.theme === 'sepia'
                  ? 'bg-[#fdf6e3] border-[#e6dbb9] text-[#5b4636] focus:ring-[#5b4636]'
                  : settings.theme === 'default'
                    ? 'bg-white border-slate-200 text-slate-800 focus:ring-indigo-500'
                    : ''
              }`}
            style={settings.theme === 'custom' ? { 
              backgroundColor: settings.customColors.background, 
              color: settings.customColors.text,
              borderColor: settings.customColors.text + '30',
              '--tw-ring-color': settings.customColors.primary
            } as any : {}}
            placeholder="Buraya metin yapıştırın..."
          ></textarea>
        </div>
      </main>

      <footer className="py-6 text-center text-sm font-medium opacity-40 hover:opacity-100 transition-opacity">
        <a 
          href="https://www.instagram.com/resulaykan" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-indigo-500 transition-colors"
          style={settings.theme === 'custom' ? { color: settings.customColors.text } : {}}
        >
          @resulaykan
        </a>
      </footer>
    </div>
  );
}