import React from 'react';
import { motion } from 'framer-motion';

export const LocationMotion: React.FC = () => {
  return (
    <section id="ubicacion" className="py-16 sm:py-24 border-b border-benny-border bg-white">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Location Info & Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-benny-lavender border border-benny-pink/30">
              <span className="font-mono text-[10px] uppercase tracking-widest text-benny-purple font-semibold">
                SURQUILLO, LIMA · FÁCIL ACCESO
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-benny-ink tracking-tight">
              Visítanos en Benny Salón & Spa
            </h2>

            <p className="text-xs sm:text-sm text-benny-ink-muted leading-relaxed">
              Estamos ubicados en una zona céntrica y segura de Surquillo, con estacionamiento cercano y todas las comodidades para tu sesión de estilismo o spa.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-benny-bg border border-benny-border">
                <span className="text-lg">📍</span>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-benny-purple font-bold block">
                    DIRECCIÓN
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-benny-ink">
                    Jr. Narciso de la Colina 869, Surquillo 15047, Lima, Perú
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-benny-bg border border-benny-border">
                <span className="text-lg">🕒</span>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-benny-purple font-bold block">
                    HORARIO DE ATENCIÓN
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-benny-ink">
                    Lunes a Sábado: 9:00 AM – 8:00 PM
                  </p>
                  <p className="text-[11px] text-benny-ink-muted">
                    Domingos: Previa cita agendada por WhatsApp
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-benny-bg border border-benny-border">
                <span className="text-lg">📞</span>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-benny-purple font-bold block">
                    TELÉFONO & WHATSAPP
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-benny-ink">
                    (01) 2340267 · WhatsApp: +51 999 888 777
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <motion.a 
                href="https://www.google.com/maps/search/?api=1&query=Benny+Sal%C3%B3n+%26+Spa+Jr+Narciso+de+la+Colina+869+Surquillo" 
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-3 rounded-xl bg-benny-purple text-white text-xs font-mono uppercase tracking-wider font-bold shadow-sm hover:bg-benny-purple-dark transition-all flex items-center gap-2"
              >
                <span>Abrir en Google Maps</span>
                <span>↗</span>
              </motion.a>
              <a 
                href="tel:012340267" 
                className="px-5 py-3 rounded-xl border border-benny-border text-benny-ink text-xs font-mono uppercase tracking-wider font-medium hover:border-benny-purple transition-all"
              >
                Llamar al local
              </a>
            </div>

          </div>

          {/* Interactive Google Map embed */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[16/11] sm:aspect-[16/10] w-full rounded-2xl overflow-hidden border border-benny-border shadow-[0_12px_36px_rgba(81,38,128,0.08)] bg-white">
              <iframe
                title="Mapa de ubicación de Benny Salón & Spa en Surquillo"
                src="https://maps.google.com/maps?q=Benny+Sal%C3%B3n+%26+Spa+Jr+Narciso+de+la+Colina+869+Surquillo+Lima&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
