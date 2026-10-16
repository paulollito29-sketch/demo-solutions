import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotoItem {
  id: string;
  title: string;
  tag: string;
  desc: string;
  src: string;
}

const PHOTOS: PhotoItem[] = [
  {
    id: 'mirrors',
    title: 'Espejos Arqueados & Iluminación Halo LED',
    tag: 'Estaciones de Estilismo',
    desc: 'Diseñadas para una visualización precisa del tono y acabado, en un entorno cálido y relajante con marcos lilas.',
    src: '/benny/interior-mirrors.png'
  },
  {
    id: 'wall',
    title: 'Muro Verde Institucional & Selfie Spot',
    tag: 'Zona de Bienvenida',
    desc: 'Nuestro icónico jardín vertical con el logo en neón de Benny Salón, donde compartimos los cambios de look en Instagram.',
    src: '/benny/interior-wall.png'
  },
  {
    id: 'styling',
    title: 'Estación de Manicure, Color & Lavado Spa',
    tag: 'Atención Integral',
    desc: 'Sillones ergonómicos y equipamiento profesional para realizar tratamientos simultáneos con total comodidad.',
    src: '/benny/interior-styling.png'
  },
  {
    id: 'banner',
    title: 'Más de 21 Años de Historia',
    tag: 'Trayectoria & Confianza',
    desc: 'Más de dos décadas en Surquillo dedicadas a la belleza, colorimetría y bienestar capilar.',
    src: '/benny/banner.png'
  }
];

export const StoreShowcaseMotion: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem>(PHOTOS[0]);

  return (
    <section id="tienda" className="py-16 sm:py-20 border-b border-benny-border bg-benny-bg">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-benny-border gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-benny-lavender border border-benny-pink/30 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-benny-purple font-semibold">
                CONOCE NUESTRO LOCAL EN SURQUILLO
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-benny-ink tracking-tight">
              Un espacio creado para consentirte
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-benny-ink-muted max-w-md font-normal leading-relaxed">
            Instalaciones modernas equipadas para colorimetría, estilismo y spa. Selecciona cada área para conocer más detalles.
          </p>
        </div>

        {/* Interactive Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-center">
          
          {/* Main Large Display - Robust: image is always visible */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[16/11] sm:aspect-[16/10] w-full rounded-2xl overflow-hidden border border-benny-border shadow-[0_12px_36px_rgba(81,38,128,0.08)] bg-stone-900">
              
              {/* Main Image with AnimatePresence key */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={selectedPhoto.id}
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.6 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full relative"
                >
                  <img 
                    src={selectedPhoto.src} 
                    alt={selectedPhoto.title} 
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  
                  {/* Vignette and text overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-benny-purple/90 via-transparent to-transparent flex flex-col justify-end p-6 sm:p-8">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-benny-pink font-bold">
                      {selectedPhoto.tag}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1">
                      {selectedPhoto.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-lg">
                      {selectedPhoto.desc}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

            </div>
          </div>

          {/* Selector Thumbnails Column */}
          <div className="lg:col-span-5 space-y-3">
            {PHOTOS.map((item) => {
              const isActive = selectedPhoto.id === item.id;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedPhoto(item)}
                  whileHover={{ scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-3.5 rounded-xl text-left border transition-all flex items-center gap-4 cursor-pointer ${
                    isActive 
                      ? 'bg-white border-benny-purple shadow-[0_4px_20px_rgba(81,38,128,0.12)] ring-1 ring-benny-purple' 
                      : 'bg-white/70 border-benny-border hover:bg-white hover:border-benny-pink/50'
                  }`}
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-benny-border bg-stone-100">
                    <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-benny-purple font-semibold">
                        {item.tag}
                      </span>
                      {isActive && (
                        <span className="text-xs text-benny-pink">✦</span>
                      )}
                    </div>
                    <h4 className="font-serif text-sm sm:text-base font-bold text-benny-ink truncate mt-0.5">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-benny-ink-muted line-clamp-1 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
