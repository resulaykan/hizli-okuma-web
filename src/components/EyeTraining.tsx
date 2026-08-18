'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize, 
  MoveHorizontal, 
  MoveVertical, 
  Infinity as InfinityIcon,
  HelpCircle
} from 'lucide-react';

type ExerciseType = 'horizontal' | 'vertical' | 'infinity' | 'expand';

export const EyeTraining: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [exerciseType, setExerciseType] = useState<ExerciseType>('horizontal');
  const [speed, setSpeed] = useState<number>(3); // 1 (slow) to 6 (fast)
  const timerSeconds = 60;
  const [remainingTime, setRemainingTime] = useState<number>(60);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Exercise types list
  const exercises = [
    { id: 'horizontal' as ExerciseType, label: 'Yatay Takip', icon: MoveHorizontal, desc: 'Gözlerin sol-sağ satır sıçramalarını hızlandırır.' },
    { id: 'vertical' as ExerciseType, label: 'Dikey Takip', icon: MoveVertical, desc: 'Hızlı sayfa tarama ve dikey blok okuma kabiliyeti kazandırır.' },
    { id: 'infinity' as ExerciseType, label: 'Sonsuzluk (8)', icon: InfinityIcon, desc: 'Tüm göz kaslarını esnetir ve odaklama süresini uzatır.' },
    { id: 'expand' as ExerciseType, label: 'Çevresel Görüş', icon: Maximize, desc: 'Merkezden dışa genişleyen dairelerle görme açısını büyütür.' },
  ];

  // Animation Loop on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    let progress = 0;
    const dotRadius = 14;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint guideline track
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);

      const cx = width / 2;
      const cy = height / 2;
      const rx = width * 0.4;
      const ry = height * 0.35;

      if (exerciseType === 'horizontal') {
        ctx.beginPath();
        ctx.moveTo(cx - rx, cy);
        ctx.lineTo(cx + rx, cy);
        ctx.stroke();
      } else if (exerciseType === 'vertical') {
        ctx.beginPath();
        ctx.moveTo(cx, cy - ry);
        ctx.lineTo(cx, cy + ry);
        ctx.stroke();
      } else if (exerciseType === 'infinity') {
        ctx.beginPath();
        for (let t = 0; t <= Math.PI * 2; t += 0.05) {
          const scale = 2 / (3 - Math.cos(2 * t));
          const x = cx + rx * scale * Math.cos(t);
          const y = cy + ry * scale * Math.sin(2 * t) / 2;
          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      } else if (exerciseType === 'expand') {
        ctx.beginPath();
        ctx.arc(cx, cy, rx * 0.8, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.setLineDash([]);

      // Calculate Target Dot Position
      let targetX = cx;
      let targetY = cy;

      if (isPlaying) {
        progress += 0.008 * speed;
      }

      if (exerciseType === 'horizontal') {
        targetX = cx + Math.sin(progress) * rx;
        targetY = cy;
      } else if (exerciseType === 'vertical') {
        targetX = cx;
        targetY = cy + Math.sin(progress) * ry;
      } else if (exerciseType === 'infinity') {
        const t = progress;
        const scale = 2 / (3 - Math.cos(2 * t));
        targetX = cx + rx * scale * Math.cos(t);
        targetY = cy + ry * scale * Math.sin(2 * t) / 2;
      } else if (exerciseType === 'expand') {
        const radius = (Math.sin(progress) * 0.5 + 0.5) * (rx * 0.8);
        targetX = cx + Math.cos(progress * 1.5) * radius;
        targetY = cy + Math.sin(progress * 1.5) * radius;
      }

      // Draw Center Anchor Dot
      ctx.fillStyle = 'rgba(156, 163, 175, 0.4)';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw Moving Glow Target
      const gradient = ctx.createRadialGradient(targetX, targetY, 2, targetX, targetY, dotRadius * 2);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(0.5, '#a855f7');
      gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(targetX, targetY, dotRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Core Solid Dot
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(targetX, targetY, dotRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, exerciseType, speed]);

  // Session timer
  useEffect(() => {
    if (isPlaying) {
      timerIntervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            return timerSeconds;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPlaying, timerSeconds]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setIsPlaying(false);
    setRemainingTime(timerSeconds);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      
      {/* Exercise Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {exercises.map((ex) => {
          const Icon = ex.icon;
          const isSelected = exerciseType === ex.id;
          return (
            <button
              key={ex.id}
              onClick={() => {
                setExerciseType(ex.id);
                reset();
              }}
              className={`p-3 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20 scale-102'
                  : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className="w-5 h-5" />
                {isSelected && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
              </div>
              <div>
                <p className="text-xs font-bold">{ex.label}</p>
                <p className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-indigo-100' : 'opacity-60'}`}>
                  {ex.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Visual Canvas Area */}
      <div className="relative w-full h-[320px] sm:h-[400px] rounded-3xl bg-black/5 dark:bg-slate-900/60 border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Remaining Time Overlay */}
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/30 backdrop-blur-md text-white font-mono text-xs font-bold border border-white/10">
          Kalan: {remainingTime} sn
        </div>
      </div>

      {/* Speed & Timer Controls */}
      <div className="p-4 sm:p-6 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col gap-4">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Speed slider */}
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-sm">
            <span className="text-xs font-bold opacity-75 shrink-0">Hız Seviyesi:</span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 min-w-[40px] text-center">
              {speed}x
            </span>
            <input 
              type="range"
              min="1"
              max="6"
              step="1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-black/10 dark:bg-white/10"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={reset}
              className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
              title="Sıfırla"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className={`flex-1 sm:flex-none px-8 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
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
                  <span>Egzersizi Başlat</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Guide Note */}
      <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs opacity-75 space-y-1.5">
        <div className="font-bold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
          <HelpCircle className="w-4 h-4" />
          <span>Nasıl Uygulanır?</span>
        </div>
        <p>
          Başınızı sabit tutarak sadece gözlerinizle ekrandaki parlayan mor hedefi takip edin. Düzenli günde 3-5 dakika göz takibi yapmak, okuma esnasındaki göz sıçraması (sakkad) doğruluğunu ve kelime tanıma hızını belirgin şekilde artırır.
        </p>
      </div>

    </div>
  );
};
