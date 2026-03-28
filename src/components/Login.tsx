import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';
import imgIniciarSesion from "figma:asset/54e3689f0316108b9ac0b7ce7baeb6fbcc865e7e.png";
import { Header } from './Header';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Login attempt:', email);
      
      // Use backend login API
      const result = await authAPI.login(email, password);

      if (!result.success) {
        setError(result.error || 'Credenciales inválidas. Verifica tu correo y contraseña.');
        setIsLoading(false);
        return;
      }

      console.log('Login successful. User type:', result.user.tipo);
      console.log('Access token received:', result.accessToken ? 'Yes, length:' + result.accessToken.length : 'No');
      
      // Verify token was saved
      const savedToken = localStorage.getItem('accessToken');
      console.log('Token saved to localStorage:', savedToken ? 'Yes, length:' + savedToken.length : 'No');

      // Redirect based on user type
      if (result.user.tipo === 'profesional') {
        navigate('/menu-profesional');
      } else if (result.user.tipo === 'paciente') {
        navigate('/menu-paciente');
      } else {
        setError('Tipo de usuario no reconocido.');
        setIsLoading(false);
      }

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Error al iniciar sesión. Por favor intenta de nuevo.');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Navigate to forgot password');
    toast('Funcionalidad en desarrollo. Pronto podrás recuperar tu contraseña.', {
      icon: 'ℹ️',
      duration: 4000,
      style: {
        background: '#d1ecf1',
        color: '#0c5460',
        border: '1px solid #bee5eb',
      },
    });
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
                disabled={isLoading}
                className="absolute bg-[#e1e9f2] h-[41px] left-[83px] top-[236px] w-[474px] rounded-[10px] px-4 text-black outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
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
                disabled={isLoading}
                className="absolute bg-[#e1e9f2] h-[41px] left-[83px] top-[326px] w-[474px] rounded-[10px] px-4 text-black outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
            
            {/* Error Message */}
            {error && (
              <p className="absolute left-[83px] top-[375px] text-red-600 text-[14px] font-['Poppins:Regular',sans-serif] w-[474px]">
                {error}
              </p>
            )}
            
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
              disabled={isLoading}
              className="absolute left-[164px] top-[442px] w-[312px] h-[60px] bg-[#39588a] rounded-[15px] hover:bg-[#2d4570] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-['Poppins:Bold',sans-serif] text-[24px] text-white">
                {isLoading ? 'Iniciando...' : 'Iniciar sesión'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}