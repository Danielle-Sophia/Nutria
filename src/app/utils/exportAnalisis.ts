import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { applyPoppinsJsPDF } from './pdfFonts';

interface Patient { nombre: string; apellidos: string; folio: string }

interface ChartData { displayName: string; value: number; time?: string }

interface FoodRecord {
  time: string; foodName: string; mealType: string; date: string;
  nutritionalInfo?: { carbohidratos?: number; calorias?: number };
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

function toTitleCase(str?: string) {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function formatDate(d: string) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

function glucoseCategory(v: number): string {
  if (v > 250) return 'Muy alta';
  if (v > 180) return 'Alta';
  if (v >= 70) return 'Rango objetivo';
  if (v >= 54) return 'Baja';
  return 'Muy baja';
}

const DARK  = [25,  48, 115] as [number, number, number];
const MID   = [57,  88, 138] as [number, number, number];
const LIGHT = [241, 244, 249] as [number, number, number];

async function captureElement(el: HTMLElement): Promise<string | null> {
  try {
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false });
    return canvas.toDataURL('image/png');
  } catch { return null; }
}

// ─── PDF ─────────────────────────────────────────────────────────────────────
export async function exportAnalisisPDF(
  glucoseRef: React.RefObject<HTMLDivElement>,
  foodRef:    React.RefObject<HTMLDivElement>,
  patient:    Patient,
  glucoseData: ChartData[],
  average:    number,
  foodRecords: FoodRecord[],
  selectedDate: string,
): Promise<void> {
  const doc  = new jsPDF({ compress: true, unit: 'mm', format: 'a4' });
  await applyPoppinsJsPDF(doc);
  const pageW = 210, M = 14, CW = pageW - 2 * M;
  const fullName = `${toTitleCase(patient.nombre)} ${toTitleCase(patient.apellidos)}`;

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(...DARK);
  doc.text('NutrIA', M, 16);
  doc.setFontSize(13); doc.setTextColor(...MID);
  doc.text('Analisis y Reportes', 40, 16);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(60, 60, 60);
  doc.text(`Paciente: ${fullName}   Folio: ${patient.folio}`, M, 23);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, M, 28);
  doc.setDrawColor(...MID); doc.line(M, 31, pageW - M, 31);
  let y = 35;

  // ── Glucose ───────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...MID);
  doc.text('GLUCOSA — Ultimos registros', M, y + 6); y += 10;

  if (average > 0) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(60, 60, 60);
    doc.text(`Promedio: ${average} mg/dL`, M, y + 4); y += 8;
  }

  if (glucoseRef.current) {
    const img = await captureElement(glucoseRef.current);
    if (img) {
      const iW = CW, iH = iW * 0.55;
      if (y + iH > 280) { doc.addPage(); y = 15; }
      doc.addImage(img, 'PNG', M, y, iW, iH); y += iH + 6;
    }
  }

  if (glucoseData.length > 0) {
    autoTable(doc, {
      head: [[{ content: 'Registros de glucosa', colSpan: 4 }]],
      body: glucoseData.map(d => [d.displayName, d.time ?? '—', `${d.value} mg/dL`, glucoseCategory(d.value)]),
      startY: y, theme: 'grid',
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 2.5, lineColor: [210, 220, 235], lineWidth: 0.3 },
      headStyles: { font: 'helvetica', fillColor: MID, textColor: 255, fontStyle: 'bold', halign: 'left' },
      columnStyles: { 0: { cellWidth: 25, fontStyle: 'bold', fillColor: LIGHT }, 1: { cellWidth: 22 }, 2: { cellWidth: 32 }, 3: { cellWidth: 'auto' } },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  } else {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(150, 150, 150);
    doc.text('Sin registros de glucosa disponibles.', M, y + 5); y += 12;
  }

  autoTable(doc, {
    head: [[{ content: 'Referencia de rangos de glucosa', colSpan: 2 }]],
    body: [['Muy alta','>250 mg/dL'],['Alta','181-249 mg/dL'],['Rango objetivo','70-180 mg/dL'],['Baja','54-69 mg/dL'],['Muy baja','<54 mg/dL']],
    startY: y, theme: 'grid',
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 2.5 },
    headStyles: { font: 'helvetica', fillColor: [0, 100, 60], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { fontStyle: 'bold', fillColor: LIGHT } },
    bodyStyles: { lineColor: [200, 215, 200], lineWidth: 0.3 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Food ──────────────────────────────────────────────────────────────────
  if (y > 250) { doc.addPage(); y = 15; }
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...MID);
  doc.text('ALIMENTOS', M, y + 6); y += 12;

  if (foodRef.current) {
    const img = await captureElement(foodRef.current);
    if (img) {
      const iW = CW, iH = iW * 0.4;
      if (y + iH > 280) { doc.addPage(); y = 15; }
      doc.addImage(img, 'PNG', M, y, iW, iH); y += iH + 6;
    }
  }

  const dates = [...new Set(foodRecords.map(r => r.date))].sort().reverse().slice(0, 7);
  for (const date of dates) {
    const recs = foodRecords.filter(r => r.date === date);
    const tC   = recs.reduce((s, r) => s + (r.nutritionalInfo?.carbohidratos ?? 0), 0);
    const tCal = recs.reduce((s, r) => s + (r.nutritionalInfo?.calorias ?? 0), 0);
    autoTable(doc, {
      head: [[{ content: `Alimentos — ${formatDate(date)}`, colSpan: 4 }]],
      body: [
        ...recs.map(r => [r.time, r.foodName, r.mealType, `${(r.nutritionalInfo?.carbohidratos ?? 0).toFixed(1)}g / ${(r.nutritionalInfo?.calorias ?? 0).toFixed(0)} kcal`]),
        [{ content: 'TOTAL', colSpan: 3, styles: { fontStyle: 'bold', fillColor: LIGHT } }, { content: `${tC.toFixed(1)}g / ${tCal.toFixed(0)} kcal`, styles: { fontStyle: 'bold' } }],
      ],
      startY: y, theme: 'grid',
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 2.5, lineColor: [210, 220, 235], lineWidth: 0.3 },
      headStyles: { font: 'helvetica', fillColor: [180, 120, 20], textColor: 255, fontStyle: 'bold', halign: 'left' },
      columnStyles: { 0: { cellWidth: 20, fillColor: LIGHT }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 30 }, 3: { cellWidth: 45 } },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
    if (y > 260 && date !== dates[dates.length - 1]) { doc.addPage(); y = 15; }
  }

  if (foodRecords.length === 0) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(150, 150, 150);
    doc.text('Sin registros de alimentos disponibles.', M, y + 5);
  }

  // Footer
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(180, 180, 180);
    doc.text(`NutrIA — ${fullName} — Folio ${patient.folio}`, M, 293);
    doc.text(`Pagina ${i} / ${total}`, pageW - M - 20, 293);
  }

  doc.save(`Analisis_${patient.folio}.pdf`);
}

// ─── CSV ─────────────────────────────────────────────────────────────────────
export function exportAnalisisCSV(
  patient:     Patient,
  glucoseData: ChartData[],
  average:     number,
  foodRecords: FoodRecord[],
): void {
  const esc = (v: string | number) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows: (string | number)[][] = [];

  // Header
  rows.push(['# NutrIA — Analisis y Reportes']);
  rows.push([`# Paciente: ${toTitleCase(patient.nombre)} ${toTitleCase(patient.apellidos)}  |  Folio: ${patient.folio}`]);
  rows.push([`# Generado: ${new Date().toLocaleDateString('es-MX')}`]);
  rows.push([]);

  // Glucose
  rows.push(['=== GLUCOSA ===']);
  rows.push(['Fecha', 'Hora', 'Glucosa (mg/dL)', 'Categoria']);
  for (const d of glucoseData) {
    rows.push([d.displayName, d.time ?? '—', d.value, glucoseCategory(d.value)]);
  }
  if (average > 0) rows.push(['Promedio', '', average, '']);
  rows.push([]);

  // Food
  rows.push(['=== ALIMENTOS ===']);
  rows.push(['Fecha', 'Hora', 'Alimento', 'Tipo de comida', 'Carbohidratos (g)', 'Calorias (kcal)']);
  const sorted = [...foodRecords].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  for (const r of sorted) {
    rows.push([
      formatDate(r.date), r.time, r.foodName, r.mealType,
      (r.nutritionalInfo?.carbohidratos ?? 0).toFixed(1),
      (r.nutritionalInfo?.calorias ?? 0).toFixed(0),
    ]);
  }

  // Daily totals
  const dates = [...new Set(foodRecords.map(r => r.date))].sort();
  if (dates.length > 0) {
    rows.push([]);
    rows.push(['=== TOTALES POR DIA ===']);
    rows.push(['Fecha', 'Carbohidratos totales (g)', 'Calorias totales (kcal)', 'N. registros']);
    for (const date of dates) {
      const recs = foodRecords.filter(r => r.date === date);
      const tC   = recs.reduce((s, r) => s + (r.nutritionalInfo?.carbohidratos ?? 0), 0);
      const tCal = recs.reduce((s, r) => s + (r.nutritionalInfo?.calorias ?? 0), 0);
      rows.push([formatDate(date), tC.toFixed(1), tCal.toFixed(0), recs.length]);
    }
  }

  const csv = rows.map(r => r.map(c => esc(c as any)).join(',')).join('\r\n');
  downloadBlob(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }), `Analisis_${patient.folio}.csv`);
}
