import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { professionalAPI } from '../utils/api';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPatientModal({ isOpen, onClose, onSuccess }: AddPatientModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    edad: '',
    sexoBiologico: 'Hombre',
    email: '',
    password: '',
    telefono: '',
    peso: '',
    talla: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await professionalAPI.addPatient({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        edad: parseInt(formData.edad),
        sexoBiologico: formData.sexoBiologico,
        telefono: formData.telefono || undefined,
        peso: formData.peso ? parseFloat(formData.peso) : undefined,
        talla: formData.talla ? parseFloat(formData.talla) : undefined,
      });

      if (!result.success) {
        setError(result.error || 'Error al agregar paciente');
        setIsLoading(false);
        return;
      }

      // Success
      toast.success(`Paciente agregado exitosamente.\n\nNombre: ${formData.nombre} ${formData.apellidos}\nFolio: ${result.patient.folio}\n\nCredenciales:\nEmail: ${formData.email}\nContraseña: ${formData.password}`);
      
      // Reset form
      setFormData({
        nombre: '',
        apellidos: '',
        edad: '',
        sexoBiologico: 'Hombre',
        email: '',
        password: '',
        telefono: '',
        peso: '',
        talla: '',
      });
      
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
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-[20px] w-[90%] max-w-[700px] max-h-[90vh] overflow-y-auto p-[40px] shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-[20px] top-[20px] text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="font-['Poppins:Bold',sans-serif] text-[32px] text-[#193073] mb-[10px]">
          Agregar nuevo paciente
        </h2>
        
        <p className="font-['Poppins:Regular',sans-serif] text-[16px] text-gray-600 mb-[30px]">
          Completa los datos del paciente para crear su cuenta
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-[10px] p-3 mb-4">
            <p className="text-red-600 text-[14px] font-['Poppins:Regular',sans-serif]">
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-[20px] mb-[20px]">
            <div>
              <label className="block font-['Poppins:Medium',sans-serif] text-[16px] text-black mb-[8px]">
                Nombre(s) *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full bg-[#e1e9f2] rounded-[10px] px-[15px] py-[10px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
                placeholder="Juan"
              />
            </div>

            <div>
              <label className="block font-['Poppins:Medium',sans-serif] text-[16px] text-black mb-[8px]">
                Apellidos *
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full bg-[#e1e9f2] rounded-[10px] px-[15px] py-[10px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
                placeholder="Pérez García"
              />
            </div>
          </div>

          {/* Age and Sex */}
          <div className="grid grid-cols-2 gap-[20px] mb-[20px]">
            <div>
              <label className="block font-['Poppins:Medium',sans-serif] text-[16px] text-black mb-[8px]">
                Edad *
              </label>
              <input
                type="number"
                name="edad"
                value={formData.edad}
                onChange={handleChange}
                required
                min="1"
                max="120"
                disabled={isLoading}
                className="w-full bg-[#e1e9f2] rounded-[10px] px-[15px] py-[10px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
                placeholder="25"
              />
            </div>

            <div>
              <label className="block font-['Poppins:Medium',sans-serif] text-[16px] text-black mb-[8px]">
                Sexo biológico *
              </label>
              <select
                name="sexoBiologico"
                value={formData.sexoBiologico}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full bg-[#e1e9f2] rounded-[10px] px-[15px] py-[10px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
              >
                <option value="Hombre">Hombre</option>
                <option value="Mujer">Mujer</option>
              </select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mb-[20px]">
            <label className="block font-['Poppins:Medium',sans-serif] text-[16px] text-black mb-[8px]">
              Correo electrónico *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full bg-[#e1e9f2] rounded-[10px] px-[15px] py-[10px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
              placeholder="paciente@email.com"
            />
          </div>

          <div className="mb-[20px]">
            <label className="block font-['Poppins:Medium',sans-serif] text-[16px] text-black mb-[8px]">
              Contraseña *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              disabled={isLoading}
              className="w-full bg-[#e1e9f2] rounded-[10px] px-[15px] py-[10px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
              placeholder="Mínimo 8 caracteres"
            />
            <p className="text-[12px] text-gray-500 mt-1 font-['Poppins:Regular',sans-serif]">
              Esta contraseña se proporcionará al paciente
            </p>
          </div>

          <div className="mb-[20px]">
            <label className="block font-['Poppins:Medium',sans-serif] text-[16px] text-black mb-[8px]">
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full bg-[#e1e9f2] rounded-[10px] px-[15px] py-[10px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
              placeholder="555-0123"
            />
          </div>

          {/* Medical Data */}
          <div className="grid grid-cols-2 gap-[20px] mb-[30px]">
            <div>
              <label className="block font-['Poppins:Medium',sans-serif] text-[16px] text-black mb-[8px]">
                Peso (kg) (opcional)
              </label>
              <input
                type="number"
                name="peso"
                value={formData.peso}
                onChange={handleChange}
                step="0.1"
                min="0"
                disabled={isLoading}
                className="w-full bg-[#e1e9f2] rounded-[10px] px-[15px] py-[10px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
                placeholder="70.5"
              />
            </div>

            <div>
              <label className="block font-['Poppins:Medium',sans-serif] text-[16px] text-black mb-[8px]">
                Talla (cm) (opcional)
              </label>
              <input
                type="number"
                name="talla"
                value={formData.talla}
                onChange={handleChange}
                step="0.1"
                min="0"
                disabled={isLoading}
                className="w-full bg-[#e1e9f2] rounded-[10px] px-[15px] py-[10px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff] transition-all disabled:opacity-50"
                placeholder="170"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-[15px] justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-[30px] py-[12px] rounded-[10px] border-2 border-[#39588a] text-[#39588a] font-['Poppins:Medium',sans-serif] text-[16px] hover:bg-[#39588a] hover:text-white transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-[30px] py-[12px] rounded-[10px] bg-[#39588a] text-white font-['Poppins:Bold',sans-serif] text-[16px] hover:bg-[#2d4570] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Agregando...' : 'Agregar paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}