const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../src/imports/SMAE_5ta_Edicion_EXCEL_CALCULOS-1-1.csv');
const outputPath = path.join(__dirname, '../src/app/data/foodsDatabase.ts');

// Function to fix corrupted Spanish characters
function fixEncoding(text) {
  if (!text) return text;

  let fixed = text;

  // Replace corrupted vowels with accents
  fixed = fixed.replace(/Ã¡/g, 'á');
  fixed = fixed.replace(/Ã©/g, 'é');
  fixed = fixed.replace(/Ã­/g, 'í');
  fixed = fixed.replace(/Ã³/g, 'ó');
  fixed = fixed.replace(/Ãº/g, 'ú');

  // Replace corrupted capital vowels
  fixed = fixed.replace(/Ã/g, 'Á');
  fixed = fixed.replace(/Ã‰/g, 'É');
  fixed = fixed.replace(/Ã/g, 'Í');
  fixed = fixed.replace(/Ã"/g, 'Ó');
  fixed = fixed.replace(/Ãš/g, 'Ú');

  // Replace ñ and Ñ
  fixed = fixed.replace(/Ã±/g, 'ñ');
  fixed = fixed.replace(/Ã'/g, 'Ñ');

  // Replace ü
  fixed = fixed.replace(/Ã¼/g, 'ü');
  fixed = fixed.replace(/Ãœ/g, 'Ü');

  // Manual corrections for known words BEFORE removing replacement characters
  fixed = fixed.replace(/alcoh\ufffdlicas/g, 'alcohólicas');
  fixed = fixed.replace(/Alcoh\ufffdlicas/g, 'Alcohólicas');

  // Remove remaining replacement characters
  fixed = fixed.replace(/ï¿½/g, '');
  fixed = fixed.replace(/\ufffd/g, '');

  // Manual corrections for known words with missing accented characters
  fixed = fixed.replace(/\bArgula\b/g, 'Arúgula');
  fixed = fixed.replace(/\bpia\b/gi, 'piña');
  fixed = fixed.replace(/\bPia\b/g, 'Piña');
  fixed = fixed.replace(/\bpltano\b/gi, 'plátano');
  fixed = fixed.replace(/\bPltano\b/g, 'Plátano');
  fixed = fixed.replace(/\bpastelera\b/g, 'pastelería');
  fixed = fixed.replace(/\bcaloras\b/g, 'calorías');
  fixed = fixed.replace(/\bAzcar\b/g, 'Azúcar');
  fixed = fixed.replace(/\bazcar\b/g, 'azúcar');
  fixed = fixed.replace(/\blctea\b/g, 'láctea');
  fixed = fixed.replace(/\blcteo\b/g, 'lácteo');
  fixed = fixed.replace(/\bans\b/g, 'anís');
  fixed = fixed.replace(/\bAns\b/g, 'Anís');
  fixed = fixed.replace(/\bcaf\b/g, 'café');
  fixed = fixed.replace(/\bCaf\b/g, 'Café');
  fixed = fixed.replace(/\bma\b/g, 'maíz');
  fixed = fixed.replace(/\bMa\b/g, 'Maíz');

  return fixed;
}

// Read CSV file with latin1 encoding (as it appears to be encoded)
const csvContent = fs.readFileSync(csvPath, 'latin1');
const lines = csvContent.split('\n');

// Skip header rows (first 2 lines)
const dataLines = lines.slice(2);

const foods = [];

dataLines.forEach((line, index) => {
  if (!line.trim()) return;

  const columns = line.split(',');

  if (columns.length < 28) return;

  const food = {
    grupo: fixEncoding(columns[0]?.trim() || ''),
    alimento: fixEncoding(columns[1]?.trim() || ''),
    cantidad: fixEncoding(columns[3]?.trim() || ''),
    unidad: fixEncoding(columns[4]?.trim() || ''),
    calorias: parseFloat(columns[7]) || 0,
    proteina: parseFloat(columns[8]) || 0,
    lipidos: parseFloat(columns[9]) || 0,
    carbohidratos: parseFloat(columns[10]) || 0,
    fibra: parseFloat(columns[16]) || 0,
    ig: fixEncoding(columns[26]?.trim() || 'ND'),
    cargaGlucemica: fixEncoding(columns[27]?.trim() || 'ND'),
  };

  // Only add if has valid data
  if (food.alimento && food.grupo) {
    foods.push(food);
  }
});

// Generate TypeScript file
const tsContent = `// Auto-generated from SMAE CSV data
// Total alimentos: ${foods.length}

export interface FoodData {
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

export const foodsDatabase: FoodData[] = ${JSON.stringify(foods, null, 2)};

export const foodGroups = [
  ...new Set(foodsDatabase.map(food => food.grupo))
].filter(Boolean).sort();
`;

// Ensure directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write output file
fs.writeFileSync(outputPath, tsContent, 'utf8');

console.log(`✅ Parsed ${foods.length} foods from CSV`);
console.log(`✅ Generated: ${outputPath}`);
