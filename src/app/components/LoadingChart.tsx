import { motion } from 'motion/react';

export function LoadingChart() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <motion.div
        className="w-16 h-16 border-4 border-[#5e7deb] border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.p
        className="font-[Poppins] font-normal text-[16px] text-gray-500 italic text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Cargando datos...
      </motion.p>
    </div>
  );
}

export function EmptyChart({ message }: { message: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-gray-400 mb-4"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18" />
          <path d="M18 17l-5-5-4 4-4-4" />
        </svg>
      </motion.div>
      <p className="font-[Poppins] font-normal text-[16px] text-gray-500 italic text-center">
        {message}
      </p>
    </motion.div>
  );
}
