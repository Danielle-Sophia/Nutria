import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Search, Bell, User, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { ProfileMenu } from './ProfileMenu';
import { getUserData, patientAPI } from '../utils/api';

interface FoodData {
  grupo: string;
  alimento: string;
  cantidad: string;
  unidad: string;
  calorias: number;
  proteina: number;
  lipidos: number;
  carbohidratos: number;
  fibra: number;
  ig: string;
  cargaGlucemica: string;
}

export function RegistroAlimentos() {
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Form state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodData | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [mealType, setMealType] = useState('');
  const [location, setLocation] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [consumptionOrder, setConsumptionOrder] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [isSaving, setIsSaving] = useState(false);
  const [showPortionTable, setShowPortionTable] = useState(false);

  // Multi-food meal state
  interface MealFoodItem {
    food: FoodData;
    quantity: number;
    order: number;
  }
  const [mealFoods, setMealFoods] = useState<MealFoodItem[]>([]);

  const [filteredFoods, setFilteredFoods] = useState<FoodData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [foodsDatabase, setFoodsDatabase] = useState<FoodData[]>([]);
  const [isLoadingDatabase, setIsLoadingDatabase] = useState(true);

  useEffect(() => {
    const user = getUserData();
    if (user) {
      setUserData(user);
    } else {
      navigate('/');
    }

    // Load food database dynamically
    import('../data/foodsDatabase').then((module) => {
      setFoodsDatabase(module.foodsDatabase);
      setIsLoadingDatabase(false);
    }).catch((error) => {
      console.error('Error loading food database:', error);
      setIsLoadingDatabase(false);
      toast.error('Error al cargar la base de datos de alimentos');
    });
  }, [navigate]);

  useEffect(() => {
    if (searchTerm.length > 0 && foodsDatabase.length > 0) {
      const filtered = foodsDatabase.filter(food =>
        food.alimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.grupo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFoods(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredFoods([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, foodsDatabase]);

  const handleFoodSelect = (food: FoodData) => {
    setSelectedFood(food);
    setSearchTerm(food.alimento);
    setShowSuggestions(false);
  };

  const handleClearSelection = () => {
    setSelectedFood(null);
    setSearchTerm('');
  };

  const handleAddToMeal = () => {
    if (!selectedFood) {
      toast.error('Selecciona un alimento primero');
      return;
    }

    const qty = parseFloat(quantity || '1');
    if (qty <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    const newMealFood: MealFoodItem = {
      food: selectedFood,
      quantity: qty,
      order: mealFoods.length + 1,
    };

    setMealFoods([...mealFoods, newMealFood]);

    // Reset food selection
    setSelectedFood(null);
    setSearchTerm('');
    setQuantity('1');

    toast.success(`${selectedFood.alimento} añadido a la comida`, {
      duration: 2000,
    });
  };

  const handleRemoveFromMeal = (index: number) => {
    const updated = mealFoods.filter((_, i) => i !== index);
    // Reorder
    const reordered = updated.map((item, i) => ({ ...item, order: i + 1 }));
    setMealFoods(reordered);
  };

  const handleSaveMeal = async () => {
    if (mealFoods.length === 0) {
      toast.error('Añade al menos un alimento a la comida');
      return;
    }

    if (!mealType || !location || !preparedBy) {
      toast.error('Por favor completa tipo de comida, ubicación y preparado por');
      return;
    }

    setIsSaving(true);

    try {
      // Save each food in the meal
      const savePromises = mealFoods.map(async (mealFood) => {
        const nutritionalInfo = {
          calorias: mealFood.food.calorias * mealFood.quantity,
          proteina: mealFood.food.proteina * mealFood.quantity,
          lipidos: mealFood.food.lipidos * mealFood.quantity,
          carbohidratos: mealFood.food.carbohidratos * mealFood.quantity,
          fibra: mealFood.food.fibra * mealFood.quantity,
          ig: mealFood.food.ig,
          cargaGlucemica: mealFood.food.cargaGlucemica,
        };

        return await patientAPI.saveFoodRecord({
          foodName: mealFood.food.alimento,
          foodGroup: mealFood.food.grupo,
          quantity: mealFood.quantity,
          unit: mealFood.food.unidad,
          mealType,
          location,
          preparedBy,
          consumptionOrder: consumptionOrder || `Orden ${mealFood.order}`,
          date,
          time,
          nutritionalInfo,
        });
      });

      const results = await Promise.all(savePromises);
      const allSuccess = results.every(r => r.success);

      if (allSuccess) {
        toast.success(`Comida guardada: ${mealFoods.length} alimento(s) registrado(s)`, {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #d4edda 0%, #e8f5e9 100%)',
            color: '#155724',
            border: '1px solid #c3e6cb',
          },
        });

        // Reset form
        setMealFoods([]);
        setMealType('');
        setLocation('');
        setPreparedBy('');
        setConsumptionOrder('');
        setDate(new Date().toISOString().split('T')[0]);
        setTime(new Date().toTimeString().slice(0, 5));
      } else {
        toast.error('Error al guardar algunos alimentos');
      }
    } catch (error: any) {
      console.error('Save meal error:', error);
      toast.error('Error al guardar la comida');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotifications = () => {
    toast('Notificaciones en desarrollo', {
      icon: '🔔',
      duration: 3000,
    });
  };

  if (isLoadingDatabase) {
    return (
      <div className="bg-gradient-to-br from-[#85aab3] to-[#a5c6cd] min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-['Poppins:Regular',sans-serif] text-[18px] text-white">
            Cargando base de datos de alimentos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#85aab3] to-[#a5c6cd] min-h-screen w-full">
      {/* Header */}
      <div className="fixed left-0 top-0 w-full z-50">
        <div className="bg-gradient-to-r from-[#193073] to-[#2a4580] h-[60px] w-full flex items-center justify-between px-[60px] shadow-lg">
          <button
            onClick={() => navigate('/menu-paciente')}
            className="font-['Istok_Web:Regular',sans-serif] font-['Jost:Regular',sans-serif] leading-[normal] not-italic text-[32px] text-nowrap text-white hover:opacity-80 transition-opacity cursor-pointer"
          >
            Nutr<span className="text-[#8db9f2]">IA</span>
          </button>

          <div className="flex items-center gap-[30px]">
            <motion.button
              onClick={handleNotifications}
              className="text-white hover:text-[#8db9f2] transition-colors cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell size={30} strokeWidth={2.5} />
            </motion.button>
            <motion.button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="text-white hover:text-[#8db9f2] transition-colors cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <User size={30} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-[80px] pb-[40px] px-[40px]">
        <motion.div
          className="bg-white rounded-[40px] p-[40px] max-w-[1200px] mx-auto shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-[30px]">
            <div className="flex items-center gap-[20px]">
              <button
                onClick={() => navigate('/menu-paciente')}
                className="flex items-center gap-2 text-[#39588a] hover:text-[#2d4570] transition-colors"
              >
                <ArrowLeft size={24} />
                <span className="font-['Poppins:Medium',sans-serif] text-[16px]">Volver</span>
              </button>
              <h1 className="font-['Poppins:Bold',sans-serif] text-[32px] text-[#193073]">
                Registro de Alimentos
              </h1>
            </div>
            <button
              onClick={() => setShowPortionTable(!showPortionTable)}
              className="bg-gradient-to-r from-[#5e7deb] to-[#7aa8e1] text-white px-[20px] py-[10px] rounded-[10px] font-['Poppins:Medium',sans-serif] text-[14px] hover:from-[#4d6bd9] hover:to-[#6997d0] transition-all"
            >
              {showPortionTable ? 'Ocultar' : 'Ver'} Tabla de Porciones
            </button>
          </div>

          {/* Portion Table */}
          {showPortionTable && (
            <motion.div
              className="bg-[#f5f9ff] rounded-[20px] p-[25px] mb-[30px]"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h3 className="font-['Poppins:Bold',sans-serif] text-[20px] text-[#39588a] mb-[15px]">
                Medidas con las Manos - Guía de Porciones
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
                <div className="bg-white rounded-[15px] p-[15px]">
                  <p className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-black mb-[5px]">
                    ✋ Palma de la mano
                  </p>
                  <p className="font-['Poppins:Regular',sans-serif] text-[14px] text-gray-700">
                    Proteínas: Carne, pescado, pollo (90-120g)
                  </p>
                </div>
                <div className="bg-white rounded-[15px] p-[15px]">
                  <p className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-black mb-[5px]">
                    ✊ Puño cerrado
                  </p>
                  <p className="font-['Poppins:Regular',sans-serif] text-[14px] text-gray-700">
                    Carbohidratos: Arroz, pasta, cereales (1 taza aprox.)
                  </p>
                </div>
                <div className="bg-white rounded-[15px] p-[15px]">
                  <p className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-black mb-[5px]">
                    🤏 Pulgar
                  </p>
                  <p className="font-['Poppins:Regular',sans-serif] text-[14px] text-gray-700">
                    Grasas: Aceite, mantequilla, nueces (1 cucharada)
                  </p>
                </div>
                <div className="bg-white rounded-[15px] p-[15px]">
                  <p className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-black mb-[5px]">
                    🖐️ Manos ahuecadas
                  </p>
                  <p className="font-['Poppins:Regular',sans-serif] text-[14px] text-gray-700">
                    Verduras: Ensaladas, vegetales (2 tazas aprox.)
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form */}
          {/* Info Message */}
          {mealFoods.length === 0 && (
            <div className="bg-[#e3f2fd] border-l-4 border-[#2196f3] rounded-[10px] p-[15px] mb-[20px]">
              <p className="font-['Poppins:Medium',sans-serif] text-[15px] text-[#1976d2] mb-[5px]">
                💡 Nuevo flujo de registro
              </p>
              <p className="font-['Poppins:Regular',sans-serif] text-[14px] text-[#1565c0]">
                Busca y añade todos los alimentos que comiste en esta comida. Por ejemplo: 2 piezas de huevo + 2 porciones de jugo de naranja. Luego guarda toda la comida junta.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[25px]">
            {/* Left Column */}
            <div className="space-y-[20px]">
              {/* Food Search */}
              <div>
                <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                  Buscar Alimento *
                </label>
                <div className="relative">
                  <div className="flex gap-[10px]">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Busca por nombre o grupo..."
                        className="w-full bg-white rounded-[10px] px-[15px] py-[12px] font-['Poppins:Regular',sans-serif] text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] outline-none"
                      />
                      <Search className="absolute right-[15px] top-[12px] text-gray-400" size={20} />
                    </div>
                    {selectedFood && (
                      <button
                        onClick={handleClearSelection}
                        className="bg-red-500 text-white p-[12px] rounded-[10px] hover:bg-red-600 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>

                  {/* Suggestions */}
                  {showSuggestions && filteredFoods.length > 0 && (
                    <div className="absolute z-10 w-full mt-[5px] bg-white border border-gray-300 rounded-[10px] shadow-lg max-h-[200px] overflow-y-auto">
                      {filteredFoods.map((food, index) => (
                        <button
                          key={index}
                          onClick={() => handleFoodSelect(food)}
                          className="w-full text-left px-[15px] py-[10px] hover:bg-[#f0f4ff] transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <p className="font-['Poppins:Medium',sans-serif] text-[14px] text-black">
                            {food.alimento}
                          </p>
                          <p className="font-['Poppins:Regular',sans-serif] text-[12px] text-gray-600">
                            {food.grupo} • {food.cantidad} {food.unidad}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Nutritional Info */}
              {selectedFood && (
                <motion.div
                  className="bg-[#f0f4ff] rounded-[15px] p-[15px]"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="font-['Poppins:SemiBold',sans-serif] text-[16px] text-[#39588a] mb-[10px]">
                    Información Nutricional (por porción)
                  </h3>
                  <div className="grid grid-cols-2 gap-[10px] text-[13px]">
                    <div>
                      <span className="font-['Poppins:Medium',sans-serif]">Calorías:</span> {selectedFood.calorias} kcal
                    </div>
                    <div>
                      <span className="font-['Poppins:Medium',sans-serif]">Proteína:</span> {selectedFood.proteina}g
                    </div>
                    <div>
                      <span className="font-['Poppins:Medium',sans-serif]">Carbohidratos:</span> {selectedFood.carbohidratos}g
                    </div>
                    <div>
                      <span className="font-['Poppins:Medium',sans-serif]">Lípidos:</span> {selectedFood.lipidos}g
                    </div>
                    <div>
                      <span className="font-['Poppins:Medium',sans-serif]">Fibra:</span> {selectedFood.fibra}g
                    </div>
                    <div>
                      <span className="font-['Poppins:Medium',sans-serif]">IG:</span> {selectedFood.ig}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quantity */}
              <div>
                <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                  Cantidad de Porciones
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0.25"
                  step="0.25"
                  className="w-full bg-white rounded-[10px] px-[15px] py-[12px] font-['Poppins:Regular',sans-serif] text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] outline-none"
                />
              </div>

              {/* Meal Type */}
              <div>
                <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                  Tipo de Comida *
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full bg-white rounded-[10px] px-[15px] py-[12px] font-['Poppins:Regular',sans-serif] text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] outline-none"
                >
                  <option value="">Selecciona...</option>
                  <option value="Desayuno">Desayuno</option>
                  <option value="Colación matutina">Colación matutina</option>
                  <option value="Almuerzo">Almuerzo/Comida</option>
                  <option value="Colación vespertina">Colación vespertina</option>
                  <option value="Cena">Cena</option>
                  <option value="Colación nocturna">Colación nocturna</option>
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-[15px]">
                <div>
                  <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white rounded-[10px] px-[15px] py-[12px] font-['Poppins:Regular',sans-serif] text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] outline-none"
                  />
                </div>
                <div>
                  <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white rounded-[10px] px-[15px] py-[12px] font-['Poppins:Regular',sans-serif] text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-[20px]">
              {/* Location */}
              <div>
                <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                  Lugar *
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white rounded-[10px] px-[15px] py-[12px] font-['Poppins:Regular',sans-serif] text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] outline-none"
                >
                  <option value="">Selecciona...</option>
                  <option value="Casa">Casa</option>
                  <option value="Trabajo">Trabajo</option>
                  <option value="Escuela">Escuela</option>
                  <option value="Restaurante">Restaurante</option>
                  <option value="Fonda">Fonda</option>
                  <option value="Cafetería">Cafetería</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* Prepared By */}
              <div>
                <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                  ¿Quién preparó los alimentos? *
                </label>
                <select
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  className="w-full bg-white rounded-[10px] px-[15px] py-[12px] font-['Poppins:Regular',sans-serif] text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] outline-none"
                >
                  <option value="">Selecciona...</option>
                  <option value="Yo mismo/a">Yo mismo/a</option>
                  <option value="Familiar">Familiar</option>
                  <option value="Restaurante/Establecimiento">Restaurante/Establecimiento</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* Consumption Order */}
              <div>
                <label className="font-['Poppins:Medium',sans-serif] text-[16px] text-black block mb-[8px]">
                  Orden de Consumo de Alimentos (Opcional)
                </label>
                <p className="font-['Poppins:Regular',sans-serif] text-[12px] text-gray-600 mb-[8px]">
                  Describe en qué orden comiste los alimentos que añadiste. Ejemplo: "Primero el huevo, después el jugo de naranja"
                </p>
                <textarea
                  value={consumptionOrder}
                  onChange={(e) => setConsumptionOrder(e.target.value)}
                  rows={3}
                  placeholder="Ejemplo: Primero comí 2 piezas de huevo cocido, y al final tomé 2 porciones de jugo de naranja..."
                  className="w-full bg-white rounded-[10px] px-[15px] py-[12px] font-['Poppins:Regular',sans-serif] text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Added Foods List */}
          {mealFoods.length > 0 && (
            <div className="mt-[30px] p-[20px] bg-[#f5f9ff] rounded-[15px]">
              <h3 className="font-['Poppins:SemiBold',sans-serif] text-[18px] text-[#39588a] mb-[15px]">
                Alimentos en esta comida ({mealFoods.length})
              </h3>
              <div className="space-y-[10px]">
                {mealFoods.map((mealFood, index) => (
                  <div
                    key={`meal-food-${index}`}
                    className="bg-white rounded-[10px] p-[15px] flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-[10px]">
                        <span className="bg-[#5e7deb] text-white rounded-full w-[24px] h-[24px] flex items-center justify-center text-[12px] font-['Poppins:SemiBold',sans-serif]">
                          {mealFood.order}
                        </span>
                        <p className="font-['Poppins:Medium',sans-serif] text-[16px] text-black">
                          {mealFood.food.alimento}
                        </p>
                      </div>
                      <div className="ml-[34px] mt-[5px]">
                        <p className="font-['Poppins:Regular',sans-serif] text-[14px] text-gray-600">
                          {mealFood.quantity} {mealFood.food.unidad} ({mealFood.food.cantidad} por porción)
                        </p>
                        <p className="font-['Poppins:Regular',sans-serif] text-[13px] text-gray-500">
                          {(mealFood.food.calorias * mealFood.quantity).toFixed(1)} kcal
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFromMeal(index)}
                      className="text-red-500 hover:text-red-700 transition-colors ml-[15px]"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between mt-[30px] pt-[20px] border-t border-gray-200">
            <button
              onClick={() => navigate('/menu-paciente')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-[10px] px-[30px] py-[12px] font-['Poppins:Medium',sans-serif] text-[16px] transition-colors"
            >
              Cancelar
            </button>

            <div className="flex gap-[15px]">
              <button
                onClick={handleAddToMeal}
                disabled={!selectedFood}
                className="bg-gradient-to-r from-[#5e7deb] to-[#7aa8e1] hover:from-[#4d6bd9] hover:to-[#6997d0] text-white rounded-[10px] px-[30px] py-[12px] font-['Poppins:Medium',sans-serif] text-[16px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Añadir a la comida
              </button>

              <button
                onClick={handleSaveMeal}
                disabled={isSaving || mealFoods.length === 0 || !mealType || !location || !preparedBy}
                className="bg-gradient-to-r from-[#39588a] to-[#2d4570] hover:from-[#2d4570] hover:to-[#1e3350] text-white rounded-[10px] px-[30px] py-[12px] font-['Poppins:Medium',sans-serif] text-[16px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-[10px]"
              >
                <Save size={20} />
                {isSaving ? 'Guardando...' : `Guardar Comida (${mealFoods.length})`}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Profile Menu */}
      <ProfileMenu
        isOpen={isProfileMenuOpen}
        onClose={() => setIsProfileMenuOpen(false)}
      />
    </div>
  );
}
