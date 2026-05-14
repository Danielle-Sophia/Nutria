# 🗺️ Guía de Navegación - NutrIA

## 📍 Cómo acceder a las funciones de IA desde el módulo de médico

### Ruta completa:

```
Login (/) 
    ↓
Menú Principal Médico (/menu-profesional)
    ↓
[Click en "Px registrados" o "Expedientes"]
    ↓
Mis Pacientes (/mis-pacientes)
    ↓
[Click en cualquier fila de paciente]
    ↓
Expediente del Paciente (/expediente/1)
    ↓
[Menu lateral izquierdo - Click en "Historia clínica"]
    ↓
Historia Clínica con 3 pestañas:
    • Datos Generales
    • Diagnóstico ⭐ [BOTÓN: "Complementar diagnóstico con IA"]
    • Tratamiento ⭐ [BOTÓN: "Complementar tratamiento con IA"]
```

---

## 🎯 Acceso paso a paso

### **PASO 1: Login**
- Ir a la raíz `/`
- Ingresar credenciales
- Click en "Iniciar sesión"
- **Resultado:** Redirige a `/menu-profesional`

### **PASO 2: Menú Principal del Médico**
En `/menu-profesional` verás 4 tarjetas:
- ✅ **Px registrados** → Click aquí
- ✅ **Expedientes** → O click aquí (ambos llevan al mismo lugar)
- Tablas de evolución
- Configuración

### **PASO 3: Lista de Pacientes**
En `/mis-pacientes` verás:
- Barra de búsqueda
- Botón "Agregar paciente"
- **Lista de 7 pacientes** (tabla con nombre, edad, sexo, contacto)
- **Acción:** Haz click en CUALQUIER FILA de paciente

### **PASO 4: Expediente del Paciente**
En `/expediente/[id]` verás:
- **Menú lateral izquierdo** con 7 opciones:
  1. Identificación del paciente
  2. ✅ **Historia clínica** ← CLICK AQUÍ
  3. Bitácora
  4. Análisis y reportes
  5. Seguimiento
  6. Documentos
  7. Seguridad y registro de actividad

### **PASO 5: Historia Clínica con Pestañas**
Una vez en "Historia clínica", en la parte superior verás **3 PESTAÑAS:**

#### **Pestaña 1: Datos Generales** 📊
- Tabla con atributos clínicos del paciente
- Peso, talla, dosis de insulina, etc.
- Sin funciones de IA

#### **Pestaña 2: Diagnóstico** 🔍
**¡AQUÍ ESTÁ LA FUNCIÓN DE IA!**
- Botón azul en la esquina superior derecha:
  ```
  [✨ Complementar diagnóstico con IA]
  ```
- Al hacer click:
  1. Animación de carga (2.5 segundos)
  2. Análisis completo generado:
     - Diagnóstico principal
     - Hallazgos relevantes
     - Consideraciones adicionales
     - Recomendaciones de seguimiento

#### **Pestaña 3: Tratamiento** 💊
**¡AQUÍ ESTÁ LA SEGUNDA FUNCIÓN DE IA!**
- Botón verde en la esquina superior derecha:
  ```
  [✨ Complementar tratamiento con IA]
  ```
- Al hacer click:
  1. Animación de carga (2.5 segundos)
  2. Plan de tratamiento completo:
     - Esquema actual de insulina
     - Optimización de dosis
     - Plan nutricional
     - Actividad física
     - Tecnología de apoyo
     - Calendario de seguimiento

---

## 🎨 Características visuales de los botones de IA

### Botón de Diagnóstico (Azul):
- Color: Gradiente azul `from-[#5e7deb] to-[#8db9f2]`
- Ícono: ✨ Sparkles (gira durante carga)
- Hover: Se oscurece ligeramente
- Estado de carga: Gris con "Analizando con IA..."

### Botón de Tratamiento (Verde):
- Color: Gradiente verde `from-[#10b981] to-[#34d399]`
- Ícono: ✨ Sparkles (gira durante carga)
- Hover: Se oscurece ligeramente
- Estado de carga: Gris con "Generando plan..."

---

## 🔍 Solución de problemas

### "No veo las pestañas"
✓ Asegúrate de estar en "Historia clínica" (menú lateral izquierdo)
✓ Las pestañas están justo debajo de la información del paciente

### "No veo el botón de IA"
✓ Cambia a la pestaña "Diagnóstico" o "Tratamiento"
✓ El botón está en la esquina superior derecha de cada pestaña

### "El botón no hace nada"
✓ Espera 2.5 segundos, hay una animación de carga
✓ El resultado aparece debajo del botón

---

## 📱 Resumen rápido para pruebas

**Para probar las funciones de IA rápidamente:**

1. Ve a: `http://localhost:5173/`
2. Login (cualquier credencial)
3. Click en "Px registrados"
4. Click en el primer paciente "Patricio Castillo Antonio"
5. En el menú lateral, click en "Historia clínica"
6. Click en la pestaña "Diagnóstico"
7. Click en "Complementar diagnóstico con IA" (botón azul arriba a la derecha)
8. Espera 2.5 segundos
9. ¡Verás el análisis de IA!
10. Repite con la pestaña "Tratamiento" para ver el plan de tratamiento

---

## 🎯 URLs directas (para desarrollo)

- Login: `/`
- Menú Médico: `/menu-profesional`
- Mis Pacientes: `/mis-pacientes`
- Expediente Paciente 1: `/expediente/1`
- Expediente Paciente 2: `/expediente/2`
- Expediente Paciente 3: `/expediente/3`

**Nota:** Una vez en el expediente, selecciona "Historia clínica" en el menú lateral y luego las pestañas "Diagnóstico" o "Tratamiento" para ver las funciones de IA.
