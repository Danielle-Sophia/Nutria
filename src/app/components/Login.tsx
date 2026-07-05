import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { authAPI } from '../utils/api';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import imgIniciarSesion from "figma:asset/54e3689f0316108b9ac0b7ce7baeb6fbcc865e7e.png";
import { Header } from './Header';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize demo users on mount
  useEffect(() => {
    const initDemoUsers = async () => {
      try {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-deaf8e85/init-demo`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } catch (error) {
        console.error('Failed to initialize demo users:', error);
      }
    };

    initDemoUsers();
  }, []);

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
    navigate('/recuperar-contrasena');
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center pt-16 pb-10">
      {/* Background Image */}
      <motion.img
        alt=""
        className="fixed inset-0 max-w-none object-cover pointer-events-none w-full h-full"
        src={imgIniciarSesion}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      {/* Header */}
      <Header />

      {/* Login Form Container */}
      <motion.div
        className="relative w-[640px] h-[703px] z-10 my-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="absolute bg-[rgba(255,255,255,0.85)] backdrop-blur-sm inset-0 rounded-[20px] shadow-2xl" />
        
        {/* Form Content */}
        <div className="relative w-full h-full">
          {/* Title */}
          <p className="absolute font-[Poppins] font-bold leading-[normal] left-1/2 -translate-x-1/2 not-italic text-[48px] text-black text-nowrap top-[41px]">
            Iniciar sesión
          </p>
          
          {/* Register Link */}
          <div className="absolute left-[83px] top-[137px]">
            <span className="font-[Poppins] font-normal text-[18px] text-black">
              ¿Eres nuevo aquí?{' '}
            </span>
            <Link
              to="/registro"
              className="[text-underline-position:from-font] decoration-solid font-[Poppins] font-bold text-[#458dff] text-[18px] underline hover:text-[#3a7ae0] transition-colors"
            >
              Regístrate
            </Link>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email"
                className="absolute font-[Poppins] font-normal leading-[normal] not-italic text-[18px] text-black left-[83px] top-[209px]"
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
                className="absolute font-[Poppins] font-normal leading-[normal] not-italic text-[18px] text-black left-[83px] top-[299px]"
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
              <motion.p
                className="absolute left-[83px] top-[375px] text-red-600 text-[14px] font-[Poppins] font-normal w-[474px]"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.p>
            )}
            
            {/* Forgot Password Link */}
            <button
              type="button"
              onClick={handleForgotPassword}
              className="[text-underline-position:from-font] absolute decoration-solid font-[Poppins] font-bold leading-[normal] left-[83px] not-italic text-[#458dff] text-[18px] top-[392px] underline hover:text-[#3a7ae0] transition-colors"
            >
              Olvidé mi contraseña
            </button>
            
            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="absolute left-[164px] top-[442px] w-[312px] h-[60px] bg-[#39588a] rounded-[15px] hover:bg-[#2d4570] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-[Poppins] font-bold text-[24px] text-white flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Iniciando...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </span>
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}