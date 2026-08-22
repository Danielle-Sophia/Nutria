import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { professionalAPI } from '../utils/api';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function calcularEdad(fechaNacimiento: string): number {
  if (!fechaNacimiento) return 0;
  const hoy = new Date();
  const [y, m, d] = fechaNacimiento.split('-').map(Number);
  let edad = hoy.getFullYear() - y;
  const mesActual = hoy.getMonth() + 1;
  if (mesActual < m || (mesActual === m && hoy.getDate() < d)) edad--;
  return Math.max(0, edad);
}

const INPUT_CLASS =
  'w-full bg-[#e1e9f2] rounded-[10px] px-[15px] py-[10px] font-[Poppins] font-normal text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50';
const LABEL_CLASS = 'block font-[Poppins] font-medium text-[16px] text-black mb-[8px]';

const EMPTY_FORM = {
  nombre: '',
  apellidos: '',
  diaNac: '',
  mesNac: '',
  anioNac: '',
  sexoBiologico: 'Hombre',
  pronombres: '',
  email: '',
  password: '',
  telefono: '',
  peso: '',
  talla: '',
  domicilio: '',
  estadoCivil: '',
  escolaridad: '',
  alergias: '',
};

export function AddPatientModal({ isOpen, onClose, onSuccess }: AddPatientModalProps) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Build yyyy-mm-dd string from the three fields (used internally)
  const fechaNacimiento = (() => {
    const { diaNac, mesNac, anioNac } = formData;
    if (!diaNac || !mesNac || !anioNac || anioNac.length < 4) return '';
    return `${anioNac}-${mesNac.padStart(2, '0')}-${diaNac.padStart(2, '0')}`;
  })();

  const edadCalculada = calcularEdad(fechaNacimiento);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleDayMonth = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^\d{0,2}$/.test(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
      setError('');
    }
  };

  const handleYear = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (/^\d{0,4}$/.test(value)) {
      setFormData(prev => ({ ...prev, anioNac: value }));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaNacimiento) {
      setError('Ingresa una fecha de nacimiento válida (DD/MM/AAAA)');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const result = await professionalAPI.addPatient({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        fechaNacimiento,
        edad: edadCalculada,
        sexoBiologico: formData.sexoBiologico,
        pronombres: formData.pronombres || undefined,
        telefono: formData.telefono || undefined,
        peso: formData.peso ? parseFloat(formData.peso) : undefined,
        talla: formData.talla ? parseFloat(formData.talla) : undefined,
        domicilio: formData.domicilio || undefined,
        estadoCivil: formData.estadoCivil || undefined,
        escolaridad: formData.escolaridad || undefined,
        alergias: formData.alergias || undefined,
      });

      if (!result.success) {
        setError(result.error || 'Error al agregar paciente');
        setIsLoading(false);
        return;
      }

      toast.success(
        `Paciente agregado exitosamente.\n\nNombre: ${formData.nombre} ${formData.apellidos}\nFolio: ${result.patient.folio}\n\nCredenciales:\nEmail: ${formData.email}\nContraseña: ${formData.password}`
      );

      setFormData(EMPTY_FORM);

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Add patient error:', err);
      setError(err.message || 'Error al agregar paciente');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[20px] w-[90%] max-w-[750px] max-h-[90vh] overflow-y-auto p-[40px] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-[20px] top-[20px] text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="font-[Poppins] font-bold text-[32px] text-[#193073] mb-[10px]">
          Agregar nuevo paciente
        </h2>
        <p className="font-[Poppins] font-normal text-[16px] text-gray-600 mb-[30px]">
          Completa los datos del paciente para crear su cuenta
        </p>

        {error && (
          <div className="bg-red-50 border border-red-300 rounded-[10px] p-3 mb-4">
            <p className="text-red-600 text-[14px] font-[Poppins] font-normal">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-[20px]">

          {/* ── Nombre y Apellidos ── */}
          <div className="grid grid-cols-2 gap-[20px]">
            <div>
              <label className={LABEL_CLASS}>Nombre(s) *</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange}
                required disabled={isLoading} className={INPUT_CLASS} placeholder="Juan" />
            </div>
            <div>
              <label className={LABEL_CLASS}>Apellidos *</label>
              <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange}
                required disabled={isLoading} className={INPUT_CLASS} placeholder="Pérez García" />
            </div>
          </div>

          {/* ── Fecha de nacimiento (DD / MM / AAAA) + Edad calculada ── */}
          <div>
            <label className={LABEL_CLASS}>Fecha de nacimiento *</label>
            <div className="flex items-center gap-[10px]">
              {/* DD */}
              <input
                type="text" inputMode="numeric" name="diaNac"
                value={formData.diaNac} onChange={handleDayMonth}
                disabled={isLoading} maxLength={2} placeholder="DD"
                className="w-[70px] bg-[#e1e9f2] rounded-[10px] px-[12px] py-[10px] font-[Poppins] font-normal text-[16px] text-center outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
              />
              <span className="font-[Poppins] font-normal text-[18px] text-gray-400">/</span>
              {/* MM */}
              <input
                type="text" inputMode="numeric" name="mesNac"
                value={formData.mesNac} onChange={handleDayMonth}
                disabled={isLoading} maxLength={2} placeholder="MM"
                className="w-[70px] bg-[#e1e9f2] rounded-[10px] px-[12px] py-[10px] font-[Poppins] font-normal text-[16px] text-center outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
              />
              <span className="font-[Poppins] font-normal text-[18px] text-gray-400">/</span>
              {/* AAAA */}
              <input
                type="text" inputMode="numeric" name="anioNac"
                value={formData.anioNac} onChange={handleYear}
                disabled={isLoading} maxLength={4} placeholder="AAAA"
                className="w-[100px] bg-[#e1e9f2] rounded-[10px] px-[12px] py-[10px] font-[Poppins] font-normal text-[16px] text-center outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
              />
              {/* Edad calculada */}
              {fechaNacimiento && (
                <div className="ml-[10px] bg-[#f0f4ff] border border-[#c5d3ee] rounded-[10px] px-[16px] py-[10px] font-[Poppins] font-normal text-[16px] text-[#39588a] whitespace-nowrap">
                  {edadCalculada} años
                </div>
              )}
            </div>
          </div>

          {/* ── Sexo biológico + Pronombres ── */}
          <div className="grid grid-cols-2 gap-[20px]">
            <div>
              <label className={LABEL_CLASS}>Sexo biológico *</label>
              <select name="sexoBiologico" value={formData.sexoBiologico} onChange={handleChange}
                required disabled={isLoading} className={INPUT_CLASS}>
                <option value="Hombre">Hombre</option>
                <option value="Mujer">Mujer</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Pronombres (opcional)</label>
              <select name="pronombres" value={formData.pronombres} onChange={handleChange}
                disabled={isLoading} className={INPUT_CLASS}>
                <option value="">Prefiero no especificar</option>
                <option value="el/ellos">Él / Ellos</option>
                <option value="ella/ellas">Ella / Ellas</option>
                <option value="elle/elles">Elle / Elles</option>
              </select>
              <p className="text-[11px] text-gray-500 mt-1 font-[Poppins]">
                El paciente puede editarlo desde su configuración
              </p>
            </div>
          </div>

          {/* ── Estado civil ── */}
          <div>
            <label className={LABEL_CLASS}>Estado civil (opcional)</label>
            <select name="estadoCivil" value={formData.estadoCivil} onChange={handleChange}
              disabled={isLoading} className={INPUT_CLASS}>
              <option value="">Seleccionar...</option>
              <option value="Soltero/a">Soltero/a</option>
              <option value="Casado/a">Casado/a</option>
              <option value="Divorciado/a">Divorciado/a</option>
              <option value="Viudo/a">Viudo/a</option>
              <option value="Unión libre">Unión libre</option>
            </select>
          </div>

          {/* ── Escolaridad ── */}
          <div>
            <label className={LABEL_CLASS}>Escolaridad (opcional)</label>
            <select name="escolaridad" value={formData.escolaridad} onChange={handleChange}
              disabled={isLoading} className={INPUT_CLASS}>
              <option value="">Seleccionar...</option>
              <option value="Sin estudios">Sin estudios</option>
              <option value="Primaria">Primaria</option>
              <option value="Secundaria">Secundaria</option>
              <option value="Preparatoria / Bachillerato">Preparatoria / Bachillerato</option>
              <option value="Técnico / Vocacional">Técnico / Vocacional</option>
              <option value="Licenciatura">Licenciatura</option>
              <option value="Posgrado">Posgrado</option>
            </select>
          </div>

          {/* ── Correo y Contraseña ── */}
          <div>
            <label className={LABEL_CLASS}>Correo electrónico *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              required disabled={isLoading} className={INPUT_CLASS} placeholder="paciente@email.com" />
          </div>

          <div>
            <label className={LABEL_CLASS}>Contraseña *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange}
              required minLength={8} disabled={isLoading} className={INPUT_CLASS} placeholder="Mínimo 8 caracteres" />
            <p className="text-[12px] text-gray-500 mt-1 font-[Poppins] font-normal">
              Esta contraseña se proporcionará al paciente
            </p>
          </div>

          {/* ── Teléfono y Domicilio ── */}
          <div className="grid grid-cols-2 gap-[20px]">
            <div>
              <label className={LABEL_CLASS}>Teléfono (opcional)</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange}
                disabled={isLoading} className={INPUT_CLASS} placeholder="555-0123" />
            </div>
            <div>
              <label className={LABEL_CLASS}>Domicilio (opcional)</label>
              <input type="text" name="domicilio" value={formData.domicilio} onChange={handleChange}
                disabled={isLoading} className={INPUT_CLASS} placeholder="Calle, colonia, ciudad" />
            </div>
          </div>

          {/* ── Peso y Talla ── */}
          <div className="grid grid-cols-2 gap-[20px]">
            <div>
              <label className={LABEL_CLASS}>Peso (kg) (opcional)</label>
              <input type="number" name="peso" value={formData.peso} onChange={handleChange}
                step="0.1" min="0" disabled={isLoading} className={INPUT_CLASS} placeholder="70.5" />
            </div>
            <div>
              <label className={LABEL_CLASS}>Talla (cm) (opcional)</label>
              <input type="number" name="talla" value={formData.talla} onChange={handleChange}
                step="0.1" min="0" disabled={isLoading} className={INPUT_CLASS} placeholder="170" />
            </div>
          </div>

          {/* ── Alergias ── */}
          <div>
            <label className={LABEL_CLASS}>Alergias (opcional)</label>
            <textarea
              name="alergias"
              value={formData.alergias}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
              className={`${INPUT_CLASS} resize-none`}
              placeholder="Ej: penicilina, mariscos, látex..."
            />
          </div>

          {/* ── Botones ── */}
          <div className="flex gap-[15px] justify-end pt-[10px]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-[30px] py-[12px] rounded-[10px] border-2 border-[#39588a] text-[#39588a] font-[Poppins] font-medium text-[16px] hover:bg-[#39588a] hover:text-white transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-[30px] py-[12px] rounded-[10px] bg-[#39588a] text-white font-[Poppins] font-bold text-[16px] hover:bg-[#2d4570] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Agregando...' : 'Agregar paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
