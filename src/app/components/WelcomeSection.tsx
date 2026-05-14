import { UserCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface WelcomeSectionProps {
  nombre: string;
  especialidad: string;
  folio?: string;
  profilePicture?: string;
}

export function WelcomeSection({ nombre, especialidad, folio, profilePicture }: WelcomeSectionProps) {
  return (
    <div className="flex items-center gap-[35px]">
      {/* Profile Picture with Gradient Background */}
      <motion.div
        className="flex-shrink-0"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="w-[160px] h-[160px] rounded-full bg-gradient-to-br from-[#39588a] to-[#5e7deb] flex items-center justify-center shadow-xl overflow-hidden">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircle size={110} className="text-white" strokeWidth={1.5} />
          )}
        </div>
      </motion.div>

      {/* Info */}
      <div className="flex-1">
        <motion.p
          className="font-['Poppins:Bold',sans-serif] leading-[normal] not-italic text-[#7f94e2] text-[32px] mb-[20px]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          ¡Bienvenida!
        </motion.p>
        <motion.p
          className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic text-[18px] text-black mb-[8px]"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {nombre}
        </motion.p>
        <motion.p
          className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black mb-[8px]"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Especialidad: {especialidad}
        </motion.p>
        {folio && (
          <motion.p
            className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Folio: {folio}
          </motion.p>
        )}
      </div>
    </div>
  );
}