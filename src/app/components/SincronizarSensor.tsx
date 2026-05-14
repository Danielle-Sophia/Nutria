import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Smartphone, Bluetooth, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

type SyncStatus = 'idle' | 'searching' | 'connecting' | 'syncing' | 'success' | 'error';

export function SincronizarSensor() {
  const navigate = useNavigate();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [deviceName, setDeviceName] = useState('');
  const [lastSync, setLastSync] = useState('25 Feb 2026, 14:30');
  const [batteryLevel, setBatteryLevel] = useState(85);

  const startSync = () => {
    setSyncStatus('searching');
    
    // Simulate device search
    setTimeout(() => {
      setSyncStatus('connecting');
      setDeviceName('FreeStyle Libre 2');
      
      setTimeout(() => {
        setSyncStatus('syncing');
        
        setTimeout(() => {
          setSyncStatus('success');
          setLastSync(new Date().toLocaleString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }));
          setBatteryLevel(Math.floor(Math.random() * 20) + 75); // 75-95%
        }, 3000);
      }, 2000);
    }, 2000);
  };

  const resetSync = () => {
    setSyncStatus('idle');
    setDeviceName('');
  };

  const getStatusInfo = () => {
    switch (syncStatus) {
      case 'searching':
        return {
          icon: <Bluetooth size={48} className="text-blue-500 animate-pulse" />,
          title: 'Buscando dispositivos...',
          message: 'Asegúrate de que tu sensor esté encendido y cerca',
          color: 'bg-blue-50 border-blue-200',
        };
      case 'connecting':
        return {
          icon: <Smartphone size={48} className="text-yellow-500 animate-bounce" />,
          title: 'Conectando...',
          message: `Conectando con ${deviceName}`,
          color: 'bg-yellow-50 border-yellow-200',
        };
      case 'syncing':
        return {
          icon: <RefreshCw size={48} className="text-blue-500 animate-spin" />,
          title: 'Sincronizando datos...',
          message: 'Descargando lecturas de glucosa',
          color: 'bg-blue-50 border-blue-200',
        };
      case 'success':
        return {
          icon: <CheckCircle size={48} className="text-green-500" />,
          title: '¡Sincronización exitosa!',
          message: 'Tus datos han sido actualizados',
          color: 'bg-green-50 border-green-200',
        };
      case 'error':
        return {
          icon: <AlertCircle size={48} className="text-red-500" />,
          title: 'Error de sincronización',
          message: 'No se pudo conectar con el sensor. Intenta nuevamente',
          color: 'bg-red-50 border-red-200',
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-[#85aab3] min-h-screen w-full">
      {/* Header */}
      <div className="fixed left-0 top-0 w-full z-50">
        <div className="bg-[#193073] h-[60px] w-full flex items-center justify-between px-[60px]">
          <button 
            onClick={() => navigate('/menu-paciente')}
            className="font-['Istok_Web:Regular',sans-serif] font-['Jost:Regular',sans-serif] leading-[normal] not-italic text-[32px] text-nowrap text-white hover:opacity-80 transition-opacity cursor-pointer"
          >
            Nutr<span className="text-[#8db9f2]">IA</span>
          </button>
          
          <button
            onClick={() => navigate('/menu-paciente')}
            className="flex items-center gap-2 text-white hover:text-[#8db9f2] transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="font-['Poppins:Regular',sans-serif] text-[18px]">Volver al menú</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-[100px] pb-[40px] px-[60px]">
        <div className="bg-white rounded-[40px] p-[40px] max-w-[800px] mx-auto">
          {/* Title */}
          <div className="flex items-center gap-[15px] mb-[30px]">
            <Bluetooth size={36} className="text-[#39588a]" />
            <h1 className="font-['Poppins:Bold',sans-serif] text-[36px] text-[#193073]">
              Sincronizar Sensor
            </h1>
          </div>

          {/* Sensor Info Card */}
          <div className="bg-[#f5f5f5] rounded-[20px] p-[25px] mb-[30px]">
            <h2 className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-black mb-[20px]">
              Estado del sensor
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
              <div className="bg-white rounded-[15px] p-[20px]">
                <p className="font-['Poppins:Regular',sans-serif] text-[14px] text-gray-600 mb-[5px]">
                  Dispositivo
                </p>
                <p className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-black">
                  {deviceName || 'No conectado'}
                </p>
              </div>

              <div className="bg-white rounded-[15px] p-[20px]">
                <p className="font-['Poppins:Regular',sans-serif] text-[14px] text-gray-600 mb-[5px]">
                  Última sincronización
                </p>
                <p className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-black">
                  {lastSync}
                </p>
              </div>

              <div className="bg-white rounded-[15px] p-[20px]">
                <p className="font-['Poppins:Regular',sans-serif] text-[14px] text-gray-600 mb-[5px]">
                  Nivel de batería
                </p>
                <div className="flex items-center gap-[10px]">
                  <div className="flex-1 bg-gray-200 rounded-full h-[8px] overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        batteryLevel > 50 ? 'bg-green-500' : batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${batteryLevel}%` }}
                    />
                  </div>
                  <span className="font-['Poppins:Bold',sans-serif] text-[18px] text-black">
                    {batteryLevel}%
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-[15px] p-[20px]">
                <p className="font-['Poppins:Regular',sans-serif] text-[14px] text-gray-600 mb-[5px]">
                  Estado
                </p>
                <div className="flex items-center gap-[8px]">
                  <div className={`w-[12px] h-[12px] rounded-full ${
                    syncStatus === 'success' ? 'bg-green-500' : 
                    syncStatus === 'error' ? 'bg-red-500' : 
                    syncStatus === 'idle' ? 'bg-gray-400' : 'bg-blue-500 animate-pulse'
                  }`} />
                  <p className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-black">
                    {syncStatus === 'success' ? 'Conectado' : 
                     syncStatus === 'error' ? 'Error' : 
                     syncStatus === 'idle' ? 'Sin conexión' : 'Conectando...'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Display */}
          {statusInfo && (
            <div className={`border-2 rounded-[20px] p-[30px] mb-[30px] ${statusInfo.color}`}>
              <div className="flex flex-col items-center text-center">
                {statusInfo.icon}
                <h3 className="font-['Poppins:Bold',sans-serif] text-[24px] text-black mt-[15px] mb-[10px]">
                  {statusInfo.title}
                </h3>
                <p className="font-['Poppins:Regular',sans-serif] text-[16px] text-gray-700">
                  {statusInfo.message}
                </p>
              </div>
            </div>
          )}

          {/* Sync Button */}
          <div className="flex flex-col items-center gap-[15px]">
            {syncStatus === 'idle' || syncStatus === 'error' ? (
              <button
                onClick={startSync}
                className="bg-[#39588a] hover:bg-[#2d4570] text-white rounded-[15px] px-[50px] py-[18px] font-['Poppins:Bold',sans-serif] text-[20px] transition-all active:scale-95 flex items-center gap-[10px]"
              >
                <RefreshCw size={24} />
                {syncStatus === 'error' ? 'Reintentar sincronización' : 'Iniciar sincronización'}
              </button>
            ) : syncStatus === 'success' ? (
              <div className="flex gap-[15px]">
                <button
                  onClick={resetSync}
                  className="bg-[#39588a] hover:bg-[#2d4570] text-white rounded-[15px] px-[40px] py-[15px] font-['Poppins:Bold',sans-serif] text-[18px] transition-all active:scale-95"
                >
                  Nueva sincronización
                </button>
                <button
                  onClick={() => navigate('/menu-paciente')}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-[15px] px-[40px] py-[15px] font-['Poppins:Bold',sans-serif] text-[18px] transition-all active:scale-95"
                >
                  Volver al menú
                </button>
              </div>
            ) : (
              <div className="font-['Poppins:Regular',sans-serif] text-[16px] text-gray-600">
                Sincronizando, por favor espera...
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-[30px] bg-blue-50 border-l-4 border-blue-500 p-[20px] rounded">
            <h3 className="font-['Poppins:Bold',sans-serif] text-[16px] text-blue-900 mb-[10px]">
              Instrucciones de sincronización
            </h3>
            <ul className="font-['Poppins:Regular',sans-serif] text-[14px] text-blue-800 space-y-[8px]">
              <li>• Asegúrate de que tu sensor esté encendido</li>
              <li>• Mantén el sensor cerca de tu dispositivo (máximo 5 metros)</li>
              <li>• Activa Bluetooth en tu dispositivo</li>
              <li>• La sincronización puede tardar hasta 1 minuto</li>
              <li>• No cierres esta ventana durante la sincronización</li>
            </ul>
          </div>

          {/* Supported Devices */}
          <div className="mt-[20px] text-center">
            <p className="font-['Poppins:Regular',sans-serif] text-[12px] text-gray-500 mb-[10px]">
              Sensores compatibles:
            </p>
            <p className="font-['Poppins:Medium',sans-serif] text-[14px] text-gray-700">
              FreeStyle Libre • Dexcom G6 • Guardian Connect
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}