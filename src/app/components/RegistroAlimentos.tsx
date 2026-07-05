import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Search, Bell, User, Save, X, History, Utensils, ChevronRight } from 'lucide-react';
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

interface FoodRecord {
  id: string;
  foodName: string;
  foodGroup?: string;
  quantity: number;
  unit: string;
  mealType: string;
  date: string;
  time: string;
  nutritionalInfo?: {
    calorias?: number;
    carbohidratos?: number;
    proteina?: number;
    lipidos?: number;
    fibra?: number;
  };
  createdAt: string;
}

export function RegistroAlimentos() {
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [historialOpen, setHistorialOpen] = useState(false);

  // Historial state
  const [foodRecords, setFoodRecords] = useState<FoodRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

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

  const fetchFoodRecords = useCallback(async (userId: string) => {
    setLoadingRecords(true);
    try {
      const result = await patientAPI.getFoodRecords(userId);
      if (result.success) {
        setFoodRecords(result.records || []);
      }
    } catch (err) {
      console.error('Error fetching food records:', err);
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  useEffect(() => {
    const user = getUserData();
    if (user) {
      setUserData(user);
      fetchFoodRecords(user.id);
    } else {
      navigate('/');
    }

    import('../data/foodsDatabase').then((module) => {
      setFoodsDatabase(module.foodsDatabase);
      setIsLoadingDatabase(false);
    }).catch((error) => {
      console.error('Error loading food database:', error);
      setIsLoadingDatabase(false);
      toast.error('Error al cargar la base de datos de alimentos');
    });
  }, [navigate, fetchFoodRecords]);

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
    if (!selectedFood) { toast.error('Selecciona un alimento primero'); return; }
    const qty = parseFloat(quantity || '1');
    if (qty <= 0) { toast.error('La cantidad debe ser mayor a 0'); return; }

    setMealFoods([...mealFoods, { food: selectedFood, quantity: qty, order: mealFoods.length + 1 }]);
    setSelectedFood(null);
    setSearchTerm('');
    setQuantity('1');
    toast.success(`${selectedFood.alimento} añadido a la comida`, { duration: 2000 });
  };

  const handleRemoveFromMeal = (index: number) => {
    const reordered = mealFoods.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i + 1 }));
    setMealFoods(reordered);
  };

  const handleSaveMeal = async () => {
    if (mealFoods.length === 0) { toast.error('Añade al menos un alimento a la comida'); return; }
    if (!mealType || !location || !preparedBy) { toast.error('Por favor completa tipo de comida, ubicación y preparado por'); return; }

    setIsSaving(true);
    try {
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
          mealType, location, preparedBy,
          consumptionOrder: consumptionOrder || `Orden ${mealFood.order}`,
          date, time, nutritionalInfo,
        });
      });

      const results = await Promise.all(savePromises);
      const allSuccess = results.every(r => r.success);

      if (allSuccess) {
        toast.success(`Comida guardada: ${mealFoods.length} alimento(s) registrado(s)`, {
          duration: 3000,
          style: { background: 'linear-gradient(135deg, #d4edda 0%, #e8f5e9 100%)', color: '#155724', border: '1px solid #c3e6cb' },
        });
        setMealFoods([]);
        setMealType(''); setLocation(''); setPreparedBy(''); setConsumptionOrder('');
        setDate(new Date().toISOString().split('T')[0]);
        setTime(new Date().toTimeString().slice(0, 5));
        if (userData?.id) fetchFoodRecords(userData.id);
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
    toast('Notificaciones en desarrollo', { icon: '🔔', duration: 3000 });
  };

  if (isLoadingDatabase) {
    return (
      <div className="bg-gradient-to-br from-[#85aab3] to-[#a5c6cd] min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-[Poppins] font-normal text-[18px] text-white">Cargando base de datos de alimentos...</p>
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
            className="font-['Istok_Web:Regular',sans-serif] leading-[normal] not-italic text-[32px] text-nowrap text-white hover:opacity-80 transition-opacity cursor-pointer"
          >
            Nutr<span className="text-[#8db9f2]">IA</span>
          </button>
          <div className="flex items-center gap-[30px]">
            <motion.button onClick={handleNotifications} className="text-white hover:text-[#8db9f2] transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Bell size={30} strokeWidth={2.5} />
            </motion.button>
            <motion.button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="text-white hover:text-[#8db9f2] transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <User size={30} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="pt-[80px] pb-[40px] px-[20px] lg:px-[30px] flex gap-[20px] items-start max-w-[1500px] mx-auto">

        {/* Form card */}
        <motion.div
          className="bg-white rounded-[40px] p-[40px] flex-1 min-w-0 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Card header */}
          <div className="flex items-center justify-between mb-[30px]">
            <div className="flex items-center gap-[20px]">
              <button onClick={() => navigate('/menu-paciente')} className="flex items-center gap-2 text-[#39588a] hover:text-[#2d4570] transition-colors">
                <ArrowLeft size={24} />
                <span className="font-[Poppins] font-medium text-[16px]">Volver</span>
              </button>
              <h1 className="font-[Poppins] font-bold text-[32px] text-[#193073]">Registro de Alimentos</h1>
            </div>
            <div className="flex items-center gap-[12px]">
              {/* Historial button — mobile only */}
              <button
                onClick={() => setHistorialOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-[#39588a] text-white px-[16px] py-[10px] rounded-[12px] font-[Poppins] font-medium text-[14px] hover:bg-[#2d4570] transition-colors"
              >
                <History size={18} />
                Historial
                {foodRecords.length > 0 && (
                  <span className="bg-white text-[#39588a] rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold">
                    {Math.min(foodRecords.length, 15)}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowPortionTable(!showPortionTable)}
                className="bg-gradient-to-r from-[#5e7deb] to-[#7aa8e1] text-white px-[20px] py-[10px] rounded-[10px] font-[Poppins] font-medium text-[14px] hover:from-[#4d6bd9] hover:to-[#6997d0] transition-all"
              >
                {showPortionTable ? 'Ocultar' : 'Ver'} Tabla de Porciones
              </button>
            </div>
          </div>

          {/* Portion Table */}
          {showPortionTable && (
            <motion.div className="bg-[#f5f9ff] rounded-[20px] p-[25px] mb-[30px]" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <h3 className="font-[Poppins] font-bold text-[20px] text-[#39588a] mb-[15px]">Medidas con las Manos - Guía de Porciones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
                {[
                  { icon: '✋', title: 'Palma de la mano', desc: 'Proteínas: Carne, pescado, pollo (90-120g)' },
                  { icon: '✊', title: 'Puño cerrado', desc: 'Carbohidratos: Arroz, pasta, cereales (1 taza aprox.)' },
                  { icon: '🤏', title: 'Pulgar', desc: 'Grasas: Aceite, mantequilla, nueces (1 cucharada)' },
                  { icon: '🖐️', title: 'Manos ahuecadas', desc: 'Verduras: Ensaladas, vegetales (2 tazas aprox.)' },
                ].map((item) => (
                  <div key={item.title} className="bg-white rounded-[15px] p-[15px]">
                    <p className="font-[Poppins] font-semibold text-[16px] text-black mb-[5px]">{item.icon} {item.title}</p>
                    <p className="font-[Poppins] font-normal text-[14px] text-gray-700">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Info tip */}
          {mealFoods.length === 0 && (
            <div className="bg-[#e3f2fd] border-l-4 border-[#2196f3] rounded-[10px] p-[15px] mb-[20px]">
              <p className="font-[Poppins] font-medium text-[15px] text-[#1976d2] mb-[5px]">💡 Nuevo flujo de registro</p>
              <p className="font-[Poppins] font-normal text-[14px] text-[#1565c0]">
                Busca y añade todos los alimentos que comiste en esta comida. Por ejemplo: 2 piezas de huevo + 2 porciones de jugo de naranja. Luego guarda toda la comida junta.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[25px]">
            {/* Left Column */}
            <div className="space-y-[20px]">
              <div>
                <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">Buscar Alimento *</label>
                <div className="relative">
                  <div className="flex gap-[10px]">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Busca por nombre o grupo..."
                        className="w-full bg-white rounded-[10px] px-[15px] py-[12px] font-[Poppins] font-normal text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] outline-none"
                      />
                      <Search className="absolute right-[15px] top-[12px] text-gray-400" size={20} />
                    </div>
                    {selectedFood && (
                      <button onClick={handleClearSelection} className="bg-red-500 text-white p-[12px] rounded-[10px] hover:bg-red-600 transition-colors">
                        <X size={20} />
                      </button>
                    )}
                  </div>
                  {showSuggestions && filteredFoods.length > 0 && (
                    <div className="absolute z-10 w-full mt-[5px] bg-white border border-gray-300 rounded-[10px] shadow-lg max-h-[200px] overflow-y-auto">
                      {filteredFoods.map((food, index) => (
                        <button key={index} onClick={() => handleFoodSelect(food)} className="w-full text-left px-[15px] py-[10px] hover:bg-[#f0f4ff] transition-colors border-b border-gray-100 last:border-b-0">
                          <p className="font-[Poppins] font-medium text-[14px] text-black">{food.alimento}</p>
                          <p className="font-[Poppins] font-normal text-[12px] text-gray-600">{food.grupo} • {food.cantidad} {food.unidad}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedFood && (
                <motion.div className="bg-[#f0f4ff] rounded-[15px] p-[15px]" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <h3 className="font-[Poppins] font-semibold text-[16px] text-[#39588a] mb-[10px]">Información Nutricional (por porción)</h3>
                  <div className="grid grid-cols-2 gap-[10px] text-[13px]">
                    <div><span className="font-[Poppins] font-medium">Calorías:</span> {selectedFood.calorias} kcal</div>
                    <div><span className="font-[Poppins] font-medium">Proteína:</span> {selectedFood.proteina}g</div>
                    <div><span className="font-[Poppins] font-medium">Carbohidratos:</span> {selectedFood.carbohidratos}g</div>
                    <div><span className="font-[Poppins] font-medium">Lípidos:</span> {selectedFood.lipidos}g</div>
                    <div><span className="font-[Poppins] font-medium">Fibra:</span> {selectedFood.fibra}g</div>
                    <div><span className="font-[Poppins] font-medium">IG:</span> {selectedFood.ig}</div>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">Cantidad de Porciones</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="0.25" step="0.25"
                  className="w-full bg-white rounded-[10px] px-[15px] py-[12px] font-[Poppins] font-normal text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] outline-none" />
              </div>

              <div>
                <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">Tipo de Comida *</label>
                <select value={mealType} onChange={(e) => setMealType(e.target.value)}
                  className="w-full bg-white rounded-[10px] px-[15px] py-[12px] font-[Poppins] font-normal text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] outline-none">
                  <option value="">Selecciona...</option>
                  <option value="Desayuno">Desayuno</option>
                  <option value="Colación matutina">Colación matutina</option>
                  <option value="Almuerzo">Almuerzo/Comida</option>
                  <option value="Colación vespertina">Colación vespertina</option>
                  <option value="Cena">Cena</option>
                  <option value="Colación nocturna">Colación nocturna</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-[15px]">
                <div>
                  <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">Fecha</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white rounded-[10px] px-[15px] py-[12px] font-[Poppins] font-normal text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] outline-none" />
                </div>
                <div>
                  <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">Hora</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white rounded-[10px] px-[15px] py-[12px] font-[Poppins] font-normal text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] outline-none" />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-[20px]">
              <div>
                <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">Lugar *</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white rounded-[10px] px-[15px] py-[12px] font-[Poppins] font-normal text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] outline-none">
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

              <div>
                <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">¿Quién preparó los alimentos? *</label>
                <select value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)}
                  className="w-full bg-white rounded-[10px] px-[15px] py-[12px] font-[Poppins] font-normal text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] outline-none">
                  <option value="">Selecciona...</option>
                  <option value="Yo mismo/a">Yo mismo/a</option>
                  <option value="Familiar">Familiar</option>
                  <option value="Restaurante/Establecimiento">Restaurante/Establecimiento</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="font-[Poppins] font-medium text-[16px] text-black block mb-[8px]">Orden de Consumo (Opcional)</label>
                <p className="font-[Poppins] font-normal text-[12px] text-gray-600 mb-[8px]">
                  Describe en qué orden comiste los alimentos. Ejemplo: "Primero el huevo, después el jugo"
                </p>
                <textarea value={consumptionOrder} onChange={(e) => setConsumptionOrder(e.target.value)} rows={3}
                  placeholder="Ejemplo: Primero comí 2 piezas de huevo cocido, y al final tomé 2 porciones de jugo de naranja..."
                  className="w-full bg-white rounded-[10px] px-[15px] py-[12px] font-[Poppins] font-normal text-[15px] border border-gray-300 focus:ring-2 focus:ring-[#5e7deb] outline-none resize-none" />
              </div>
            </div>
          </div>

          {/* Added Foods List */}
          {mealFoods.length > 0 && (
            <div className="mt-[30px] p-[20px] bg-[#f5f9ff] rounded-[15px]">
              <h3 className="font-[Poppins] font-semibold text-[18px] text-[#39588a] mb-[15px]">Alimentos en esta comida ({mealFoods.length})</h3>
              <div className="space-y-[10px]">
                {mealFoods.map((mealFood, index) => (
                  <div key={`meal-food-${index}`} className="bg-white rounded-[10px] p-[15px] flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-[10px]">
                        <span className="bg-[#5e7deb] text-white rounded-full w-[24px] h-[24px] flex items-center justify-center text-[12px] font-[Poppins] font-semibold">{mealFood.order}</span>
                        <p className="font-[Poppins] font-medium text-[16px] text-black">{mealFood.food.alimento}</p>
                      </div>
                      <div className="ml-[34px] mt-[5px]">
                        <p className="font-[Poppins] font-normal text-[14px] text-gray-600">{mealFood.quantity} {mealFood.food.unidad} ({mealFood.food.cantidad} por porción)</p>
                        <p className="font-[Poppins] font-normal text-[13px] text-gray-500">
                          {(mealFood.food.calorias * mealFood.quantity).toFixed(1)} kcal · {(mealFood.food.carbohidratos * mealFood.quantity).toFixed(1)}g carbs
                        </p>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveFromMeal(index)} className="text-red-500 hover:text-red-700 transition-colors ml-[15px]">
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between mt-[30px] pt-[20px] border-t border-gray-200">
            <button onClick={() => navigate('/menu-paciente')} className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-[10px] px-[30px] py-[12px] font-[Poppins] font-medium text-[16px] transition-colors">
              Cancelar
            </button>
            <div className="flex gap-[15px]">
              <button onClick={handleAddToMeal} disabled={!selectedFood}
                className="bg-gradient-to-r from-[#5e7deb] to-[#7aa8e1] hover:from-[#4d6bd9] hover:to-[#6997d0] text-white rounded-[10px] px-[30px] py-[12px] font-[Poppins] font-medium text-[16px] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                Añadir a la comida
              </button>
              <button onClick={handleSaveMeal} disabled={isSaving || mealFoods.length === 0 || !mealType || !location || !preparedBy}
                className="bg-gradient-to-r from-[#39588a] to-[#2d4570] hover:from-[#2d4570] hover:to-[#1e3350] text-white rounded-[10px] px-[30px] py-[12px] font-[Poppins] font-medium text-[16px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-[10px]">
                <Save size={20} />
                {isSaving ? 'Guardando...' : `Guardar Comida (${mealFoods.length})`}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Historial panel — sidebar desktop */}
        <div className="hidden lg:flex flex-col bg-white rounded-[30px] w-[340px] flex-shrink-0 overflow-hidden shadow-2xl" style={{ maxHeight: 'calc(100vh - 100px)', position: 'sticky', top: '80px' }}>
          <div className="bg-gradient-to-r from-[#193073] to-[#2a4580] px-[24px] py-[18px] flex items-center gap-[10px]">
            <History size={22} className="text-[#8db9f2]" />
            <h2 className="font-[Poppins] font-bold text-[17px] text-white flex-1">Historial de alimentos</h2>
            {foodRecords.length > 0 && (
              <span className="bg-[#8db9f2] text-[#193073] rounded-full px-[10px] py-[2px] text-[13px] font-bold">
                {Math.min(foodRecords.length, 15)}
              </span>
            )}
          </div>
          <HistorialContent records={foodRecords} loading={loadingRecords} />
        </div>
      </div>

      {/* Mobile drawer */}
      {historialOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setHistorialOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[320px] bg-white shadow-2xl flex flex-col">
            <div className="bg-gradient-to-r from-[#193073] to-[#2a4580] px-[20px] py-[16px] flex items-center gap-[10px]">
              <History size={20} className="text-[#8db9f2]" />
              <h2 className="font-[Poppins] font-bold text-[17px] text-white flex-1">Historial de alimentos</h2>
              <button onClick={() => setHistorialOpen(false)} className="text-white/70 hover:text-white"><X size={22} /></button>
            </div>
            <HistorialContent records={foodRecords} loading={loadingRecords} />
          </div>
        </div>
      )}

      <ProfileMenu isOpen={isProfileMenuOpen} onClose={() => setIsProfileMenuOpen(false)} />
    </div>
  );
}

// ── Historial panel content ───────────────────────────────────────────────────

interface HistorialContentProps {
  records: FoodRecord[];
  loading: boolean;
}

function calcAvgDailyCarbos(records: FoodRecord[]): number | null {
  if (records.length === 0) return null;
  const byDay: Record<string, number> = {};
  for (const r of records) {
    const carbs = r.nutritionalInfo?.carbohidratos ?? 0;
    byDay[r.date] = (byDay[r.date] ?? 0) + carbs;
  }
  const days = Object.values(byDay);
  if (days.length === 0) return null;
  return days.reduce((a, b) => a + b, 0) / days.length;
}

function formatFecha(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

const MEAL_COLORS: Record<string, string> = {
  'Desayuno': 'bg-orange-100 text-orange-700',
  'Colación matutina': 'bg-yellow-100 text-yellow-700',
  'Almuerzo': 'bg-green-100 text-green-700',
  'Colación vespertina': 'bg-lime-100 text-lime-700',
  'Cena': 'bg-indigo-100 text-indigo-700',
  'Colación nocturna': 'bg-purple-100 text-purple-700',
};

function HistorialContent({ records, loading }: HistorialContentProps) {
  const last15 = records.slice(0, 15);
  const avgCarbs = calcAvgDailyCarbos(records);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-[24px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#39588a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-[Poppins] font-normal text-[14px] text-gray-500">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-[24px]">
        <div className="text-center">
          <Utensils size={40} className="text-[#c5d5e4] mx-auto mb-3" />
          <p className="font-[Poppins] font-medium text-[15px] text-gray-400">Sin registros aún</p>
          <p className="font-[Poppins] font-normal text-[13px] text-gray-400 mt-1">Tu historial aparecerá aquí</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Avg carbs stat */}
      {avgCarbs !== null && (
        <div className="mx-[16px] mt-[14px] bg-gradient-to-r from-[#eef3ff] to-[#f0f9ff] rounded-[14px] p-[14px] border border-[#d0deff]">
          <p className="font-[Poppins] font-normal text-[11px] text-[#39588a] uppercase tracking-wide mb-[2px]">Promedio diario de carbohidratos</p>
          <div className="flex items-baseline gap-[4px]">
            <span className="font-[Poppins] font-bold text-[28px] text-[#193073] leading-none">{avgCarbs.toFixed(1)}</span>
            <span className="font-[Poppins] font-normal text-[13px] text-gray-500">g / día</span>
          </div>
          <p className="font-[Poppins] font-normal text-[11px] text-gray-400 mt-[2px]">
            Basado en {Object.keys(records.reduce((acc, r) => ({ ...acc, [r.date]: 1 }), {} as Record<string,number>)).length} día(s) registrado(s)
          </p>
        </div>
      )}

      {/* Records list */}
      <div className="p-[16px] space-y-[10px]">
        {last15.map((rec) => {
          const carbs = rec.nutritionalInfo?.carbohidratos;
          const cals = rec.nutritionalInfo?.calorias;
          const mealClass = MEAL_COLORS[rec.mealType] ?? 'bg-gray-100 text-gray-600';
          return (
            <div key={rec.id} className="bg-[#f5f8fc] rounded-[14px] p-[13px] border border-[#e1e9f2]">
              <div className="flex items-start justify-between gap-[8px] mb-[6px]">
                <p className="font-[Poppins] font-medium text-[14px] text-[#193073] leading-snug flex-1">{rec.foodName}</p>
                <span className="font-[Poppins] font-normal text-[11px] text-gray-400 whitespace-nowrap">{formatFecha(rec.date)}</span>
              </div>
              <div className="flex items-center gap-[6px] flex-wrap">
                {rec.mealType && (
                  <span className={`text-[11px] font-[Poppins] font-medium px-[8px] py-[2px] rounded-full ${mealClass}`}>
                    {rec.mealType}
                  </span>
                )}
                {carbs != null && (
                  <span className="text-[11px] font-[Poppins] font-medium px-[8px] py-[2px] rounded-full bg-blue-50 text-blue-700">
                    {carbs.toFixed(1)}g carbs
                  </span>
                )}
                {cals != null && (
                  <span className="text-[11px] font-[Poppins] font-normal text-gray-400">
                    {cals.toFixed(0)} kcal
                  </span>
                )}
              </div>
              <p className="font-[Poppins] font-normal text-[11px] text-gray-400 mt-[4px]">{rec.time} · {rec.quantity} {rec.unit}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
