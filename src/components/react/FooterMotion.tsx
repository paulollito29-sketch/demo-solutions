import React from 'react';

export const FooterMotion: React.FC = () => {
  return (
    <footer className="border-t border-benny-border bg-benny-bg py-12 px-4 text-xs">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-benny-purple flex items-center justify-center p-1.5 shadow-sm border border-benny-pink/40">
            <img 
              src="/benny/logo-transparent.png" 
              alt="Logo Benny Salón & Spa" 
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>
          <div>
            <span className="font-serif text-lg font-bold text-benny-ink block leading-none">
              Benny Salón & Spa
            </span>
            <span className="font-script text-benny-pink text-base font-bold">
              Más de 21 años realzando lo mejor de ti
            </span>
          </div>
        </div>

        <div className="text-center md:text-right text-benny-ink-muted space-y-1">
          <p className="font-mono text-[11px]">
            Jr. Narciso de la Colina 869, Surquillo 15047, Lima, Perú
          </p>
          <p className="text-[10px] text-stone-400">
            © {new Date().getFullYear()} Benny Salón & Spa. Todos los derechos reservados.
          </p>
        </div>

      </div>
    </footer>
  );
};
