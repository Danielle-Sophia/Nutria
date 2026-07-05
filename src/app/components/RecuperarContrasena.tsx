import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Mail, Lock, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { authAPI } from '../utils/api';

export function RecuperarContrasena() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetCode, setResetCode] = useState('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Ingresa tu correo electrónico');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authAPI.requestPasswordReset(email);

      if (result.success) {
        setResetCode(result.resetCode);
        setStep('reset');
        toast.success('Código de recuperación generado', {
          duration: 5000,
        });
      } else {
        toast.error(result.error || 'Error al solicitar recuperación');
      }
    } catch (error: any) {
      console.error('Request reset error:', error);
      toast.error('Error al solicitar recuperación de contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || !newPassword || !confirmPassword) {
      toast.error('Completa todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authAPI.resetPassword(email, code, newPassword);

      if (result.success) {
        toast.success('Contraseña actualizada exitosamente', {
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #d4edda 0%, #e8f5e9 100%)',
            color: '#155724',
            border: '1px solid #c3e6cb',
          },
        });

        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        toast.error(result.error || 'Error al restablecer contraseña');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error('Error al restablecer contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#85aab3] to-[#a5c6cd] min-h-screen w-full flex items-center justify-center p-[20px]">
      <motion.div
        className="bg-white rounded-[30px] shadow-2xl max-w-[500px] w-full p-[40px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="text-center mb-[30px]">
          <button
            onClick={() => navigate('/')}
            className="mb-[20px] inline-flex items-center gap-[8px] font-[Poppins] font-normal text-[14px] text-[#39588a] hover:text-[#2d4570] transition-colors"
          >
            <ArrowLeft size={18} />
            Volver al inicio
          </button>
          <h1 className="font-['Istok_Web:Regular',sans-serif] font-['Jost:Regular',sans-serif] text-[42px] text-[#193073] mb-[10px]">
            Nutr<span className="text-[#8db9f2]">IA</span>
          </h1>
          <h2 className="font-[Poppins] font-semibold text-[24px] text-[#39588a] mb-[10px]">
            Recuperar Contraseña
          </h2>
          <p className="font-[Poppins] font-normal text-[14px] text-gray-600">
            {step === 'request'
              ? 'Ingresa tu correo para recibir un código de recuperación'
              : 'Ingresa el código y tu nueva contraseña'}
          </p>
        </div>

        {step === 'request' ? (
          <form onSubmit={handleRequestReset} className="space-y-[20px]">
            <div>
              <label className="font-[Poppins] font-medium text-[14px] text-gray-700 block mb-[8px]">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-gray-50 rounded-[12px] px-[45px] py-[14px] font-[Poppins] font-normal text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] focus:border-transparent outline-none transition-all"
                  required
                />
                <Mail className="absolute left-[15px] top-[14px] text-gray-400" size={20} />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#39588a] to-[#2d4570] hover:from-[#2d4570] hover:to-[#1e3350] text-white rounded-[12px] px-[30px] py-[14px] font-[Poppins] font-semibold text-[16px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Enviando...' : 'Solicitar Código'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-[20px]">
            {/* Show reset code for development */}
            {resetCode && (
              <div className="bg-[#fff3cd] border-l-4 border-[#ffc107] rounded-[10px] p-[15px] mb-[20px]">
                <p className="font-[Poppins] font-semibold text-[14px] text-[#856404] mb-[5px]">
                  ⚠️ Código de Recuperación (Desarrollo)
                </p>
                <p className="font-[Poppins] font-normal text-[13px] text-[#856404] mb-[8px]">
                  En producción, este código se enviaría por correo electrónico.
                </p>
                <div className="bg-white rounded-[8px] p-[10px] text-center">
                  <p className="font-[Poppins] font-bold text-[24px] text-[#193073] tracking-widest">
                    {resetCode}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="font-[Poppins] font-medium text-[14px] text-gray-700 block mb-[8px]">
                Código de Verificación
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full bg-gray-50 rounded-[12px] px-[45px] py-[14px] font-[Poppins] font-normal text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] focus:border-transparent outline-none transition-all"
                  required
                />
                <Key className="absolute left-[15px] top-[14px] text-gray-400" size={20} />
              </div>
            </div>

            <div>
              <label className="font-[Poppins] font-medium text-[14px] text-gray-700 block mb-[8px]">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-gray-50 rounded-[12px] px-[45px] py-[14px] font-[Poppins] font-normal text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] focus:border-transparent outline-none transition-all"
                  required
                />
                <Lock className="absolute left-[15px] top-[14px] text-gray-400" size={20} />
              </div>
            </div>

            <div>
              <label className="font-[Poppins] font-medium text-[14px] text-gray-700 block mb-[8px]">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu contraseña"
                  className="w-full bg-gray-50 rounded-[12px] px-[45px] py-[14px] font-[Poppins] font-normal text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] focus:border-transparent outline-none transition-all"
                  required
                />
                <Lock className="absolute left-[15px] top-[14px] text-gray-400" size={20} />
              </div>
            </div>

            <div className="flex gap-[15px]">
              <button
                type="button"
                onClick={() => {
                  setStep('request');
                  setCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-[12px] px-[20px] py-[14px] font-[Poppins] font-medium text-[16px] transition-colors"
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-[#39588a] to-[#2d4570] hover:from-[#2d4570] hover:to-[#1e3350] text-white rounded-[12px] px-[20px] py-[14px] font-[Poppins] font-semibold text-[16px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
