import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Clock, User, MapPin, FileText } from 'lucide-react';

interface Doctor {
  id: string;
  nombre: string;
  especialidad: string;
  disponibilidad: string[];
}

const doctoresDisponibles: Doctor[] = [
  { 
    id: '1', 
    nombre: 'Dra. María González', 
    especialidad: 'Nutrición Clínica',
    disponibilidad: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
  },
  { 
    id: '2', 
    nombre: 'Dr. Carlos Ramírez', 
    especialidad: 'Endocrinología',
    disponibilidad: ['10:00', '11:00', '12:00', '15:00', '16:00', '17:00']
  },
  { 
    id: '3', 
    nombre: 'Dra. Ana Martínez', 
    especialidad: 'Nutrición Deportiva',
    disponibilidad: ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00']
  },
];

export function AgendarCita() {
  const navigate = useNavigate();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [modalidad, setModalidad] = useState<'presencial' | 'virtual'>('presencial');
  const [motivo, setMotivo] = useState('');
  const [notas, setNotas] = useState('');

  const handleSubmit = () => {
    if (!selectedDoctor || !fecha || !hora) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    console.log('Agendando cita:', {
      doctor: selectedDoctor,
      fecha,
      hora,
      modalidad,
      motivo,
      notas,
    });

    alert(`Cita agendada exitosamente con ${selectedDoctor.nombre} para el ${fecha} a las ${hora}`);
    navigate('/menu-paciente');
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-[#85aab3] min-h-screen w-full">
      {/* Header */}
      <div className="fixed left-0 top-0 w-full z-50">
        <div className="bg-[#193073] h-[80px] w-full flex items-center justify-between px-[60px]">
          <button 
            onClick={() => navigate('/menu-paciente')}
            className="font-['Istok_Web:Regular',sans-serif] font-['Jost:Regular',sans-serif] leading-[normal] not-italic text-[40px] text-nowrap text-white hover:opacity-80 transition-opacity cursor-pointer"
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
        <div className="bg-white rounded-[40px] p-[40px] max-w-[1200px] mx-auto">
          {/* Title */}
          <div className="flex items-center gap-[15px] mb-[30px]">
            <Calendar size={36} className="text-[#39588a]" />
            <h1 className="font-['Poppins:Bold',sans-serif] text-[36px] text-[#193073]">
              Agendar Cita
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[30px]">
            {/* Doctor Selection */}
            <div>
              <h2 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-black mb-[20px] flex items-center gap-[10px]">
                <User size={24} className="text-[#39588a]" />
                Selecciona tu profesional de salud
              </h2>
              
              <div className="space-y-[15px]">
                {doctoresDisponibles.map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor)}
                    className={`w-full text-left p-[20px] rounded-[15px] transition-all ${
                      selectedDoctor?.id === doctor.id
                        ? 'bg-[#39588a] text-white shadow-lg'
                        : 'bg-[#f5f5f5] text-black hover:bg-[#e5e5e5]'
                    }`}
                  >
                    <p className="font-['Poppins:Bold',sans-serif] text-[18px] mb-[5px]">
                      {doctor.nombre}
                    </p>
                    <p className={`font-['Poppins:Regular',sans-serif] text-[14px] ${
                      selectedDoctor?.id === doctor.id ? 'opacity-90' : 'text-gray-600'
                    }`}>
                      {doctor.especialidad}
                    </p>
                  </button>
                ))}
              </div>

              {/* Modalidad */}
              <div className="mt-[25px]">
                <h3 className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-black mb-[15px] flex items-center gap-[10px]">
                  <MapPin size={20} className="text-[#39588a]" />
                  Modalidad de consulta
                </h3>
                <div className="flex gap-[15px]">
                  <button
                    onClick={() => setModalidad('presencial')}
                    className={`flex-1 py-[12px] rounded-[10px] font-['Poppins:Medium',sans-serif] text-[16px] transition-all ${
                      modalidad === 'presencial'
                        ? 'bg-[#39588a] text-white'
                        : 'bg-[#e1e9f2] text-black hover:bg-[#d0dde8]'
                    }`}
                  >
                    Presencial
                  </button>
                  <button
                    onClick={() => setModalidad('virtual')}
                    className={`flex-1 py-[12px] rounded-[10px] font-['Poppins:Medium',sans-serif] text-[16px] transition-all ${
                      modalidad === 'virtual'
                        ? 'bg-[#39588a] text-white'
                        : 'bg-[#e1e9f2] text-black hover:bg-[#d0dde8]'
                    }`}
                  >
                    Virtual
                  </button>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div>
              <h2 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-black mb-[20px] flex items-center gap-[10px]">
                <Clock size={24} className="text-[#39588a]" />
                Fecha y hora
              </h2>
              
              <div className="space-y-[20px]">
                {/* Date */}
                <div>
                  <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                    Fecha de la cita
                  </label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    min={today}
                    className="w-full bg-[#e1e9f2] rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff]"
                  />
                </div>

                {/* Available Times */}
                {selectedDoctor && fecha && (
                  <div>
                    <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                      Horarios disponibles
                    </label>
                    <div className="grid grid-cols-3 gap-[10px]">
                      {selectedDoctor.disponibilidad.map((horario) => (
                        <button
                          key={horario}
                          onClick={() => setHora(horario)}
                          className={`py-[10px] rounded-[10px] font-['Poppins:Medium',sans-serif] text-[14px] transition-all ${
                            hora === horario
                              ? 'bg-[#39588a] text-white'
                              : 'bg-[#e1e9f2] text-black hover:bg-[#d0dde8]'
                          }`}
                        >
                          {horario}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div>
                  <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                    <FileText size={18} className="inline mr-2" />
                    Motivo de la consulta
                  </label>
                  <select
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="w-full bg-[#e1e9f2] rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff]"
                  >
                    <option value="">Selecciona un motivo</option>
                    <option value="control">Control de rutina</option>
                    <option value="seguimiento">Seguimiento de tratamiento</option>
                    <option value="revision">Revisión de resultados</option>
                    <option value="dieta">Ajuste de plan alimenticio</option>
                    <option value="sintomas">Consulta por síntomas</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Información adicional que quieras compartir..."
                    rows={4}
                    className="w-full bg-[#e1e9f2] rounded-[10px] px-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] resize-none"
                  />
                </div>

                {/* Summary Card */}
                {selectedDoctor && fecha && hora && (
                  <div className="bg-[#39588a] rounded-[15px] p-[20px] text-white">
                    <p className="font-['Poppins:Bold',sans-serif] text-[18px] mb-[15px]">
                      Resumen de la cita
                    </p>
                    <div className="space-y-[10px] font-['Poppins:Regular',sans-serif] text-[14px]">
                      <p>👨‍⚕️ <span className="font-semibold">{selectedDoctor.nombre}</span></p>
                      <p>📅 {new Date(fecha).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p>🕐 {hora}</p>
                      <p>📍 Modalidad: {modalidad === 'presencial' ? 'Presencial' : 'Virtual'}</p>
                      {motivo && <p>📋 Motivo: {motivo}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-[30px] gap-[15px]">
            <button
              onClick={() => navigate('/menu-paciente')}
              className="bg-gray-300 hover:bg-gray-400 text-black rounded-[15px] px-[40px] py-[15px] font-['Poppins:Bold',sans-serif] text-[18px] transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedDoctor || !fecha || !hora || !motivo}
              className={`rounded-[15px] px-[40px] py-[15px] font-['Poppins:Bold',sans-serif] text-[18px] transition-all ${
                !selectedDoctor || !fecha || !hora || !motivo
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#39588a] hover:bg-[#2d4570] text-white active:scale-95'
              }`}
            >
              Confirmar cita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
