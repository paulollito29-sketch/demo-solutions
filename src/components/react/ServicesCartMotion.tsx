import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ServiceItem {
  id: string;
  cat: string;
  name: string;
  desc: string;
  price: number;
  time: string;
  brand?: string;
  badge?: string;
}

const SERVICES_DATA: ServiceItem[] = [
  // Color & Mechas (Wella Professionals)
  {
    id: 's1',
    cat: 'Color & Mechas',
    name: 'Balayage / Babylights Wella + Matizado & Ampolla',
    desc: 'Técnica de aclarado suave con Wella Blondor + matizador Koleston Perfect ME+ y ampolla selladora de cutícula.',
    price: 180,
    time: '150 min',
    brand: 'Wella',
    badge: 'Más Solicitado'
  },
  {
    id: 's2',
    cat: 'Color & Mechas',
    name: 'Tinte Global Wella + Tratamiento Nutritivo Alfaparf',
    desc: 'Cobertura perfecta de canas y brillo duradero con fórmulas tratantes de línea italiana.',
    price: 160,
    time: '90 min',
    brand: 'Wella & Alfaparf',
    badge: 'Pack Glow Up'
  },
  {
    id: 's3',
    cat: 'Color & Mechas',
    name: 'Retoque de Raíz Koleston + Baño de Brillo Gloss',
    desc: 'Mantenimiento del color de raíz con lavado exfoliante y tratamiento sellador.',
    price: 95,
    time: '75 min',
    brand: 'Wella'
  },

  // Alisados & Bótox (Alfaparf Milano)
  {
    id: 's4',
    cat: 'Alisados & Bótox',
    name: 'Alisado de Keratina Therapy Alfaparf Milano',
    desc: 'Lacio disciplinado, libre de formol, enriquecido con aceite de babasú y keratina para máxima sedosidad.',
    price: 215,
    time: '150 min',
    brand: 'Alfaparf',
    badge: 'Promo Aniversario'
  },
  {
    id: 's5',
    cat: 'Alisados & Bótox',
    name: 'Bótox Capilar Reestructurante Profundo',
    desc: 'Relleno de la fibra capilar dañada por calor o tintes. Brillo espejo y eliminación total del frizz.',
    price: 115,
    time: '75 min',
    brand: 'Alfaparf',
    badge: 'Promo'
  },
  {
    id: 's6',
    cat: 'Alisados & Bótox',
    name: 'Tratamiento Intensivo de Células Madre Semi di Lino',
    desc: 'Renovación celular profunda que devuelve la elasticidad, fuerza y suavidad extrema a cabellos porosos.',
    price: 115,
    time: '60 min',
    brand: 'Alfaparf',
    badge: 'Exclusivo'
  },
  {
    id: 's7',
    cat: 'Alisados & Bótox',
    name: 'Alisado Orgánico Vegetal sin Químicos Agresivos',
    desc: 'Fórmula 100% libre de formol apta para todo tipo de cabello con duración de hasta 4 meses.',
    price: 150,
    time: '120 min',
    brand: 'Línea Vegana'
  },

  // Corte & Peinado
  {
    id: 's8',
    cat: 'Corte & Estilo',
    name: 'Corte en Capas con Flequillo de Autor + Brushing',
    desc: 'Asesoría de visagismo, corte en capas para dar movimiento y textura, lavado relajante y peinado.',
    price: 45,
    time: '45 min',
    badge: 'Tendencia IG'
  },
  {
    id: 's9',
    cat: 'Corte & Estilo',
    name: 'Ondas al Agua / Peinado para Eventos y Ocasión',
    desc: 'Ondas suaves estilo Hollywood con fijación flexible y sérum de brillo.',
    price: 55,
    time: '45 min'
  },

  // Manicure & Spa
  {
    id: 's10',
    cat: 'Manicure & Spa',
    name: 'Manicure en Gel / Rubber System Larga Duración',
    desc: 'Limpieza minuciosa, nivelación de uña natural y esmaltado en gel resistente hasta por 21 días.',
    price: 60,
    time: '60 min',
    badge: 'Top Pedido'
  },
  {
    id: 's11',
    cat: 'Manicure & Spa',
    name: 'Pedicure Spa con Sales Relajantes & Exfoliación',
    desc: 'Baño de pies con sales minerales, exfoliación, remoción de callosidades y masaje descontracturante.',
    price: 55,
    time: '50 min'
  },

  // Mirada & Facial (@yessibeautycare)
  {
    id: 's12',
    cat: 'Estética & Mirada',
    name: 'Lifting de Pestañas + Laminado de Cejas con Keratina',
    desc: 'Curvatura natural de pestañas y perfilado disciplinado en colaboración con @yessibeautycare.',
    price: 75,
    time: '50 min',
    brand: 'Yessi Beauty Care'
  },
  {
    id: 's13',
    cat: 'Estética & Mirada',
    name: 'Limpieza Facial Profunda con Hidratación',
    desc: 'Desintoxicación de poros, vapor de ozono, alta frecuencia y mascarilla nutritiva.',
    price: 90,
    time: '60 min',
    brand: 'Yessi Beauty Care'
  }
];

const CATEGORIES = ['Todos', 'Color & Mechas', 'Alisados & Bótox', 'Corte & Estilo', 'Manicure & Spa', 'Estética & Mirada'];

export const ServicesCartMotion: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [cart, setCart] = useState<ServiceItem[]>([SERVICES_DATA[0]]);
  const [clientName, setClientName] = useState<string>('');
  const [preferredDate, setPreferredDate] = useState<string>('');

  const filteredServices = activeCategory === 'Todos' 
    ? SERVICES_DATA 
    : SERVICES_DATA.filter(s => s.cat === activeCategory);

  const toggleService = (service: ServiceItem) => {
    if (cart.some(s => s.id === service.id)) {
      setCart(cart.filter(s => s.id !== service.id));
    } else {
      setCart([...cart, service]);
    }
  };

  const total = cart.reduce((acc, curr) => acc + curr.price, 0);

  const handleSendWhatsApp = () => {
    const bizPhone = '51999888777';
    const nameStr = clientName.trim() ? `Hola Benny Salón & Spa, mi nombre es *${clientName.trim()}*.` : 'Hola Benny Salón & Spa.';
    const dateStr = preferredDate.trim() ? `\n📅 Preferencia de cita: *${preferredDate.trim()}*` : '';
    
    let itemsStr = '';
    if (cart.length > 0) {
      itemsStr = '\n\nMe gustaría reservar los siguientes servicios de su tarifario:\n' + 
        cart.map((s) => `• *${s.name}* (S/ ${s.price})`).join('\n') +
        `\n\n*Total Estimado: S/ ${total}*`;
    } else {
      itemsStr = '\n\nQuisiera consultar disponibilidad de turnos.';
    }

    const message = encodeURI(`${nameStr}${dateStr}${itemsStr}\n\nVi su catálogo digital de Surquillo. ¿Tienen horarios disponibles?`);
    window.open(`https://wa.me/${bizPhone}?text=${message}`, '_blank');
  };

  return (
    <section id="carta" className="py-16 sm:py-24 border-b border-benny-border bg-white">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-benny-border gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-benny-lavender border border-benny-pink/30 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-benny-purple font-bold">
                TARIFARIO TRANSPARENTE · PRODUCTOS WELLA & ALFAPARF
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-benny-ink tracking-tight">
              Servicios & Tratamientos
            </h2>
          </div>

          {/* Animated Category Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-benny-bg rounded-xl border border-benny-border">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                    isActive ? 'text-white' : 'text-benny-ink-muted hover:text-benny-purple'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-benny-purple rounded-lg shadow-sm"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 font-semibold">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8 items-start">
          
          {/* Services List - ALWAYS VISIBLE without blank flash */}
          <div className="lg:col-span-7 space-y-3">
            <div className="divide-y divide-benny-border border-t border-benny-border">
              {filteredServices.map((service, index) => {
                const isSelected = cart.some(s => s.id === service.id);
                return (
                  <div 
                    key={service.id}
                    className={`py-4 sm:py-5 flex items-start justify-between gap-4 transition-colors rounded-xl px-2 sm:px-3 ${
                      isSelected ? 'bg-benny-pink-soft/70' : 'hover:bg-benny-bg'
                    }`}
                  >
                    <div className="space-y-1 pr-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap font-mono text-[10px] uppercase tracking-widest text-benny-purple font-semibold">
                        <span>0{index + 1}</span>
                        <span className="text-benny-pink">·</span>
                        <span>{service.cat}</span>
                        <span className="text-benny-pink">·</span>
                        <span>⏱ {service.time}</span>
                        {service.brand && (
                          <span className="px-2 py-0.2 rounded bg-white border border-benny-pink/40 text-benny-purple font-bold">
                            {service.brand}
                          </span>
                        )}
                        {service.badge && (
                          <span className="px-2 py-0.2 rounded bg-benny-purple text-white font-bold text-[9px]">
                            {service.badge}
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif text-lg sm:text-xl font-bold text-benny-ink">
                        {service.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-benny-ink-muted leading-relaxed max-w-lg">
                        {service.desc}
                      </p>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-2">
                      <span className="font-mono text-base sm:text-lg font-bold text-benny-purple">
                        S/ {service.price}
                      </span>
                      <motion.button
                        type="button"
                        onClick={() => toggleService(service)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3.5 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-wider font-semibold border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-benny-purple text-white border-benny-purple'
                            : 'bg-white text-benny-purple border-benny-purple/40 hover:bg-benny-purple hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ Agregado' : '+ Agregar'}
                      </motion.button>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-benny-ink-muted font-mono pt-3">
              * Precios actualizados de salón. Trabajamos con líneas originales de Wella Professionals y Alfaparf Milano.
            </p>
          </div>

          {/* Sticky Booking Ticket */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 bg-benny-bg rounded-2xl border border-benny-border p-6 sm:p-7 shadow-[0_12px_40px_rgba(81,38,128,0.07)]">
            
            {/* Ticket Header */}
            <div className="border-b-2 border-benny-purple pb-4 flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-benny-purple font-bold">
                  COTIZACIÓN & RESERVA DIRECTA
                </span>
                <h3 className="font-serif text-2xl font-bold text-benny-ink mt-0.5">
                  Tu Reserva en Benny Salón
                </h3>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 bg-benny-purple text-white font-semibold rounded-full">
                {cart.length} {cart.length === 1 ? 'servicio' : 'servicios'}
              </span>
            </div>

            {/* Selected items receipt */}
            <div className="py-4 space-y-2 min-h-[90px] max-h-56 overflow-y-auto border-b border-dashed border-benny-border text-xs">
              <AnimatePresence initial={false}>
                {cart.length === 0 ? (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-benny-ink-muted italic py-6 text-center font-serif"
                  >
                    Selecciona uno o más servicios de la carta para armar tu cotización.
                  </motion.p>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between gap-2 overflow-hidden py-1"
                    >
                      <div className="flex-1 truncate">
                        <span className="font-semibold text-benny-ink block truncate">{item.name}</span>
                        <span className="text-[10px] text-benny-ink-muted font-mono">⏱ {item.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-benny-purple">S/ {item.price}</span>
                        <button
                          type="button"
                          onClick={() => toggleService(item)}
                          className="text-rose-500 hover:text-rose-700 font-bold px-1.5 py-0.5 rounded cursor-pointer"
                          title="Eliminar"
                        >
                          ✕
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Total */}
            <div className="py-3 border-b border-benny-border flex items-baseline justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-benny-ink-muted">Total Estimado:</span>
              <span className="font-mono text-2xl font-bold text-benny-purple">
                S/ {total.toFixed(2)}
              </span>
            </div>

            {/* Quick Form */}
            <div className="space-y-3 pt-4 text-xs">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-benny-ink-muted mb-1 font-semibold">
                  TU NOMBRE
                </label>
                <input
                  type="text"
                  placeholder="Ej. Carmen Rivas"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-white border border-benny-border rounded-lg px-3 py-2 text-benny-ink placeholder-benny-ink-muted/50 focus:outline-none focus:border-benny-purple focus:ring-1 focus:ring-benny-purple"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-benny-ink-muted mb-1 font-semibold">
                  HORARIO / DÍA PREFERIDO
                </label>
                <input
                  type="text"
                  placeholder="Ej. Sábado a las 3:30 PM"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full bg-white border border-benny-border rounded-lg px-3 py-2 text-benny-ink placeholder-benny-ink-muted/50 focus:outline-none focus:border-benny-purple focus:ring-1 focus:ring-benny-purple"
                />
              </div>

              <motion.button
                type="button"
                onClick={handleSendWhatsApp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 mt-2 rounded-xl bg-benny-purple hover:bg-benny-purple-dark text-white font-mono text-xs uppercase tracking-wider font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Agendar por WhatsApp Directo</span>
                <span className="text-benny-pink">→</span>
              </motion.button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
