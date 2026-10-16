import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const BeforeAfterMotion: React.FC = () => {
  const [sliderPos, setSliderPos] = useState<number>(50);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPos(Number(e.target.value));
  };

  return (
    <section id="galeria" className="py-16 sm:py-24 border-b border-benny-border bg-benny-bg">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-benny-border">
            <span className="font-mono text-[10px] uppercase tracking-widest text-benny-purple font-semibold">
              TRANSFORMACIONES REALES · BENNY SALÓN & SPA
            </span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-benny-ink tracking-tight">
            Más de 21 años realzando <span className="font-script text-benny-pink text-4xl sm:text-6xl inline-block">lo mejor de ti</span>
          </h2>
          
          <p className="text-xs sm:text-sm text-benny-ink-muted leading-relaxed">
            Protegemos la salud de tu fibra capilar en cada decoloración, tinte o corte. Desliza el cursor sobre la imagen para comparar el proceso y el resultado final.
          </p>
        </div>

        {/* Interactive Slider Container */}
        <div className="max-w-4xl mx-auto relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-benny-border shadow-[0_16px_40px_rgba(81,38,128,0.08)] bg-white select-none">
          
          {/* AFTER Image (Full background) */}
          <img 
            src="/benny/interior-wall.png" 
            alt="Resultado final Benny Salón" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-benny-purple text-white text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-full font-bold shadow-sm">
            Resultado / Look Final ✦
          </div>

          {/* BEFORE Image (Clipped by slider position) */}
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img 
              src="/benny/interior-styling.png" 
              alt="Proceso en salón" 
              className="w-full h-full object-cover max-w-none"
              style={{ width: '100%', minWidth: '100%' }}
            />
            <div className="absolute top-4 left-4 bg-white/95 text-benny-ink text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-full font-bold border border-benny-border shadow-sm">
              En Cabina / Proceso
            </div>
          </div>

          {/* Vertical Divider Line with handle */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-benny-purple text-white border-2 border-white shadow-md flex items-center justify-center text-xs font-bold">
              ↔
            </div>
          </div>

          {/* Native range input overlay for silky smooth touch and mouse control */}
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={sliderPos} 
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
          />

        </div>

      </div>
    </section>
  );
};
