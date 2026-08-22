import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFDocument, rgb } from 'pdf-lib';
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, ShadingType, BorderStyle,
} from 'docx';
import { applyPoppinsJsPDF, embedPoppinsPdfLib } from './pdfFonts';

export type ExportFormat = 'pdf' | 'pdf-editable' | 'csv' | 'word';

export interface HNForm {
  nombrePaciente: string; sexo: string; edad: string; ocupacion: string;
  nivelActividad: string; descripcionActividad: string;
  ejercicioTipo: string; ejercicioDuracion: string; ejercicioFrecuencia: string; ejercicioObservaciones: string;
  horarioAlimentos: string; numColaciones: string; lugarComidas: string; preparaAlimentos: string;
  habitosDietObservaciones: string;
  alcoholTabacoTipo: string; alcoholTabacoFrecuencia: string; alcoholTabacoCantidad: string; alcoholTabacoObservaciones: string;
  intolerancias: string; alergias: string;
  pesoActual: string; estatura: string; pesoTeorico: string; imc: string;
  glucosa: string; colesterolLDL: string; colesterolHDL: string; trigliceridos: string; hemoglobina: string;
  dxMedico: string; medicamentosUso: string; medicamentosNombre: string;
  ingestaAgua: string; complementosSuplementos: string; alergiaIntolerancia: string;
  [key: string]: string;
}

interface Patient { id: string; nombre: string; apellidos?: string; folio: string }

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

const DARK  = [25,  48, 115] as [number, number, number];
const MID   = [57,  88, 138] as [number, number, number];
const LIGHT = [241, 244, 249] as [number, number, number];

function buildSections(form: HNForm, imcVal: string) {
  return [
    { title: 'I. Datos personales',
      rows: [['Nombre del paciente', form.nombrePaciente], ['Sexo', form.sexo], ['Edad', form.edad], ['Ocupacion', form.ocupacion]] },
    { title: 'II. Nivel de actividad fisica',
      rows: [['Nivel seleccionado', form.nivelActividad || '—'], ['Descripcion de actividades', form.descripcionActividad || '—']] },
    { title: 'III. Ejercicio',
      rows: [['Tipo', form.ejercicioTipo], ['Duracion', form.ejercicioDuracion], ['Frecuencia', form.ejercicioFrecuencia], ['Observaciones', form.ejercicioObservaciones]] },
    { title: 'IV. Habitos dieteticos',
      rows: [
        ['Horarios establecidos', form.horarioAlimentos], ['Numero de colaciones', form.numColaciones],
        ['Lugar donde come', form.lugarComidas], ['Prepara los alimentos', form.preparaAlimentos],
        ['Observaciones', form.habitosDietObservaciones || '—'],
      ] },
    { title: 'V. Consumo de alcohol / tabaco',
      rows: [['Tipo', form.alcoholTabacoTipo], ['Frecuencia', form.alcoholTabacoFrecuencia], ['Cantidad', form.alcoholTabacoCantidad], ['Observaciones', form.alcoholTabacoObservaciones]] },
    { title: 'VI. Intolerancias y alergias',
      rows: [['Intolerancias', form.intolerancias || '—'], ['Alergias', form.alergias || '—']] },
    { title: 'OBJETIVO — Antropometricos',
      rows: [['Peso actual (kg)', form.pesoActual], ['Estatura (cm)', form.estatura], ['Peso teorico (kg)', form.pesoTeorico], ['IMC (kg/m2)', imcVal]] },
    { title: 'OBJETIVO — Bioquimicos',
      rows: [['Glucosa (mg/dL)', form.glucosa], ['Colesterol LDL (mg/dL)', form.colesterolLDL], ['Colesterol HDL (mg/dL)', form.colesterolHDL], ['Trigliceridos (mg/dL)', form.trigliceridos], ['Hemoglobina (g/dL)', form.hemoglobina]] },
    { title: 'OBJETIVO — Clinicos',
      rows: [['Diagnostico medico', form.dxMedico || '—'], ['Uso de medicamentos', form.medicamentosUso], ['Nombre del medicamento', form.medicamentosNombre || '—']] },
    { title: 'VII. Dieteticos',
      rows: [['Ingesta de agua (L/dia)', form.ingestaAgua], ['Complementos / suplementos', form.complementosSuplementos || '—'], ['Alergias o intolerancias', form.alergiaIntolerancia || '—']] },
  ];
}

// ─── 1. PDF ──────────────────────────────────────────────────────────────────
export async function exportHNPDF(form: HNForm, patient: Patient, imcVal: string): Promise<void> {
  const doc = new jsPDF({ compress: true });
  await applyPoppinsJsPDF(doc);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...DARK);
  doc.text('NutrIA', 14, 16);
  doc.setFontSize(13);
  doc.setTextColor(...MID);
  doc.text('Historia Nutrologica', 40, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`Paciente: ${form.nombrePaciente}   Folio: ${patient.folio}`, 14, 23);
  doc.setDrawColor(...MID);
  doc.line(14, 26, 196, 26);

  let startY = 30;
  for (const sec of buildSections(form, imcVal)) {
    const isObj = sec.title.startsWith('OBJETIVO');
    autoTable(doc, {
      head: [[{ content: sec.title, colSpan: 2 }]],
      body: sec.rows,
      startY,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, lineColor: [210, 220, 235], lineWidth: 0.3 },
      headStyles: { font: 'helvetica', fillColor: isObj ? DARK : MID, textColor: 255, fontStyle: 'bold', fontSize: 10, halign: 'left' },
      columnStyles: { 0: { cellWidth: 70, fontStyle: 'bold', fillColor: LIGHT, textColor: [50, 60, 80] }, 1: { cellWidth: 'auto' } },
    });
    startY = (doc as any).lastAutoTable.finalY + 5;
  }

  doc.save(`HN_${patient.folio}.pdf`);
}

// ─── 2. PDF editable ─────────────────────────────────────────────────────────
export async function exportHNEditablePDF(form: HNForm, patient: Patient, imcVal: string): Promise<void> {
  const pdfDoc  = await PDFDocument.create();
  const { regular: font, bold: boldFont } = await embedPoppinsPdfLib(pdfDoc);
  const pdfForm = pdfDoc.getForm();

  const W = 595, H = 842, M = 36;
  const CW = W - 2 * M;
  const LABEL_W = 185, FIELD_W = CW - LABEL_W - 6;
  const ROW_H = 26, SEC_H = 20;

  let page = pdfDoc.addPage([W, H]);
  let y = H - M, fIdx = 0;

  const checkPage = (need: number) => {
    if (y - need < M) { page = pdfDoc.addPage([W, H]); y = H - M; }
  };

  page.drawText('NutrIA — Historia Nutrologica', { x: M, y: y - 14, size: 14, font: boldFont, color: rgb(0.10, 0.19, 0.45) });
  y -= 20;
  page.drawText(`Paciente: ${form.nombrePaciente}   Folio: ${patient.folio}`, { x: M, y: y - 11, size: 8, font, color: rgb(0.3, 0.3, 0.3) });
  y -= 18;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.5, color: rgb(0.22, 0.35, 0.54) });
  y -= 8;

  const multiLabels = ['descripcion', 'habitos', 'diagnostico', 'nombre del medicamento', 'complementos', 'alergias o intolerancias'];

  for (const sec of buildSections(form, imcVal)) {
    const isObj = sec.title.startsWith('OBJETIVO');
    checkPage(SEC_H + 6);
    page.drawRectangle({ x: M, y: y - SEC_H, width: CW, height: SEC_H, color: isObj ? rgb(0.10, 0.19, 0.45) : rgb(0.22, 0.35, 0.54) });
    page.drawText(sec.title, { x: M + 6, y: y - 13, size: 9, font: boldFont, color: rgb(1, 1, 1) });
    y -= SEC_H + 4;

    for (const [label, value] of sec.rows) {
      const isMulti = multiLabels.some(k => label.toLowerCase().includes(k));
      const h = isMulti ? 52 : ROW_H;
      checkPage(h + 4);
      page.drawText(label, { x: M, y: y - 12, size: 7.5, font: boldFont, color: rgb(0.25, 0.35, 0.5) });
      const tf = pdfForm.createTextField(`hn_${fIdx++}`);
      tf.setText(String(value) || '');
      if (isMulti) tf.enableMultiline();
      tf.addToPage(page, { x: M + LABEL_W, y: y - h + 4, width: FIELD_W, height: h - 8 });
      page.drawRectangle({ x: M, y: y - h + 4, width: LABEL_W - 4, height: h - 8, color: rgb(0.95, 0.96, 0.98), borderColor: rgb(0.85, 0.87, 0.92), borderWidth: 0.3 });
      y -= h + 3;
    }
    y -= 4;
  }

  downloadBlob(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), `HN_editable_${patient.folio}.pdf`);
}

// ─── 3. CSV ──────────────────────────────────────────────────────────────────
export function exportHNCSV(form: HNForm, patient: Patient, imcVal: string): void {
  const esc = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows: string[][] = [['Seccion', 'Campo', 'Valor'], ['Info', 'Folio', patient.folio]];
  for (const sec of buildSections(form, imcVal)) {
    for (const [field, val] of sec.rows) rows.push([sec.title, field, String(val)]);
  }
  downloadBlob(new Blob(['﻿' + rows.map(r => r.map(esc).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }), `HN_${patient.folio}.csv`);
}

// ─── 4. Word ─────────────────────────────────────────────────────────────────
export async function exportHNWord(form: HNForm, patient: Patient, imcVal: string): Promise<void> {
  const BD = { style: BorderStyle.SINGLE, size: 1, color: 'D0D9E1' } as const;
  const borders = { top: BD, bottom: BD, left: BD, right: BD };

  const row = (label: string, value: string) => new TableRow({ children: [
    new TableCell({ borders, shading: { type: ShadingType.SOLID, fill: 'EEF2F8', color: 'auto' }, width: { size: 38, type: WidthType.PERCENTAGE },
      children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18, color: '39588A', font: 'helvetica' })] })] }),
    new TableCell({ borders, width: { size: 62, type: WidthType.PERCENTAGE },
      children: [new Paragraph({ children: [new TextRun({ text: value || '—', size: 18, font: 'helvetica' })] })] }),
  ]});

  const children = [
    new Paragraph({ children: [new TextRun({ text: 'HISTORIA NUTROLOGICA', bold: true, size: 36, color: '193073', font: 'helvetica' })], spacing: { after: 80 } }),
    new Paragraph({ children: [new TextRun({ text: `NutrIA  —  Paciente: ${form.nombrePaciente}  |  Folio: ${patient.folio}`, size: 18, color: '666666', font: 'helvetica' })], spacing: { after: 200 } }),
    ...buildSections(form, imcVal).flatMap(sec => [
      new Paragraph({ children: [new TextRun({ text: sec.title, bold: true, size: 24, color: '39588A', font: 'helvetica' })], spacing: { before: 280, after: 120 } }),
      new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: sec.rows.map(([l, v]) => row(l, String(v))) }),
    ]),
  ];

  downloadBlob(await Packer.toBlob(new Document({ sections: [{ children }] })), `HN_${patient.folio}.docx`);
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────
export async function exportHistoriaNutriologica(
  format: ExportFormat, form: HNForm, patient: Patient, imcVal: string,
): Promise<void> {
  switch (format) {
    case 'pdf':          return exportHNPDF(form, patient, imcVal);
    case 'pdf-editable': return exportHNEditablePDF(form, patient, imcVal);
    case 'csv':          return exportHNCSV(form, patient, imcVal);
    case 'word':         return exportHNWord(form, patient, imcVal);
  }
}
