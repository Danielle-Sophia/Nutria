import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import imgIniciarSesion from "figma:asset/54e3689f0316108b9ac0b7ce7baeb6fbcc865e7e.png";
import { Header } from './Header';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    
    // Navigate to professional menu after successful login
    navigate('/menu-profesional');
  };

  const handleForgotPassword = () => {
    console.log('Navigate to forgot password');
    alert('Recuperación de contraseña...');
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center pt-16 pb-10">
      {/* Background Image */}
      <img 
        alt="" 
        className="fixed inset-0 max-w-none object-cover pointer-events-none w-full h-full" 
        src={imgIniciarSesion} 
      />
      
      {/* Header */}
      <Header />
      
      {/* Login Form Container */}
      <div className="relative w-[640px] h-[703px] z-10 my-6">
        <div className="absolute bg-[rgba(255,255,255,0.85)] inset-0 rounded-[20px]" />
        
        {/* Form Content */}
        <div className="relative w-full h-full">
          {/* Title */}
          <p className="absolute font-['Poppins:Bold',sans-serif] leading-[normal] left-1/2 -translate-x-1/2 not-italic text-[48px] text-black text-nowrap top-[41px]">
            Iniciar sesión
          </p>
          
          {/* Register Link */}
          <div className="absolute left-[83px] top-[137px]">
            <span className="font-['Poppins:Regular',sans-serif] text-[18px] text-black">
              ¿Eres nuevo aquí?{' '}
            </span>
            <Link 
              to="/registro"
              className="[text-underline-position:from-font] decoration-solid font-['Poppins:Bold',sans-serif] text-[#458dff] text-[18px] underline hover:text-[#3a7ae0] transition-colors"
            >
              Regístrate
            </Link>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email"
                className="absolute font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black left-[83px] top-[209px]"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="absolute bg-[#e1e9f2] h-[41px] left-[83px] top-[236px] w-[474px] rounded-[10px] px-4 text-black outline-none focus:ring-2 focus:ring-[#458dff] transition-all"
                placeholder="tu@email.com"
              />
            </div>
            
            {/* Password Field */}
            <div>
              <label 
                htmlFor="password"
                className="absolute font-['Poppins:Regular',sans-serif] leading-[normal] not-italic text-[18px] text-black left-[83px] top-[299px]"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="absolute bg-[#e1e9f2] h-[41px] left-[83px] top-[326px] w-[474px] rounded-[10px] px-4 text-black outline-none focus:ring-2 focus:ring-[#458dff] transition-all"
                placeholder="••••••••"
              />
            </div>
            
            {/* Forgot Password Link */}
            <button
              type="button"
              onClick={handleForgotPassword}
              className="[text-underline-position:from-font] absolute decoration-solid font-['Poppins:Bold',sans-serif] leading-[normal] left-[83px] not-italic text-[#458dff] text-[18px] top-[392px] underline hover:text-[#3a7ae0] transition-colors"
            >
              Olvidé mi contraseña
            </button>
            
            {/* Submit Button */}
            <button
              type="submit"
              className="absolute left-[164px] top-[442px] w-[312px] h-[60px] bg-[#39588a] rounded-[15px] hover:bg-[#2d4570] active:scale-[0.98] transition-all"
            >
              <span className="font-['Poppins:Bold',sans-serif] text-[24px] text-white">
                Iniciar sesión
              </span>
            </button>
          </form>
          
          {/* Patient Menu Link */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[530px] text-center">
            <span className="font-['Poppins:Regular',sans-serif] text-[16px] text-black">
              ¿Eres paciente?{' '}
            </span>
            <Link 
              to="/menu-paciente"
              className="[text-underline-position:from-font] decoration-solid font-['Poppins:Bold',sans-serif] text-[#458dff] text-[16px] underline hover:text-[#3a7ae0] transition-colors"
            >
              Ir al menú de paciente
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}