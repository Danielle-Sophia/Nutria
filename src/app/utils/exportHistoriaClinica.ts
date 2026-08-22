import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFDocument, rgb } from 'pdf-lib';
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, ShadingType, BorderStyle,
} from 'docx';
import { applyPoppinsJsPDF, embedPoppinsPdfLib } from './pdfFonts';

export type ExportFormat = 'pdf' | 'pdf-editable' | 'csv' | 'word';

export interface HCForm {
  fechaElaboracion: string; horaElaboracion: string;
  nombreCompleto: string; edad: string; sexo: string; fechaNacimiento: string;
  ocupacion: string; grupoEtnico: string; domicilio: string; telefono: string;
  estadoCivil: string; tipoSangre: string; nivelEstudios: string;
  nombreTutor: string; parentescoTutor: string; telefonoTutor: string;
  antecedentesHeredoFamiliares: string; antecedentesPersonalesNoPatologicos: string;
  antecedentesPersonalesPatologicos: string;
  menarca: string; ritmoMenstrual: string; fur: string;
  gestas: string; partos: string; cesareas: string; abortos: string;
  metodoAnticonceptivo: string;
  motivoConsulta: string; padecimientoActual: string;
  pesoActual: string; pesoHabitual: string; talla: string; circunferenciaCintura: string;
  frecuenciaCardiaca: string; spo2: string; temperatura: string;
  frecuenciaRespiratoria: string; tensionArterial: string;
  glucosaAyuno: string; hba1c: string; colesterolTotal: string;
  hdl: string; ldl: string; trigliceridos: string; creatinina: string;
  otrosExamenes: string;
  [key: string]: string;
}

interface Patient { id: string; nombre: string; apellidos?: string; folio: string }

function calcIMC(form: HCForm): string {
  const p = parseFloat(form.pesoActual), t = parseFloat(form.talla) / 100;
  return p && t ? (p / (t * t)).toFixed(1) : '';
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

const DARK  = [25,  48, 115] as [number, number, number];
const MID   = [57,  88, 138] as [number, number, number];
const LIGHT = [241, 244, 249] as [number, number, number];

function buildSections(form: HCForm, isFemale: boolean) {
  const n = isFemale ? 1 : 0;
  return [
    {
      title: 'I. Ficha de identificacion',
      rows: [
        ['Nombre completo', form.nombreCompleto],
        ['Edad', form.edad], ['Sexo', form.sexo], ['Fecha de nacimiento', form.fechaNacimiento],
        ['Ocupacion', form.ocupacion], ['Grupo etnico', form.grupoEtnico],
        ['Domicilio', form.domicilio], ['Telefono', form.telefono],
        ['Estado civil', form.estadoCivil], ['Tipo de sangre', form.tipoSangre],
        ['Nivel de estudios', form.nivelEstudios],
        ['Nombre del tutor', form.nombreTutor],
        ['Parentesco', form.parentescoTutor], ['Telefono del tutor', form.telefonoTutor],
      ],
    },
    { title: 'II. Antecedentes heredo-familiares',
      rows: [['Antecedentes', form.antecedentesHeredoFamiliares || '—']] },
    { title: 'III. Antecedentes personales no patologicos',
      rows: [['Antecedentes', form.antecedentesPersonalesNoPatologicos || '—']] },
    { title: 'IV. Antecedentes personales patologicos',
      rows: [['Antecedentes', form.antecedentesPersonalesPatologicos || '—']] },
    ...(isFemale ? [{
      title: 'V. Antecedentes gineco-obstetricos',
      rows: [
        ['Menarca', form.menarca], ['Ritmo menstrual', form.ritmoMenstrual], ['FUR', form.fur],
        ['Gestas', form.gestas], ['Partos', form.partos],
        ['Cesareas', form.cesareas], ['Abortos', form.abortos],
        ['Metodo anticonceptivo', form.metodoAnticonceptivo],
      ],
    }] : []),
    { title: `${['V','VI'][n]}. Padecimiento actual`,
      rows: [['Motivo de consulta', form.motivoConsulta || '—'],
             ['Padecimiento actual', form.padecimientoActual || '—']] },
    { title: `${['VI','VII'][n]}. Antropometria y signos vitales`,
      rows: [
        ['Peso actual (kg)', form.pesoActual], ['Peso habitual (kg)', form.pesoHabitual],
        ['Talla (cm)', form.talla], ['IMC (kg/m2)', calcIMC(form)],
        ['Circunferencia de cintura (cm)', form.circunferenciaCintura],
        ['Frecuencia cardiaca (lpm)', form.frecuenciaCardiaca],
        ['SpO2 (%)', form.spo2], ['Temperatura (C)', form.temperatura],
        ['Frecuencia respiratoria (rpm)', form.frecuenciaRespiratoria],
        ['Tension arterial (mmHg)', form.tensionArterial],
      ] },
    { title: `${['VII','VIII'][n]}. Laboratorio`,
      rows: [
        ['Glucosa en ayuno (mg/dL)', form.glucosaAyuno], ['HbA1c (%)', form.hba1c],
        ['Colesterol total (mg/dL)', form.colesterolTotal],
        ['HDL (mg/dL)', form.hdl], ['LDL (mg/dL)', form.ldl],
        ['Trigliceridos (mg/dL)', form.trigliceridos],
        ['Creatinina (mg/dL)', form.creatinina],
        ['Otros examenes', form.otrosExamenes || '—'],
      ] },
  ];
}

// ─── 1. PDF ──────────────────────────────────────────────────────────────────
export async function exportHCPDF(form: HCForm, patient: Patient, isFemale: boolean): Promise<void> {
  const doc = new jsPDF({ compress: true });
  await applyPoppinsJsPDF(doc);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...DARK);
  doc.text('NutrIA', 14, 16);
  doc.setFontSize(13);
  doc.setTextColor(...MID);
  doc.text('Historia Clinica', 40, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`Paciente: ${form.nombreCompleto}   Folio: ${patient.folio}   Fecha: ${form.fechaElaboracion}`, 14, 23);
  doc.setDrawColor(...MID);
  doc.line(14, 26, 196, 26);

  const sections = buildSections(form, isFemale);
  let startY = 30;

  for (const sec of sections) {
    autoTable(doc, {
      head: [[{ content: sec.title, colSpan: 2 }]],
      body: sec.rows,
      startY,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, lineColor: [210, 220, 235], lineWidth: 0.3 },
      headStyles: { font: 'helvetica', fillColor: MID, textColor: 255, fontStyle: 'bold', fontSize: 10, halign: 'left' },
      columnStyles: {
        0: { cellWidth: 70, fontStyle: 'bold', fillColor: LIGHT, textColor: [50, 60, 80] },
        1: { cellWidth: 'auto' },
      },
    });
    startY = (doc as any).lastAutoTable.finalY + 5;
  }

  doc.save(`HC_${patient.folio}.pdf`);
}

// ─── 2. PDF editable ─────────────────────────────────────────────────────────
export async function exportHCEditablePDF(form: HCForm, patient: Patient, isFemale: boolean): Promise<void> {
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

  // Header
  page.drawText('NutrIA', { x: M, y: y - 14, size: 16, font: boldFont, color: rgb(0.10, 0.19, 0.45) });
  page.drawText('  —  Historia Clinica', { x: M + 56, y: y - 14, size: 12, font, color: rgb(0.22, 0.35, 0.54) });
  y -= 20;
  page.drawText(`Paciente: ${form.nombreCompleto}   Folio: ${patient.folio}`, { x: M, y: y - 11, size: 8, font, color: rgb(0.3, 0.3, 0.3) });
  y -= 18;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.5, color: rgb(0.22, 0.35, 0.54) });
  y -= 8;

  const drawSection = (title: string) => {
    checkPage(SEC_H + 6);
    page.drawRectangle({ x: M, y: y - SEC_H, width: CW, height: SEC_H, color: rgb(0.22, 0.35, 0.54) });
    page.drawText(title, { x: M + 6, y: y - 13, size: 9, font: boldFont, color: rgb(1, 1, 1) });
    y -= SEC_H + 4;
  };

  const multiLabels = ['antecedentes', 'padecimiento actual', 'motivo', 'otros'];
  const addRow = (label: string, value: string) => {
    const isMulti = multiLabels.some(k => label.toLowerCase().includes(k));
    const h = isMulti ? 52 : ROW_H;
    checkPage(h + 4);
    page.drawText(label, { x: M, y: y - 12, size: 7.5, font: boldFont, color: rgb(0.25, 0.35, 0.5) });
    const tf = pdfForm.createTextField(`hc_${fIdx++}`);
    tf.setText(value || '');
    if (isMulti) tf.enableMultiline();
    tf.addToPage(page, { x: M + LABEL_W, y: y - h + 4, width: FIELD_W, height: h - 8 });
    page.drawRectangle({ x: M, y: y - h + 4, width: LABEL_W - 4, height: h - 8, color: rgb(0.95, 0.96, 0.98), borderColor: rgb(0.85, 0.87, 0.92), borderWidth: 0.3 });
    y -= h + 3;
  };

  for (const sec of buildSections(form, isFemale)) {
    drawSection(sec.title);
    for (const [label, value] of sec.rows) addRow(label, String(value));
    y -= 4;
  }

  downloadBlob(new Blob([await pdfDoc.save()], { type: 'application/pdf' }), `HC_editable_${patient.folio}.pdf`);
}

// ─── 3. CSV ──────────────────────────────────────────────────────────────────
export function exportHCCSV(form: HCForm, patient: Patient, isFemale: boolean): void {
  const esc = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows: string[][] = [['Seccion', 'Campo', 'Valor']];
  rows.push(['Info', 'Folio', patient.folio], ['Info', 'Fecha', form.fechaElaboracion]);
  for (const sec of buildSections(form, isFemale)) {
    for (const [field, val] of sec.rows) rows.push([sec.title, field, String(val)]);
  }
  rows.push(['Calculado', 'IMC (kg/m2)', calcIMC(form)]);
  downloadBlob(new Blob(['﻿' + rows.map(r => r.map(esc).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }), `HC_${patient.folio}.csv`);
}

// ─── 4. Word ─────────────────────────────────────────────────────────────────
export async function exportHCWord(form: HCForm, patient: Patient, isFemale: boolean): Promise<void> {
  const BD = { style: BorderStyle.SINGLE, size: 1, color: 'D0D9E1' } as const;
  const borders = { top: BD, bottom: BD, left: BD, right: BD };

  const row = (label: string, value: string) => new TableRow({ children: [
    new TableCell({ borders, shading: { type: ShadingType.SOLID, fill: 'EEF2F8', color: 'auto' }, width: { size: 38, type: WidthType.PERCENTAGE },
      children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 18, color: '39588A', font: 'helvetica' })] })] }),
    new TableCell({ borders, width: { size: 62, type: WidthType.PERCENTAGE },
      children: [new Paragraph({ children: [new TextRun({ text: value || '—', size: 18, font: 'helvetica' })] })] }),
  ]});

  const children = [
    new Paragraph({ children: [new TextRun({ text: 'HISTORIA CLINICA', bold: true, size: 36, color: '193073', font: 'helvetica' })], spacing: { after: 80 } }),
    new Paragraph({ children: [new TextRun({ text: `NutrIA  —  Paciente: ${form.nombreCompleto}  |  Folio: ${patient.folio}`, size: 18, color: '666666', font: 'helvetica' })], spacing: { after: 40 } }),
    new Paragraph({ children: [new TextRun({ text: `Fecha: ${form.fechaElaboracion}  Hora: ${form.horaElaboracion}`, size: 18, color: '666666', font: 'helvetica' })], spacing: { after: 200 } }),
    ...buildSections(form, isFemale).flatMap(sec => [
      new Paragraph({ children: [new TextRun({ text: sec.title, bold: true, size: 24, color: '39588A', font: 'helvetica' })], spacing: { before: 280, after: 120 } }),
      new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: sec.rows.map(([l, v]) => row(l, String(v))) }),
    ]),
    new Paragraph({ children: [new TextRun({ text: `IMC calculado: ${calcIMC(form)} kg/m²`, size: 18, color: '666666', italics: true, font: 'helvetica' })], spacing: { before: 200 } }),
  ];

  downloadBlob(await Packer.toBlob(new Document({ sections: [{ children }] })), `HC_${patient.folio}.docx`);
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────
export async function exportHistoriaClinica(
  format: ExportFormat, form: HCForm, patient: Patient, isFemale: boolean,
): Promise<void> {
  switch (format) {
    case 'pdf':          return exportHCPDF(form, patient, isFemale);
    case 'pdf-editable': return exportHCEditablePDF(form, patient, isFemale);
    case 'csv':          return exportHCCSV(form, patient, isFemale);
    case 'word':         return exportHCWord(form, patient, isFemale);
  }
}
