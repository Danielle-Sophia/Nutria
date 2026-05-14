import { motion } from 'motion/react';

interface NotificationBadgeProps {
  count?: number;
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}

export function NotificationBadge({ count = 0, children, onClick, ariaLabel }: NotificationBadgeProps) {
  return (
    <motion.button
      onClick={onClick}
      className="relative text-white hover:text-[#8db9f2] transition-colors cursor-pointer"
      aria-label={ariaLabel}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
      {count > 0 && (
        <motion.div
          className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            {count > 9 ? '9+' : count}
          </motion.span>
        </motion.div>
      )}
    </motion.button>
  );
}
