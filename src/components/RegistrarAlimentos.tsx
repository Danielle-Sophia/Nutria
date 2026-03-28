import { useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { ArrowLeft, Search, Plus, Utensils } from 'lucide-react';

interface Alimento {
  id: string;
  nombre: string;
  calorias: number;
  carbohidratos: number;
  proteinas: number;
  grasas: number;
  porcion: string;
}

const alimentosComunes: Alimento[] = [
  { id: '1', nombre: 'Manzana', calorias: 95, carbohidratos: 25, proteinas: 0.5, grasas: 0.3, porcion: '1 pieza mediana' },
  { id: '2', nombre: 'Pechuga de pollo', calorias: 165, carbohidratos: 0, proteinas: 31, grasas: 3.6, porcion: '100g' },
  { id: '3', nombre: 'Arroz blanco', calorias: 130, carbohidratos: 28, proteinas: 2.7, grasas: 0.3, porcion: '1/2 taza' },
  { id: '4', nombre: 'Aguacate', calorias: 240, carbohidratos: 12, proteinas: 3, grasas: 22, porcion: '1 pieza mediana' },
  { id: '5', nombre: 'Pan integral', calorias: 80, carbohidratos: 15, proteinas: 4, grasas: 1, porcion: '1 rebanada' },
  { id: '6', nombre: 'Yogurt natural', calorias: 100, carbohidratos: 12, proteinas: 9, grasas: 2.5, porcion: '1 taza' },
];

export function RegistrarAlimentos() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('desayuno');
  const [selectedAlimentos, setSelectedAlimentos] = useState<Alimento[]>([]);

  const filteredAlimentos = alimentosComunes.filter(alimento =>
    alimento.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAlimento = (alimento: Alimento) => {
    setSelectedAlimentos([...selectedAlimentos, alimento]);
  };

  const handleRemoveAlimento = (index: number) => {
    setSelectedAlimentos(selectedAlimentos.filter((_, i) => i !== index));
  };

  const totalNutrientes = selectedAlimentos.reduce(
    (acc, alimento) => ({
      calorias: acc.calorias + alimento.calorias,
      carbohidratos: acc.carbohidratos + alimento.carbohidratos,
      proteinas: acc.proteinas + alimento.proteinas,
      grasas: acc.grasas + alimento.grasas,
    }),
    { calorias: 0, carbohidratos: 0, proteinas: 0, grasas: 0 }
  );

  const handleSave = () => {
    console.log('Guardando alimentos:', { selectedMeal, selectedAlimentos });
    toast.success('Registro de alimentos guardado exitosamente');
    navigate('/menu-paciente');
  };

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
        <div className="bg-white rounded-[40px] p-[40px] max-w-[1200px] mx-auto">
          {/* Title */}
          <div className="flex items-center gap-[15px] mb-[30px]">
            <Utensils size={36} className="text-[#39588a]" />
            <h1 className="font-['Poppins:Bold',sans-serif] text-[36px] text-[#193073]">
              Registrar Alimentos
            </h1>
          </div>

          {/* Meal Selection */}
          <div className="mb-[30px]">
            <p className="font-['Poppins:Medium',sans-serif] text-[18px] text-black mb-[15px]">
              Tipo de comida:
            </p>
            <div className="flex gap-[15px] flex-wrap">
              {['desayuno', 'comida', 'cena', 'snack'].map((meal) => (
                <button
                  key={meal}
                  onClick={() => setSelectedMeal(meal)}
                  className={`px-[30px] py-[12px] rounded-[15px] font-['Poppins:Medium',sans-serif] text-[16px] transition-all ${
                    selectedMeal === meal
                      ? 'bg-[#39588a] text-white'
                      : 'bg-[#e1e9f2] text-black hover:bg-[#d0dde8]'
                  }`}
                >
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[30px]">
            {/* Search and Add Section */}
            <div>
              <h2 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-black mb-[15px]">
                Buscar alimentos
              </h2>
              
              {/* Search Bar */}
              <div className="relative mb-[20px]">
                <Search className="absolute left-[15px] top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar alimento..."
                  className="w-full bg-[#e1e9f2] rounded-[10px] pl-[45px] pr-[20px] py-[12px] font-['Poppins:Regular',sans-serif] text-[16px] outline-none focus:ring-2 focus:ring-[#458dff]"
                />
              </div>

              {/* Food List */}
              <div className="bg-[#f5f5f5] rounded-[20px] p-[20px] max-h-[500px] overflow-y-auto">
                <div className="space-y-[10px]">
                  {filteredAlimentos.map((alimento) => (
                    <div
                      key={alimento.id}
                      className="bg-white rounded-[10px] p-[15px] flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        <p className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-black">
                          {alimento.nombre}
                        </p>
                        <p className="font-['Poppins:Regular',sans-serif] text-[12px] text-gray-600">
                          {alimento.calorias} kcal • {alimento.porcion}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddAlimento(alimento)}
                        className="bg-[#39588a] hover:bg-[#2d4570] text-white rounded-full p-[8px] transition-colors"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Foods Section */}
            <div>
              <h2 className="font-['Poppins:SemiBold',sans-serif] text-[20px] text-black mb-[15px]">
                Alimentos seleccionados
              </h2>
              
              <div className="bg-[#f5f5f5] rounded-[20px] p-[20px] mb-[20px]">
                {selectedAlimentos.length === 0 ? (
                  <p className="font-['Poppins:Regular',sans-serif] text-[16px] text-gray-500 text-center py-[40px]">
                    No has agregado alimentos aún
                  </p>
                ) : (
                  <div className="space-y-[10px] max-h-[300px] overflow-y-auto">
                    {selectedAlimentos.map((alimento, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-[10px] p-[15px] flex items-center justify-between"
                      >
                        <div>
                          <p className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-black">
                            {alimento.nombre}
                          </p>
                          <p className="font-['Poppins:Regular',sans-serif] text-[12px] text-gray-600">
                            {alimento.porcion}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveAlimento(index)}
                          className="text-red-500 hover:text-red-700 font-['Poppins:Bold',sans-serif] text-[20px]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nutritional Summary */}
              {selectedAlimentos.length > 0 && (
                <div className="bg-[#39588a] rounded-[20px] p-[20px] text-white">
                  <h3 className="font-['Poppins:Bold',sans-serif] text-[18px] mb-[15px]">
                    Resumen nutricional
                  </h3>
                  <div className="grid grid-cols-2 gap-[15px]">
                    <div>
                      <p className="font-['Poppins:Regular',sans-serif] text-[14px] opacity-90">
                        Calorías
                      </p>
                      <p className="font-['Poppins:Bold',sans-serif] text-[24px]">
                        {totalNutrientes.calorias} kcal
                      </p>
                    </div>
                    <div>
                      <p className="font-['Poppins:Regular',sans-serif] text-[14px] opacity-90">
                        Carbohidratos
                      </p>
                      <p className="font-['Poppins:Bold',sans-serif] text-[24px]">
                        {totalNutrientes.carbohidratos.toFixed(1)} g
                      </p>
                    </div>
                    <div>
                      <p className="font-['Poppins:Regular',sans-serif] text-[14px] opacity-90">
                        Proteínas
                      </p>
                      <p className="font-['Poppins:Bold',sans-serif] text-[24px]">
                        {totalNutrientes.proteinas.toFixed(1)} g
                      </p>
                    </div>
                    <div>
                      <p className="font-['Poppins:Regular',sans-serif] text-[14px] opacity-90">
                        Grasas
                      </p>
                      <p className="font-['Poppins:Bold',sans-serif] text-[24px]">
                        {totalNutrientes.grasas.toFixed(1)} g
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-[30px]">
            <button
              onClick={handleSave}
              disabled={selectedAlimentos.length === 0}
              className={`rounded-[15px] px-[40px] py-[15px] font-['Poppins:Bold',sans-serif] text-[18px] transition-all ${
                selectedAlimentos.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#39588a] hover:bg-[#2d4570] text-white active:scale-95'
              }`}
            >
              Guardar registro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}