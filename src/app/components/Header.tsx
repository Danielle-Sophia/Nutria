import { motion } from 'motion/react';

export function Header() {
  return (
    <div className="fixed left-0 top-0 w-full z-50">
      <div className="bg-gradient-to-r from-[#193073] to-[#2a4580] h-[60px] w-full flex items-center shadow-lg">
        <motion.p
          className="font-['Istok_Web:Regular',sans-serif] font-['Jost:Regular',sans-serif] leading-[normal] left-[60px] absolute not-italic text-[32px] text-nowrap text-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Nutr<span className="text-[#8db9f2]">IA</span>
        </motion.p>
      </div>
    </div>
  );
}