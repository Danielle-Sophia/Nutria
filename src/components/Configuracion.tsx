import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, User, Bell, Lock, Globe, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserData, userAPI } from '../utils/api';

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

  if (isLoading) {
    return (
      <div className="bg-[#85aab3] min-h-screen w-full flex items-center justify-center">
        <p className="font-['Poppins:Regular',sans-serif] text-[18px] text-white">
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
            <span className="font-['Poppins:Regular',sans-serif] text-[18px]">Volver al menú</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-[80px] pb-[40px] px-[60px]">
        <div className="bg-white rounded-[40px] p-[40px] max-w-[1000px] mx-auto">
          {/* Title */}
          <h1 className="font-['Poppins:Bold',sans-serif] text-[36px] text-[#193073] mb-[30px]">
            Configuración
          </h1>

          {/* Profile Section */}
          <div className="mb-[30px]">
            <div className="flex items-center gap-[10px] mb-[20px]">
              <User size={24} className="text-[#39588a]" />
              <h2 className="font-['Poppins:SemiBold',sans-serif] text-[24px] text-black">
                {config.tipo === 'profesional' ? 'Perfil Profesional' : 'Perfil de Paciente'}
              </h2>
            </div>
            
            <div className="bg-[#f5f5f5] rounded-[20px] p-[25px] space-y-[20px]">
              <div>
                <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                  Folio
                </label>
                <input
                  type="text"
                  value={config.folio}
                  disabled
                  className="w-full bg-gray-200 rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] text-gray-600 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-[20px]">
                <div>
                  <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                    Nombre(s)
                  </label>
                  <input
                    type="text"
                    value={config.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    disabled={isSaving}
                    className="w-full bg-white rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={config.apellidos}
                    onChange={(e) => handleChange('apellidos', e.target.value)}
                    disabled={isSaving}
                    className="w-full bg-white rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={config.email}
                  disabled
                  className="w-full bg-gray-200 rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] text-gray-600 cursor-not-allowed"
                />
                <p className="font-['Poppins:Regular',sans-serif] text-[12px] text-gray-500 mt-[5px]">
                  El correo electrónico no puede ser modificado
                </p>
              </div>

              {config.tipo === 'profesional' && (
                <>
                  <div>
                    <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                      Especialidad
                    </label>
                    <input
                      type="text"
                      value={config.especialidad}
                      onChange={(e) => handleChange('especialidad', e.target.value)}
                      disabled={isSaving}
                      className="w-full bg-white rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                      Cédula profesional
                    </label>
                    <input
                      type="text"
                      value={config.cedulaProfesional}
                      disabled
                      className="w-full bg-gray-200 rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] text-gray-600 cursor-not-allowed"
                    />
                    <p className="font-['Poppins:Regular',sans-serif] text-[12px] text-gray-500 mt-[5px]">
                      La cédula profesional no puede ser modificada
                    </p>
                  </div>
                </>
              )}

              {config.tipo === 'paciente' && (
                <>
                  <div>
                    <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                      Fecha de nacimiento
                    </label>
                    <input
                      type="date"
                      value={config.fechaNacimiento || ''}
                      onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                      disabled={isSaving}
                      className="w-full bg-white rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                      Dirección
                    </label>
                    <textarea
                      value={config.direccion || ''}
                      onChange={(e) => handleChange('direccion', e.target.value)}
                      disabled={isSaving}
                      rows={3}
                      className="w-full bg-white rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] disabled:opacity-50 resize-none"
                      placeholder="Calle, número, colonia, ciudad..."
                    />
                  </div>
                </>
              )}

              <div>
                <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={config.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  disabled={isSaving}
                  className="w-full bg-white rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="mb-[30px]">
            <div className="flex items-center gap-[10px] mb-[20px]">
              <Bell size={24} className="text-[#39588a]" />
              <h2 className="font-['Poppins:SemiBold',sans-serif] text-[24px] text-black">
                Notificaciones
              </h2>
            </div>
            
            <div className="bg-[#f5f5f5] rounded-[20px] p-[25px] space-y-[15px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-['Poppins:Medium',sans-serif] text-[16px] text-black">
                    Activar notificaciones
                  </p>
                  <p className="font-['Poppins:Regular',sans-serif] text-[14px] text-gray-600">
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
                  <p className="font-['Poppins:Medium',sans-serif] text-[16px] text-black">
                    Notificaciones por correo
                  </p>
                  <p className="font-['Poppins:Regular',sans-serif] text-[14px] text-gray-600">
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
                  <p className="font-['Poppins:Medium',sans-serif] text-[16px] text-black">
                    Notificaciones push
                  </p>
                  <p className="font-['Poppins:Regular',sans-serif] text-[14px] text-gray-600">
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
              <h2 className="font-['Poppins:SemiBold',sans-serif] text-[24px] text-black">
                Seguridad
              </h2>
            </div>
            
            <div className="bg-[#f5f5f5] rounded-[20px] p-[25px]">
              <button
                onClick={() => toast('Funcionalidad de cambio de contraseña en desarrollo', {
                  icon: '🔒',
                  duration: 3000,
                  style: {
                    background: '#d1ecf1',
                    color: '#0c5460',
                    border: '1px solid #bee5eb',
                  },
                })}
                className="w-full bg-[#39588a] hover:bg-[#2d4570] text-white rounded-[10px] px-[20px] py-[12px] font-['Poppins:Medium',sans-serif] text-[16px] transition-colors"
              >
                Cambiar contraseña
              </button>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="mb-[30px]">
            <div className="flex items-center gap-[10px] mb-[20px]">
              <Palette size={24} className="text-[#39588a]" />
              <h2 className="font-['Poppins:SemiBold',sans-serif] text-[24px] text-black">
                Preferencias
              </h2>
            </div>
            
            <div className="bg-[#f5f5f5] rounded-[20px] p-[25px] space-y-[20px]">
              <div>
                <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                  <Globe size={18} className="inline mr-2" />
                  Idioma
                </label>
                <select
                  value={config.idioma}
                  onChange={(e) => handleChange('idioma', e.target.value)}
                  className="w-full bg-white rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff]"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                  Tema
                </label>
                <select
                  value={config.tema}
                  onChange={(e) => handleChange('tema', e.target.value)}
                  className="w-full bg-white rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff]"
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
              className="bg-[#39588a] hover:bg-[#2d4570] text-white rounded-[15px] px-[40px] py-[15px] font-['Poppins:Bold',sans-serif] text-[18px] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}