import React from 'react';
import { motion } from 'framer-motion';

export const NavbarMotion: React.FC = () => {
  return (
    <motion.header 
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-benny-border shadow-[0_2px_15px_rgba(81,38,128,0.04)]"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between">
        
        {/* Brand identity */}
        <a href="#" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 rounded-full bg-benny-purple flex items-center justify-center p-1.5 shadow-sm border border-benny-pink/40"
          >
            <img 
              src="/benny/logo-transparent.png" 
              alt="Logo Benny Salón & Spa" 
              className="w-full h-full object-contain filter drop-shadow"
            />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold text-benny-ink tracking-tight group-hover:text-benny-purple transition-colors">
                Benny
              </span>
              <span className="text-[11px] uppercase tracking-widest text-benny-purple font-medium bg-benny-pink-soft px-2 py-0.5 rounded-full border border-benny-pink/30">
                Salón & Spa
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-script text-benny-pink font-semibold tracking-wide -mt-0.5">
              Más de 21 años realzando lo mejor de ti
            </p>
          </div>
        </a>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-[0.14em] font-medium text-benny-ink-muted">
          {[
            { label: 'Servicios & Tarifario', href: '#carta' },
            { label: 'Nuestro Salón', href: '#tienda' },
            { label: 'Resultados', href: '#galeria' },
            { label: 'Ubicación', href: '#ubicacion' }
          ].map((item, idx) => (
            <motion.a 
              key={idx}
              href={item.href}
              whileHover={{ y: -1, color: '#512680' }}
              className="transition-colors hover:text-benny-purple relative py-1"
            >
              {item.label}
            </motion.a>
          ))}
        </nav>

        {/* Direct WhatsApp Booking button */}
        <div className="flex items-center gap-3">
          <motion.a 
            href="#carta"
            whileHover={{ scale: 1.03, boxShadow: '0 8px 20px rgba(81,38,128,0.22)' }}
            whileTap={{ scale: 0.97 }}
            className="px-4 sm:px-5 py-2.5 rounded-full bg-benny-purple text-white text-xs uppercase tracking-wider font-semibold shadow-sm hover:bg-benny-purple-dark transition-all flex items-center gap-2"
          >
            <span>Reservar Turno</span>
            <span className="text-benny-pink text-sm">✦</span>
          </motion.a>
        </div>

      </div>
    </motion.header>
  );
};
