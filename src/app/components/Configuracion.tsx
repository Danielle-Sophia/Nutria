import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, User, Bell, Lock, Globe, Palette, UserCircle, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { getUserData, userAPI } from '../utils/api';
import { ConfirmDialog } from './ConfirmDialog';

export function Configuracion() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    especialidad: '',
    cedulaProfesional: '',
    telefono: '',
    tipo: '',
    folio: '',
    direccion: '',
    fechaNacimiento: '',
    notificaciones: true,
    notificacionesEmail: true,
    notificacionesPush: false,
    idioma: 'es',
    tema: 'light',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load user data
    setIsLoading(true);
    const userData = getUserData();

    if (userData) {
      setConfig(prev => ({
        ...prev,
        nombre: userData.nombre || '',
        apellidos: userData.apellidos || '',
        email: userData.email || '',
        especialidad: userData.especialidad || '',
        cedulaProfesional: userData.cedulaProfesional || '',
        telefono: userData.telefono || '',
        tipo: userData.tipo || '',
        folio: userData.folio || '',
        direccion: userData.direccion || '',
        fechaNacimiento: userData.fechaNacimiento || '',
      }));
      setProfilePictureUrl(userData.profilePicture || null);
    } else {
      // No user data, redirect to login
      navigate('/');
    }

    setIsLoading(false);
  }, [navigate]);

  const handleChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    setIsUploadingPicture(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        try {
          const result = await userAPI.uploadProfilePicture(base64String, file.name);

          if (result.success) {
            setProfilePictureUrl(result.profilePictureUrl);
            toast.success('Foto de perfil actualizada exitosamente', {
              duration: 3000,
              style: {
                background: 'linear-gradient(135deg, #d4edda 0%, #e8f5e9 100%)',
                color: '#155724',
                border: '1px solid #c3e6cb',
              },
            });
          } else {
            toast.error('Error al actualizar la foto: ' + result.error);
          }
        } catch (error: any) {
          console.error('Upload error:', error);
          toast.error('Error al subir la foto de perfil');
        } finally {
          setIsUploadingPicture(false);
        }
      };

      reader.onerror = () => {
        toast.error('Error al leer el archivo');
        setIsUploadingPicture(false);
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('File handling error:', error);
      toast.error('Error al procesar la imagen');
      setIsUploadingPicture(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const updates: any = {
        nombre: config.nombre,
        apellidos: config.apellidos,
        telefono: config.telefono,
      };

      // Include especialidad for professionals
      if (config.tipo === 'profesional') {
        updates.especialidad = config.especialidad;
      }

      // Include fechaNacimiento and direccion for patients
      if (config.tipo === 'paciente') {
        updates.fechaNacimiento = config.fechaNacimiento;
        updates.direccion = config.direccion;
      }

      const result = await userAPI.updateProfile(updates);

      if (result.success) {
        toast.success('Configuración guardada exitosamente');
      } else {
        toast.error('Error al guardar la configuración: ' + result.error);
      }
    } catch (error: any) {
      console.error('Save config error:', error);
      toast.error('Error al guardar la configuración: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    // Validations
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Todos los campos son requeridos');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      setPasswordError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await userAPI.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.success) {
        toast.success('Contraseña cambiada exitosamente', {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #d4edda 0%, #e8f5e9 100%)',
            color: '#155724',
            border: '1px solid #c3e6cb',
          },
        });
        setShowPasswordDialog(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setPasswordError(result.error || 'Error al cambiar la contraseña');
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      setPasswordError(error.message || 'Error al cambiar la contraseña');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#85aab3] min-h-screen w-full flex items-center justify-center">
        <p className="font-[Poppins] font-normal text-[18px] text-white">
          Cargando...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#85aab3] min-h-screen w-full">
      {/* Header */}
      <div className="fixed left-0 top-0 w-full z-50">
        <div className="bg-[#193073] h-[60px] w-full flex items-center justify-between px-[60px]">
          <button 
            onClick={() => navigate(config.tipo === 'profesional' ? '/menu-profesional' : '/menu-paciente')}
            className="font-['Istok_Web:Regular',sans-serif] font-['Jost:Regular',sans-serif] leading-[normal] not-italic text-[32px] text-nowrap text-white hover:opacity-80 transition-opacity cursor-pointer"
          >
            Nutr<span className="text-[#8db9f2]">IA</span>
          </button>
          
          <button
            onClick={() => navigate(config.tipo === 'profesional' ? '/menu-profesional' : '/menu-paciente')}
            className="flex items-center gap-2 text-white hover:text-[#8db9f2] transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="font-[Poppins] font-normal text-[18px]">Volver al menú</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-[80px] pb-[40px] px-[60px]">
        <div className="bg-white rounded-[40px] p-[40px] max-w-[1000px] mx-auto">
          {/* Title */}
          <h1 className="font-[Poppins] font-bold text-[36px] text-[#193073] mb-[30px]">
            Configuración
          </h1>

          {/* Profile Section */}
          <div className="mb-[30px]">
            <div className="flex items-center gap-[10px] mb-[20px]">
              <User size={24} className="text-[#39588a]" />
              <h2 className="font-[Poppins] font-semibold text-[24px] text-black">
                {config.tipo === 'profesional' ? 'Perfil Profesional' : 'Perfil de Paciente'}
              </h2>
            </div>

            <div className="bg-[#f5f5f5] rounded-[20px] p-[25px] space-y-[20px]">
              {/* Profile Picture */}
              <div className="flex items-center gap-[20px] mb-[20px]">
                <div className="relative">
                  <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#39588a] to-[#5e7deb] flex items-center justify-center shadow-lg overflow-hidden">
                    {profilePictureUrl ? (
                      <img
                        src={profilePictureUrl}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCircle size={80} className="text-white" strokeWidth={1.5} />
                    )}
                  </div>
                  <motion.button
                    onClick={handleProfilePictureClick}
                    disabled={isUploadingPicture}
                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border-2 border-[#39588a] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Camera size={20} className="text-[#39588a]" />
                  </motion.button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="font-[Poppins] font-semibold text-[20px] text-black">
                    {config.nombre} {config.apellidos}
                  </h3>
                  <p className="font-[Poppins] font-normal text-[14px] text-gray-600">
                    {config.tipo === 'profesional' ? config.especialidad : 'Paciente'} • {config.folio}
                  </p>
                  <p className="font-[Poppins] font-normal text-[12px] text-gray-500 mt-1">
                    {isUploadingPicture ? 'Subiendo foto...' : 'Haz clic en el botón de cámara para cambiar tu foto'}
                  </p>
                </div>
              </div>
              <div>
                <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">
                  Folio
                </label>
                <input
                  type="text"
                  value={config.folio}
                  disabled
                  className="w-full bg-gray-200 rounded-[10px] px-[20px] py-[12px] font-[Poppins] font-normal text-[16px] text-gray-600 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-[20px]">
                <div>
                  <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">
                    Nombre(s)
                  </label>
                  <input
                    type="text"
                    value={config.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    disabled={isSaving}
                    className="w-full bg-white rounded-[10px] px-[20px] py-[12px] font-[Poppins] font-normal text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={config.apellidos}
                    onChange={(e) => handleChange('apellidos', e.target.value)}
                    disabled={isSaving}
                    className="w-full bg-white rounded-[10px] px-[20px] py-[12px] font-[Poppins] font-normal text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={config.email}
                  disabled
                  className="w-full bg-gray-200 rounded-[10px] px-[20px] py-[12px] font-[Poppins] font-normal text-[16px] text-gray-600 cursor-not-allowed"
                />
                <p className="font-[Poppins] font-normal text-[12px] text-gray-500 mt-[5px]">
                  El correo electrónico no puede ser modificado
                </p>
              </div>

              {config.tipo === 'profesional' && (
                <>
                  <div>
                    <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">
                      Especialidad
                    </label>
                    <input
                      type="text"
                      value={config.especialidad}
                      onChange={(e) => handleChange('especialidad', e.target.value)}
                      disabled={isSaving}
                      className="w-full bg-white rounded-[10px] px-[20px] py-[12px] font-[Poppins] font-normal text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">
                      Cédula profesional
                    </label>
                    <input
                      type="text"
                      value={config.cedulaProfesional}
                      disabled
                      className="w-full bg-gray-200 rounded-[10px] px-[20px] py-[12px] font-[Poppins] font-normal text-[16px] text-gray-600 cursor-not-allowed"
                    />
                    <p className="font-[Poppins] font-normal text-[12px] text-gray-500 mt-[5px]">
                      La cédula profesional no puede ser modificada
                    </p>
                  </div>
                </>
              )}

              {config.tipo === 'paciente' && (
                <>
                  <div>
                    <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">
                      Fecha de nacimiento
                    </label>
                    <input
                      type="date"
                      value={config.fechaNacimiento || ''}
                      onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                      disabled={isSaving}
                      className="w-full bg-white rounded-[10px] px-[20px] py-[12px] font-[Poppins] font-normal text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">
                      Dirección
                    </label>
                    <textarea
                      value={config.direccion || ''}
                      onChange={(e) => handleChange('direccion', e.target.value)}
                      disabled={isSaving}
                      rows={3}
                      className="w-full bg-white rounded-[10px] px-[20px] py-[12px] font-[Poppins] font-normal text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] disabled:opacity-50 resize-none"
                      placeholder="Calle, número, colonia, ciudad..."
                    />
                  </div>
                </>
              )}

              <div>
                <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={config.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  disabled={isSaving}
                  className="w-full bg-white rounded-[10px] px-[20px] py-[12px] font-[Poppins] font-normal text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="mb-[30px]">
            <div className="flex items-center gap-[10px] mb-[20px]">
              <Bell size={24} className="text-[#39588a]" />
              <h2 className="font-[Poppins] font-semibold text-[24px] text-black">
                Notificaciones
              </h2>
            </div>
            
            <div className="bg-[#f5f5f5] rounded-[20px] p-[25px] space-y-[15px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-[Poppins] font-medium text-[16px] text-black">
                    Activar notificaciones
                  </p>
                  <p className="font-[Poppins] font-normal text-[14px] text-gray-600">
                    Recibir todas las notificaciones del sistema
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.notificaciones}
                    onChange={(e) => handleChange('notificaciones', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#458dff] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#39588a]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-[Poppins] font-medium text-[16px] text-black">
                    Notificaciones por correo
                  </p>
                  <p className="font-[Poppins] font-normal text-[14px] text-gray-600">
                    Recibir actualizaciones por email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.notificacionesEmail}
                    onChange={(e) => handleChange('notificacionesEmail', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#458dff] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#39588a]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-[Poppins] font-medium text-[16px] text-black">
                    Notificaciones push
                  </p>
                  <p className="font-[Poppins] font-normal text-[14px] text-gray-600">
                    Recibir notificaciones en el navegador
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.notificacionesPush}
                    onChange={(e) => handleChange('notificacionesPush', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#458dff] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#39588a]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="mb-[30px]">
            <div className="flex items-center gap-[10px] mb-[20px]">
              <Lock size={24} className="text-[#39588a]" />
              <h2 className="font-[Poppins] font-semibold text-[24px] text-black">
                Seguridad
              </h2>
            </div>

            <div className="bg-[#f5f5f5] rounded-[20px] p-[25px]">
              <motion.button
                onClick={() => setShowPasswordDialog(true)}
                className="w-full bg-gradient-to-r from-[#39588a] to-[#2d4570] hover:from-[#2d4570] hover:to-[#1e3350] text-white rounded-[10px] px-[20px] py-[12px] font-[Poppins] font-medium text-[16px] transition-all shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🔒 Cambiar contraseña
              </motion.button>
              <p className="font-[Poppins] font-normal text-[12px] text-gray-500 mt-2 text-center">
                Se recomienda cambiar la contraseña periódicamente por seguridad
              </p>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="mb-[30px]">
            <div className="flex items-center gap-[10px] mb-[20px]">
              <Palette size={24} className="text-[#39588a]" />
              <h2 className="font-[Poppins] font-semibold text-[24px] text-black">
                Preferencias
              </h2>
            </div>
            
            <div className="bg-[#f5f5f5] rounded-[20px] p-[25px] space-y-[20px]">
              <div>
                <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">
                  <Globe size={18} className="inline mr-2" />
                  Idioma
                </label>
                <select
                  value={config.idioma}
                  onChange={(e) => handleChange('idioma', e.target.value)}
                  className="w-full bg-white rounded-[10px] px-[20px] py-[12px] font-[Poppins] font-normal text-[16px] outline-none focus:ring-2 focus:ring-[#458dff]"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">
                  Tema
                </label>
                <select
                  value={config.tema}
                  onChange={(e) => handleChange('tema', e.target.value)}
                  className="w-full bg-white rounded-[10px] px-[20px] py-[12px] font-[Poppins] font-normal text-[16px] outline-none focus:ring-2 focus:ring-[#458dff]"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#39588a] hover:bg-[#2d4570] text-white rounded-[15px] px-[40px] py-[15px] font-[Poppins] font-bold text-[18px] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordDialog && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowPasswordDialog(false);
              setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              setPasswordError('');
            }}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-[20px] shadow-2xl max-w-[500px] w-full p-[35px]"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex justify-center mb-[20px]">
                <div className="w-[70px] h-[70px] rounded-full bg-gradient-to-br from-[#39588a] to-[#5e7deb] flex items-center justify-center">
                  <Lock size={36} className="text-white" />
                </div>
              </div>

              {/* Title */}
              <h3 className="font-[Poppins] font-bold text-[26px] text-center text-black mb-[10px]">
                Cambiar contraseña
              </h3>

              {/* Subtitle */}
              <p className="font-[Poppins] font-normal text-[14px] text-center text-gray-600 mb-[25px]">
                Introduce tu contraseña actual y la nueva contraseña
              </p>

              {/* Form */}
              <div className="space-y-[18px] mb-[25px]">
                <div>
                  <label className="font-[Poppins] font-medium text-[14px] text-black block mb-[8px]">
                    Contraseña actual
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    disabled={isChangingPassword}
                    className="w-full bg-gray-50 rounded-[10px] px-[18px] py-[12px] font-[Poppins] font-normal text-[15px] outline-none focus:ring-2 focus:ring-[#458dff] border border-gray-200 disabled:opacity-50"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="font-[Poppins] font-medium text-[14px] text-black block mb-[8px]">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    disabled={isChangingPassword}
                    className="w-full bg-gray-50 rounded-[10px] px-[18px] py-[12px] font-[Poppins] font-normal text-[15px] outline-none focus:ring-2 focus:ring-[#458dff] border border-gray-200 disabled:opacity-50"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>

                <div>
                  <label className="font-[Poppins] font-medium text-[14px] text-black block mb-[8px]">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    disabled={isChangingPassword}
                    className="w-full bg-gray-50 rounded-[10px] px-[18px] py-[12px] font-[Poppins] font-normal text-[15px] outline-none focus:ring-2 focus:ring-[#458dff] border border-gray-200 disabled:opacity-50"
                    placeholder="Repite la nueva contraseña"
                  />
                </div>
              </div>

              {/* Error Message */}
              {passwordError && (
                <motion.div
                  className="bg-red-50 border border-red-200 rounded-[10px] p-[12px] mb-[20px]"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="font-[Poppins] font-normal text-[14px] text-red-600 text-center">
                    {passwordError}
                  </p>
                </motion.div>
              )}

              {/* Buttons */}
              <div className="flex gap-[15px]">
                <motion.button
                  onClick={() => {
                    setShowPasswordDialog(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordError('');
                  }}
                  disabled={isChangingPassword}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-[10px] py-[13px] font-[Poppins] font-medium text-[16px] transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancelar
                </motion.button>

                <motion.button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="flex-1 bg-gradient-to-r from-[#39588a] to-[#2d4570] hover:from-[#2d4570] hover:to-[#1e3350] text-white rounded-[10px] py-[13px] font-[Poppins] font-medium text-[16px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isChangingPassword ? 'Cambiando...' : 'Cambiar contraseña'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}