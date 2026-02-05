// BlueHand Canvas - PDF Invoice Generator
// Generates professional PDF invoices using jsPDF
// VAT Rate: 21% (Romanian standard rate)

import { jsPDF } from 'npm:jspdf';

const VAT_RATE = 0.21;
const COMPANY_NAME = "TINYPODS S.R.L.";
const COMPANY_CUI = "50508421";
const COMPANY_REG_COM = "J2024019956002";
const COMPANY_ADDRESS = "jud. Ilfov, Localitate: Pantelimon, Oras. PANTELIMON, STR. BUSTENI, NR.1, AP.6";
const COMPANY_IBAN = "RO21BTRLRONCRT0CU1300801";

interface PDFInvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientAddress?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerCity?: string;
  customerCounty?: string;
  customerPostalCode?: string;
  billingCUI?: string;
  billingRegCom?: string;
  items: any[];
  totalWithoutVAT: number;
  vatAmount: number;
  totalAmount: number;
  deliveryAmount?: number;
}

/**
 * Generate PDF invoice buffer
 */
export async function generatePDFInvoice(data: PDFInvoiceData): Promise<Uint8Array> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set font
    doc.setFont('helvetica');
    
    let y = 20;
    
    // Header - Company Name
    doc.setFontSize(22);
    doc.setTextColor(123, 147, 255); // #7B93FF
    doc.text('BlueHand Canvas', 20, y);
    
    // Invoice Title
    y += 15;
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.text('FACTURA', 20, y);
    
    y += 10;
    doc.setFontSize(18);
    doc.setTextColor(123, 147, 255);
    doc.text(data.invoiceNumber, 20, y);
    
    // Dates (right aligned)
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Data emitere: ${data.issueDate}`, 190, 20, { align: 'right' });
    doc.text(`Data scadenta: ${data.dueDate}`, 190, 26, { align: 'right' });
    
    // Supplier Info
    y = 50;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Furnizor', 20, y);
    
    y += 7;
    doc.setFontSize(10);
    doc.text(COMPANY_NAME, 20, y);
    
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(`CUI: ${COMPANY_CUI}`, 20, y);
    
    y += 5;
    doc.text(`Reg. Com.: ${COMPANY_REG_COM}`, 20, y);
    
    y += 5;
    doc.text(`Tara: ROMANIA`, 20, y);
    
    y += 5;
    const addressLines = doc.splitTextToSize(COMPANY_ADDRESS, 80);
    doc.text(addressLines, 20, y);
    y += addressLines.length * 5;
    
    y += 5;
    doc.text(`IBAN: ${COMPANY_IBAN}`, 20, y);
    
    // Client Info (right side)
    let yClient = 50;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Client', 110, yClient);
    
    yClient += 7;
    doc.setFontSize(10);
    doc.text(data.clientName.toUpperCase(), 110, yClient);
    
    yClient += 5;
    doc.setFont('helvetica', 'normal');
    
    if (data.billingCUI) {
      doc.text(`CUI: ${data.billingCUI}`, 110, yClient);
      yClient += 5;
    }
    
    if (data.billingRegCom) {
      doc.text(`Reg. Com.: ${data.billingRegCom}`, 110, yClient);
      yClient += 5;
    }
    
    if (data.customerEmail) {
      doc.text(`Email: ${data.customerEmail}`, 110, yClient);
      yClient += 5;
    }
    
    if (data.customerPhone) {
      doc.text(`Telefon: ${data.customerPhone}`, 110, yClient);
      yClient += 5;
    }
    
    if (data.clientAddress) {
      const clientAddressLines = doc.splitTextToSize(data.clientAddress, 80);
      doc.text(clientAddressLines, 110, yClient);
      yClient += clientAddressLines.length * 5;
    }
    
    if (data.customerCity || data.customerCounty || data.customerPostalCode) {
      const location = [data.customerCity, data.customerCounty, data.customerPostalCode]
        .filter(Boolean)
        .join(', ');
      doc.text(location, 110, yClient);
      yClient += 5;
    }
    
    doc.text('ROMANIA', 110, yClient);
    
    // Items Table
    y = Math.max(y, yClient) + 15;
    
    // Table header
    doc.setFillColor(245, 245, 245);
    doc.rect(20, y - 5, 170, 8, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('#', 22, y);
    doc.text('Articol', 30, y);
    doc.text('U.M.', 100, y);
    doc.text('Cant.', 115, y);
    doc.text('Pret', 130, y);
    doc.text('Valoare', 145, y);
    doc.text('TVA', 165, y);
    doc.text('TOTAL', 180, y);
    
    y += 8;
    
    // Table rows
    doc.setFont('helvetica', 'normal');
    let itemNumber = 1;
    
    for (const item of data.items) {
      const itemTotal = parseFloat(String(item.price || 0));
      const itemWithoutVAT = itemTotal / (1 + VAT_RATE);
      const itemVAT = itemTotal - itemWithoutVAT;
      const quantity = item.quantity || 1;
      const unitPrice = itemWithoutVAT / quantity;
      
      const paintingName = item.paintingTitle || item.title || 'Tablou Personalizat';
      const sizeInfo = item.size || 'N/A';
      const orientationInfo = item.orientation 
        ? `, ${item.orientation === 'portrait' ? 'Portrait' : 'Landscape'}` 
        : '';
      const articleDesc = `${paintingName} - ${sizeInfo}${orientationInfo}`;
      
      // Check if we need a new page
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(String(itemNumber), 22, y);
      const articleLines = doc.splitTextToSize(articleDesc, 65);
      doc.text(articleLines, 30, y);
      doc.text('BUC', 100, y);
      doc.text(String(quantity), 115, y);
      doc.text(unitPrice.toFixed(2), 130, y);
      doc.text(itemWithoutVAT.toFixed(2), 145, y);
      doc.text(`${itemVAT.toFixed(2)}`, 165, y);
      doc.setFont('helvetica', 'bold');
      doc.text(itemTotal.toFixed(2), 180, y);
      doc.setFont('helvetica', 'normal');
      
      y += Math.max(5, articleLines.length * 5);
      itemNumber++;
    }
    
    // Add delivery if exists
    if (data.deliveryAmount && data.deliveryAmount > 0) {
      const deliveryWithoutVAT = data.deliveryAmount / (1 + VAT_RATE);
      const deliveryVATAmount = data.deliveryAmount - deliveryWithoutVAT;
      
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(String(itemNumber), 22, y);
      doc.text('Transport si Livrare', 30, y);
      doc.text('BUC', 100, y);
      doc.text('1', 115, y);
      doc.text(deliveryWithoutVAT.toFixed(2), 130, y);
      doc.text(deliveryWithoutVAT.toFixed(2), 145, y);
      doc.text(`${deliveryVATAmount.toFixed(2)}`, 165, y);
      doc.setFont('helvetica', 'bold');
      doc.text(data.deliveryAmount.toFixed(2), 180, y);
      doc.setFont('helvetica', 'normal');
      
      y += 8;
    }
    
    // Totals
    y += 10;
    doc.setFontSize(10);
    doc.text(`Total fara TVA: ${data.totalWithoutVAT.toFixed(2)} RON`, 190, y, { align: 'right' });
    
    y += 6;
    doc.text(`TVA 21%: ${data.vatAmount.toFixed(2)} RON`, 190, y, { align: 'right' });
    
    y += 8;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(123, 147, 255);
    doc.rect(120, y - 5, 70, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(`Total: ${data.totalAmount.toFixed(2)} Lei`, 190, y, { align: 'right' });
    
    // Payment Instructions
    y += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Instructiuni de plata:', 20, y);
    
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`IBAN: ${COMPANY_IBAN}`, 20, y);
    
    y += 6;
    doc.text(`Beneficiar: ${COMPANY_NAME}`, 20, y);
    
    // Footer
    y += 15;
    doc.setFontSize(8);
    doc.setTextColor(102, 102, 102);
    const footerText = 'Factura circula fara semnatura si stampila cf. art.V, alin (2) din Ordonanta nr.17/2015 si art. 319 alin (29) din Legea nr. 227/2015 privind Codul fiscal.';
    const footerLines = doc.splitTextToSize(footerText, 170);
    doc.text(footerLines, 20, y);
    
    // Get PDF as ArrayBuffer and convert to Uint8Array
    const pdfArrayBuffer = doc.output('arraybuffer');
    return new Uint8Array(pdfArrayBuffer);
    
  } catch (error) {
    console.error('❌ Error in generatePDFInvoice:', error);
    throw error;
  }
}
