import { UserCircle } from 'lucide-react';

interface WelcomeSectionProps {
  nombre: string;
  especialidad: string;
}

export function WelcomeSection({ nombre, especialidad }: WelcomeSectionProps) {
  return (
    <div className="relative h-[208px] w-full">
      {/* Avatar Icon */}
      <div className="absolute h-[208px] left-0 top-0 w-[221px] flex items-center justify-center">
        <UserCircle 
          size={180} 
          className="text-[#7f94e2]" 
          strokeWidth={1.5}
        />
      </div>
      
      {/* Welcome Message */}
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-[normal] left-[calc(50%-33.5px)] not-italic text-[#7f94e2] text-[32px] top-[44px]">
        ¡Bienvenida!
      </p>
      
      {/* Name */}
      <p className="absolute font-['Poppins:SemiBold',sans-serif] h-[27px] leading-[normal] left-[253px] not-italic text-[18px] text-black top-[101px] w-[204px] whitespace-pre-wrap">
        {nombre}
      </p>
      
      {/* Specialty */}
      <p className="absolute font-['Poppins:Regular',sans-serif] h-[27px] leading-[normal] left-[253px] not-italic text-[18px] text-black top-[137px] w-[320px] whitespace-pre-wrap">
        Especialidad: {especialidad}
      </p>
    </div>
  );
}