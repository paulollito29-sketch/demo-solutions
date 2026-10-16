import React from 'react';
import { motion } from 'framer-motion';

interface ReelPost {
  id: string;
  title: string;
  category: string;
  caption: string;
  tag: string;
  img: string;
  link: string;
}

const REELS: ReelPost[] = [
  {
    id: 'r1',
    title: 'Corte en Capas & Flequillo de Autor',
    category: 'Tendencia en Instagram',
    caption: 'Transformación para enmarcar el rostro y aportar ligereza y movimiento natural al cabello.',
    tag: 'Reel Destacado',
    img: '/benny/interior-wall.png',
    link: 'https://www.instagram.com/benny.salon/reels/'
  },
  {
    id: 'r2',
    title: 'Balayage Rubio Vainilla con Wella Professionals',
    category: 'Colorimetría',
    caption: 'Aclarado gradual cuidando la fibra con Blondor y matizado con Koleston Perfect ME+.',
    tag: 'Alianza Wella',
    img: '/benny/interior-mirrors.png',
    link: 'https://www.facebook.com/Benny.Salon.Spa/?locale=es_LA'
  },
  {
    id: 'r3',
    title: 'Alisado Keratina Alfaparf Milano',
    category: 'Alisados & Reestructuración',
    caption: 'Efecto lacio duradero sin formol, con brillo espejo y sedosidad hasta por 4 meses.',
    tag: 'Promo Glow Up',
    img: '/benny/interior-styling.png',
    link: 'https://www.instagram.com/benny.salon/reels/'
  },
  {
    id: 'r4',
    title: '24° Aniversario Benny Salón & Spa',
    category: 'Comunidad & Trayectoria',
    caption: 'Celebrando más de dos décadas cuidando el estilo de nuestras clientas en Surquillo.',
    tag: '+21 Años',
    img: '/benny/banner.png',
    link: 'https://www.facebook.com/Benny.Salon.Spa/?locale=es_LA'
  }
];

export const SocialReelsMotion: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 border-b border-benny-border bg-gradient-to-b from-white via-benny-bg to-white">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-10 border-b border-benny-border gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-benny-lavender border border-benny-pink/30 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-benny-purple font-bold">
                EN VIVO EN NUESTRAS REDES SOCIALES
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-benny-ink tracking-tight">
              Síguenos en Instagram & Facebook
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.a
              href="https://www.instagram.com/benny.salon/reels/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 rounded-full border border-benny-purple text-benny-purple text-xs font-mono font-bold tracking-wider hover:bg-benny-purple hover:text-white transition-colors flex items-center gap-2"
            >
              <span>@benny.salon</span>
              <span className="text-benny-pink">↗</span>
            </motion.a>
            <motion.a
              href="https://www.facebook.com/Benny.Salon.Spa/?locale=es_LA"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-mono font-bold tracking-wider hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>Facebook Oficial</span>
              <span>↗</span>
            </motion.a>
          </div>
        </div>

        {/* Reels Grid with Framer Motion cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10">
          {REELS.map((reel) => (
            <motion.a
              key={reel.id}
              href={reel.link}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-benny-border shadow-[0_4px_20px_rgba(81,38,128,0.06)] hover:shadow-[0_12px_32px_rgba(81,38,128,0.12)] transition-shadow cursor-pointer"
            >
              {/* Media Container */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-900">
                <img 
                  src={reel.img} 
                  alt={reel.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80" />
                
                {/* Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider text-benny-purple">
                  {reel.tag}
                </div>

                {/* Play icon overlay */}
                <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs border border-white/40 group-hover:scale-110 transition-transform">
                  ▶
                </div>
              </div>

              {/* Text content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-benny-purple font-semibold block">
                    {reel.category}
                  </span>
                  <h3 className="font-serif text-base font-bold text-benny-ink group-hover:text-benny-purple transition-colors mt-0.5 leading-snug">
                    {reel.title}
                  </h3>
                  <p className="text-[11px] text-benny-ink-muted leading-relaxed mt-1 line-clamp-2">
                    {reel.caption}
                  </p>
                </div>

                <div className="pt-2 border-t border-benny-border flex items-center justify-between text-[10px] font-mono font-semibold text-benny-purple">
                  <span>Ver en red social</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>

            </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
};
