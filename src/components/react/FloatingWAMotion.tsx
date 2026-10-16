import React from 'react';
import { motion } from 'framer-motion';

export const FloatingWAMotion: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group"
    >
      <motion.div 
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
        className="hidden sm:block bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-benny-border shadow-md text-xs font-mono font-semibold text-benny-purple"
      >
        <span>¿Deseas agendar? Escríbenos</span>
      </motion.div>

      <motion.a
        href="https://wa.me/51999888777?text=Hola%20Benny%20Sal%C3%B3n%20%26%20Spa,%20quisiera%20consultar%20disponibilidad%20para%20una%20cita."
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:shadow-[0_10px_30px_rgba(37,211,102,0.6)] transition-shadow cursor-pointer relative"
        aria-label="Contactar por WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-benny-pink border-2 border-white animate-pulse" />
        <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.216c-5.412 0-9.8 4.388-9.8 9.8 0 1.727.448 3.417 1.298 4.908l-1.378 5.033 5.163-1.354c1.432.783 3.053 1.213 4.717 1.213 5.41 0 9.8-4.388 9.8-9.8 0-5.412-4.39-9.8-9.8-9.8zm0 17.6c-1.488 0-2.946-.401-4.218-1.157l-.302-.18-3.136.823.837-3.056-.197-.314c-.829-1.32-1.267-2.859-1.267-4.444 0-4.467 3.633-8.1 8.1-8.1 4.465 0 8.1 3.633 8.1 8.1 0 4.468-3.634 8.1-8.1 8.1z"/>
        </svg>
      </motion.a>
    </motion.div>
  );
};
