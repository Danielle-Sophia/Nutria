import jsPDF from 'jspdf';
import type { PDFDocument } from 'pdf-lib';

const REG_URL  = '/fonts/Poppins-Regular.ttf';
const BOLD_URL = '/fonts/Poppins-Bold.ttf';

/** Set the active font on a jsPDF document to helvetica (built-in, always available). */
export async function applyPoppinsJsPDF(doc: jsPDF): Promise<void> {
  doc.setFont('helvetica', 'normal');
}

/** Embed Poppins into a pdf-lib document and return { regular, bold }. */
export async function embedPoppinsPdfLib(pdfDoc: PDFDocument): Promise<{ regular: import('pdf-lib').PDFFont; bold: import('pdf-lib').PDFFont }> {
  const [regBuf, boldBuf] = await Promise.all([
    fetch(REG_URL).then(r => r.arrayBuffer()),
    fetch(BOLD_URL).then(r => r.arrayBuffer()),
  ]);
  const regular = await pdfDoc.embedFont(regBuf);
  const bold    = await pdfDoc.embedFont(boldBuf);
  return { regular, bold };
}
