import React from 'react';
import { motion } from 'framer-motion';

export const HeroMotion: React.FC = () => {
  return (
    <section className="relative overflow-hidden border-b border-benny-border bg-gradient-to-b from-white via-benny-bg to-white">
      {/* Ambient decorative glowing accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-benny-pink/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-benny-lilac/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* Left Editorial Content - Visible immediately with gentle spring motion */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-benny-border relative z-10">
          <div className="space-y-6">
            
            {/* Top pill badge */}
            <motion.div 
              initial={false}
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-benny-border shadow-[0_2px_8px_rgba(81,38,128,0.06)]"
            >
              <span className="w-2 h-2 rounded-full bg-benny-green animate-pulse" />
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-benny-purple font-bold">
                SURQUILLO, LIMA · 24 AÑOS DE TRAYECTORIA
              </span>
              <span className="text-benny-pink">✦</span>
              <span className="font-mono text-[10px] sm:text-[11px] text-benny-ink-muted">
                ALIANZA WELLA & ALFAPARF
              </span>
            </motion.div>

            {/* Slogan & Heading with Official Script */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-[54px] font-bold text-benny-ink leading-[1.08] tracking-tight">
                Más de 21 años realzando
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-script text-5xl sm:text-7xl lg:text-[76px] text-benny-pink font-bold -mt-2 leading-none inline-block drop-shadow-sm">
                  lo mejor de ti
                </span>
                <span className="font-serif text-4xl sm:text-6xl text-benny-purple font-bold">.</span>
              </div>
            </div>

            {/* Lead description */}
            <p className="text-benny-ink-muted text-base sm:text-lg leading-relaxed max-w-xl font-normal">
              Especialistas en balayage, alisados de keratina, células madre y cuidado capilar profesional en Surquillo. Socios estratégicos de <strong className="text-benny-ink font-semibold">Wella Professionals</strong> y <strong className="text-benny-ink font-semibold">Alfaparf Milano</strong>. Consulta nuestro tarifario transparente y reserva tu turno directo por WhatsApp.
            </p>

            {/* Call to actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <motion.a 
                href="#carta"
                whileHover={{ scale: 1.03, boxShadow: '0 10px 25px rgba(81,38,128,0.25)' }}
                whileTap={{ scale: 0.97 }}
                className="px-7 py-3.5 rounded-full bg-benny-purple text-white text-xs sm:text-sm uppercase tracking-wider font-semibold shadow-md hover:bg-benny-purple-dark transition-all flex items-center gap-3 group"
              >
                <span>Ver Tarifario & Reservar</span>
                <span className="text-benny-pink group-hover:translate-y-0.5 transition-transform">↓</span>
              </motion.a>
              
              <motion.a 
                href="#tienda"
                whileHover={{ scale: 1.02, borderColor: '#512680', color: '#512680' }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3.5 rounded-full border border-benny-border bg-white text-benny-ink text-xs sm:text-sm uppercase tracking-wider font-medium transition-all shadow-sm"
              >
                Conocer el Salón
              </motion.a>
            </div>

            {/* Brand partners mini bar */}
            <div className="flex items-center gap-4 pt-2 text-[11px] font-mono uppercase tracking-wider text-benny-ink-muted">
              <span>Marcas oficiales:</span>
              <span className="px-2 py-0.5 rounded bg-white border border-benny-border font-bold text-benny-purple">Wella</span>
              <span className="px-2 py-0.5 rounded bg-white border border-benny-border font-bold text-benny-purple">Alfaparf</span>
              <span className="px-2 py-0.5 rounded bg-white border border-benny-border font-bold text-benny-purple">Koleston</span>
            </div>

          </div>

          {/* Trust badges footer */}
          <div className="pt-8 mt-8 border-t border-benny-border grid grid-cols-3 gap-4 font-mono">
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-benny-ink-muted">CALIFICACIÓN GOOGLE</span>
              <span className="text-base sm:text-lg font-bold text-benny-ink">4.7 / 5.0 <span className="text-amber-500">★</span></span>
            </div>
            <div className="border-l border-benny-border pl-4">
              <span className="block text-[10px] uppercase tracking-wider text-benny-ink-muted">EXPERIENCIA</span>
              <span className="text-base sm:text-lg font-bold text-benny-purple">+21 Años</span>
            </div>
            <div className="border-l border-benny-border pl-4">
              <span className="block text-[10px] uppercase tracking-wider text-benny-ink-muted">DISTRITO</span>
              <span className="text-base sm:text-lg font-bold text-benny-ink">Surquillo</span>
            </div>
          </div>

        </div>

        {/* Right Visual Card with Real Store Image */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-benny-lavender/40 relative">
          
          {/* Main Photo Container - ALWAYS VISIBLE with hover zoom */}
          <div className="relative aspect-[4/4.8] w-full overflow-hidden group bg-stone-100">
            <img 
              src="/benny/interior-mirrors.png" 
              alt="Instalaciones Benny Salón & Spa con espejos arqueados y luz LED" 
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="eager"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-benny-purple/85 via-transparent to-transparent opacity-80" />

            {/* Floating Top Badge */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-benny-pink/40 shadow-sm flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-benny-pink animate-ping" />
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-benny-purple">
                Espejos Halo LED & Confort
              </span>
            </motion.div>

            {/* Bottom Highlight Box */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-benny-border shadow-[0_8px_30px_rgba(81,38,128,0.12)]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-benny-purple font-semibold">
                  TRATAMIENTO ESTRELLA
                </span>
                <span className="font-mono text-xs font-bold text-benny-purple bg-benny-pink-soft px-2 py-0.5 rounded-md border border-benny-pink/30">
                  S/ 180
                </span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-benny-ink mt-1">
                Diseño Balayage Wella + Hidratación Profunda
              </h3>
              <p className="text-xs text-benny-ink-muted mt-0.5">
                Diagnóstico capilar personalizado sin costo agendando por la web.
              </p>
            </div>
          </div>

          {/* Address footer */}
          <div className="p-4 bg-white border-t border-benny-border flex items-center justify-between text-xs">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-benny-ink-muted block">
                DIRECCIÓN PRINCIPAL
              </span>
              <span className="font-medium text-benny-ink">
                Jr. Narciso de la Colina 869, Surquillo
              </span>
            </div>
            <motion.a 
              href="#ubicacion" 
              whileHover={{ x: 3 }}
              className="font-mono text-[11px] text-benny-purple font-semibold uppercase tracking-wider flex items-center gap-1"
            >
              <span>Ver Mapa</span>
              <span>→</span>
            </motion.a>
          </div>

        </div>

      </div>
    </section>
  );
};
