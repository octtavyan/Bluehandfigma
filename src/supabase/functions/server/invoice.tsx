// BlueHand Canvas - Invoice Generation Module
// Clean implementation with HTML invoice generation and PDF generation
// VAT Rate: 21% (Romanian standard rate)
// Last updated: 2026-01-31

import * as kv from "./kv_store.tsx";
import { createClient } from 'npm:@supabase/supabase-js@2';
import { generatePDFInvoice } from './pdf-generator.tsx';

// Types
interface InvoiceItem {
  paintingTitle?: string;
  title?: string;
  size?: string;
  orientation?: 'portrait' | 'landscape';
  quantity?: number;
  price?: number | string;
  total?: number | string;
  frameType?: string;
  printType?: string;
}

interface InvoiceData {
  orderNumber: string;
  orderDate?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerCounty?: string;
  customerPostalCode?: string;
  items: InvoiceItem[];
  total: number | string;
  deliveryPrice?: number | string;
  // Optional billing fields (for juridica)
  billingName?: string;
  billingCUI?: string;
  billingRegCom?: string;
  billingAddress?: string;
  // Optional FGO invoice fields (if FGO invoice was already generated)
  fgoInvoiceNumber?: string; // e.g., "0003"
  fgoInvoiceSerie?: string; // e.g., "TIN"
}

interface GeneratedInvoice {
  success: boolean;
  invoiceNumber?: string;
  publicUrl?: string;
  cloudinaryUrl?: string; // For backward compatibility
  html?: string;
  pdf?: Uint8Array; // PDF buffer for email attachment
  error?: string;
}

// Constants
const VAT_RATE = 0.21; // 21% VAT for Romania
const COMPANY_NAME = "TINYPODS S.R.L.";
const COMPANY_CUI = "50508421";
const COMPANY_REG_COM = "J2024019956002";
const COMPANY_ADDRESS = "jud. Ilfov, Localitate: Pantelimon, Oras. PANTELIMON, STR. BUSTENI, NR.1, AP.6";
const COMPANY_IBAN = "RO21BTRLRONCRT0CU1300801";
const LOGO_URL = "https://res.cloudinary.com/driv1havv/image/upload/v1769787364/BLUEHAND_logo_kcoulo.png";

/**
 * Generate HTML invoice for an order
 */
export async function generateInvoice(data: InvoiceData, isEmailMode = false): Promise<GeneratedInvoice> {
  try {
    const {
      orderNumber,
      orderDate,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCity,
      customerCounty,
      customerPostalCode,
      items,
      total,
      deliveryPrice,
      billingName,
      billingCUI,
      billingRegCom,
      billingAddress,
      fgoInvoiceNumber,
      fgoInvoiceSerie
    } = data;

    // Validate required fields
    if (!orderNumber || !customerName || !items || items.length === 0) {
      console.error('❌ Invoice generation failed: Missing required fields');
      return {
        success: false,
        error: 'Missing required invoice data: orderNumber, customerName, and items are required'
      };
    }



    // Log item details for debugging
    items.forEach((item: InvoiceItem, index: number) => {
      console.log(`📦 Item ${index + 1}: price=${item.price}, total=${item.total}, size=${item.size}, name=${item.paintingTitle || item.title}`);
    });

    // Fetch sizes from CMS for accurate pricing
    const sizesData = await kv.getByPrefix('size:') || [];
    const sizesMap = new Map(sizesData.map((s: any) => [s.name, s.price]));

    // Enrich items with prices from sizes table
    const enrichedItems = items.map((item: InvoiceItem, index: number) => {
      const itemSize = item.size || '';
      let finalPrice = parseFloat(String(item.price || item.total || 0));

      console.log(`🔍 Item ${index + 1}: size="${itemSize}", storedPrice=${finalPrice}`);

      // If price is missing or 0, look it up from sizes table
      if (!finalPrice || finalPrice === 0) {
        const sizePrice = sizesMap.get(itemSize);
        if (sizePrice) {
          console.log(`   ✅ Using CMS price: ${sizePrice} RON`);
          finalPrice = sizePrice;
        } else {
          console.log(`   ⚠️ Size "${itemSize}" not found in CMS`);
        }
      } else {
        console.log(`   ✓ Using stored price: ${finalPrice} RON`);
      }

      return {
        ...item,
        price: finalPrice
      };
    });

    console.log('📋 Items after price enrichment completed');

    // Use billing info if available, otherwise use customer info
    const clientName = billingName || customerName;
    const clientAddress = billingAddress || customerAddress;

    // Calculate VAT (21%) - reverse calculation
    // If total = 100 RON, then: base = 100/1.21 = 82.64, VAT = 17.36
    const totalAmount = parseFloat(String(total));
    const totalWithoutVAT = totalAmount / (1 + VAT_RATE);
    const vatAmount = totalAmount - totalWithoutVAT;

    // Calculate delivery VAT
    const deliveryAmount = parseFloat(String(deliveryPrice || 0));
    const deliveryWithoutVAT = deliveryAmount / (1 + VAT_RATE);
    const deliveryVATAmount = deliveryAmount - deliveryWithoutVAT;

    // Generate invoice number
    // If FGO invoice exists, use the FGO serie-number format (e.g., "TIN 0003")
    // Otherwise, generate internal format (e.g., "TINY 20260201-CARD-0001")
    let invoiceNumber: string;
    if (fgoInvoiceSerie && fgoInvoiceNumber) {
      invoiceNumber = `${fgoInvoiceSerie} ${fgoInvoiceNumber}`;
      console.log(`✅ Using FGO invoice number: ${invoiceNumber}`);
    } else {
      invoiceNumber = `TINY ${orderNumber.replace('#', '').replace('BHC-', '')}`;
      console.log(`✅ Using internal invoice number: ${invoiceNumber}`);
    }

    // Format dates
    const issueDate = orderDate 
      ? new Date(orderDate).toLocaleDateString('ro-RO') 
      : new Date().toLocaleDateString('ro-RO');
    const dueDate = new Date(
      new Date(orderDate || new Date()).getTime() + 30 * 24 * 60 * 60 * 1000
    ).toLocaleDateString('ro-RO');

    // Build items table HTML
    const itemsTableHTML = buildItemsTableHTML(enrichedItems, deliveryAmount, deliveryWithoutVAT, deliveryVATAmount);

    // Generate complete HTML invoice
    const invoiceHTML = buildInvoiceHTML({
      invoiceNumber,
      issueDate,
      dueDate,
      clientName,
      clientAddress,
      customerEmail,
      customerPhone,
      customerCity,
      customerCounty,
      customerPostalCode,
      billingCUI,
      billingRegCom,
      itemsTableHTML,
      totalWithoutVAT,
      vatAmount,
      totalAmount,
      isEmailMode
    });

    console.log('✅ Invoice HTML generated successfully');

    // Generate PDF invoice
    const pdfBuffer = await generatePDFInvoice({
      invoiceNumber,
      issueDate,
      dueDate,
      clientName,
      clientAddress,
      customerEmail,
      customerPhone,
      customerCity,
      customerCounty,
      customerPostalCode,
      billingCUI,
      billingRegCom,
      items: enrichedItems,
      totalWithoutVAT,
      vatAmount,
      totalAmount,
      deliveryAmount
    });

    return {
      success: true,
      invoiceNumber,
      publicUrl: null,
      // For backward compatibility with existing code
      cloudinaryUrl: null,
      html: invoiceHTML,
      pdf: pdfBuffer
    };

  } catch (error) {
    console.error('❌ Error generating invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate invoice'
    };
  }
}

/**
 * Build HTML table rows for invoice items
 */
function buildItemsTableHTML(
  items: InvoiceItem[],
  deliveryAmount: number,
  deliveryWithoutVAT: number,
  deliveryVATAmount: number
): string {
  let itemsHTML = '';
  let itemNumber = 1;

  // Add canvas items
  for (const item of items) {
    const itemTotal = parseFloat(String(item.price || 0));
    const itemWithoutVAT = itemTotal / (1 + VAT_RATE);
    const itemVAT = itemTotal - itemWithoutVAT;
    const quantity = item.quantity || 1;
    const unitPrice = itemWithoutVAT / quantity;

    // Build article description with painting details
    const paintingName = item.paintingTitle || item.title || 'Tablou Personalizat';
    const sizeInfo = item.size || 'N/A';
    const orientationInfo = item.orientation 
      ? `, ${item.orientation === 'portrait' ? 'Portrait' : 'Landscape'}` 
      : '';
    
    const articleDesc = `${paintingName} - ${sizeInfo}${orientationInfo}`;

    itemsHTML += `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${itemNumber}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${articleDesc}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">BUC</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${unitPrice.toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${itemWithoutVAT.toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${itemVAT.toFixed(2)} (21%)</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>${itemTotal.toFixed(2)}</strong></td>
      </tr>
    `;
    itemNumber++;
  }

  // Add delivery as separate line item if exists
  if (deliveryAmount > 0) {
    itemsHTML += `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${itemNumber}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">Transport și Livrare</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">BUC</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">1</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${deliveryWithoutVAT.toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${deliveryWithoutVAT.toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${deliveryVATAmount.toFixed(2)} (21%)</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>${deliveryAmount.toFixed(2)}</strong></td>
      </tr>
    `;
  }

  return itemsHTML;
}

/**
 * Build complete HTML invoice document
 */
function buildInvoiceHTML(params: {
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
  itemsTableHTML: string;
  totalWithoutVAT: number;
  vatAmount: number;
  totalAmount: number;
  isEmailMode: boolean;
}): string {
  const {
    invoiceNumber,
    issueDate,
    dueDate,
    clientName,
    clientAddress,
    customerEmail,
    customerPhone,
    customerCity,
    customerCounty,
    customerPostalCode,
    billingCUI,
    billingRegCom,
    itemsTableHTML,
    totalWithoutVAT,
    vatAmount,
    totalAmount,
    isEmailMode
  } = params;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Factură ${invoiceNumber}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          font-size: 12px; 
          margin: 0;
          padding: 0;
          color: #333;
          display: flex;
          justify-content: center;
          background: #f5f5f5;
        }
        .invoice-container {
          max-width: 1000px;
          width: 100%;
          background: white;
          padding: 40px;
          box-sizing: border-box;
        }
        .logo { 
          font-size: 28px; 
          font-weight: bold; 
          color: #3B82F6; 
          margin-bottom: 5px; 
        }
        .tagline { 
          font-size: 11px; 
          color: #666; 
          margin-bottom: 20px; 
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 30px; 
        }
        .invoice-title { 
          font-size: 24px; 
          font-weight: bold; 
        }
        .invoice-number { 
          font-size: 20px; 
          color: #7B93FF; 
          margin-top: 5px; 
        }
        .dates { 
          text-align: right; 
        }
        .section { 
          margin-bottom: 30px; 
        }
        .section-title { 
          font-weight: bold; 
          margin-bottom: 10px; 
          font-size: 14px; 
        }
        .company-info { 
          line-height: 1.6; 
        }
        .table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0; 
        }
        .table th { 
          background-color: #f5f5f5; 
          padding: 10px; 
          border: 1px solid #ddd; 
          font-weight: bold; 
          text-align: left; 
        }
        .totals { 
          margin-top: 20px; 
          text-align: right; 
        }
        .total-row { 
          margin: 5px 0; 
        }
        .total-final { 
          background-color: #7B93FF; 
          color: white; 
          padding: 10px; 
          margin-top: 10px; 
          font-size: 16px; 
          font-weight: bold; 
        }
        .footer { 
          margin-top: 40px; 
          font-size: 10px; 
          color: #666; 
          line-height: 1.5; 
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
          .invoice-container {
            padding: 20px;
          }
          .header {
            flex-direction: column;
          }
          .dates {
            text-align: left;
            margin-top: 15px;
          }
          .invoice-title {
            font-size: 20px;
          }
          .invoice-number {
            font-size: 16px;
          }
          .table {
            font-size: 10px;
          }
          .table th, .table td {
            padding: 6px 4px;
          }
        }
        
        @media print {
          body {
            background: white;
          }
          .invoice-container {
            max-width: none;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
      <!-- Logo -->
      <img src="${LOGO_URL}" alt="BlueHand Canvas" style="width: 150px; height: auto; margin-bottom: 10px;" />
      
      <!-- Header -->
      <div class="header">
        <div>
          <div class="invoice-title">FACTURA</div>
          <div class="invoice-number">${invoiceNumber}</div>
        </div>
        <div class="dates">
          <div><strong>Data emitere:</strong> ${issueDate}</div>
          <div><strong>Data scadenta:</strong> ${dueDate}</div>
        </div>
      </div>
      
      <!-- Supplier and Client Info -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div class="section" style="width: 48%;">
          <div class="section-title">Furnizor</div>
          <div class="company-info">
            <strong>${COMPANY_NAME}</strong><br>
            CUI: ${COMPANY_CUI}<br>
            Reg. Com.: ${COMPANY_REG_COM}<br>
            Țara: ROMANIA<br>
            ${COMPANY_ADDRESS}<br>
            IBAN: ${COMPANY_IBAN}
          </div>
        </div>
        <div class="section" style="width: 48%;">
          <div class="section-title">Client</div>
          <div class="company-info">
            <strong>${clientName.toUpperCase()}</strong><br>
            ${billingCUI ? `CUI: ${billingCUI}<br>` : ''}
            ${billingRegCom ? `Reg. Com.: ${billingRegCom}<br>` : ''}
            ${customerEmail ? `Email: ${customerEmail}<br>` : ''}
            ${customerPhone ? `Telefon: ${customerPhone}<br>` : ''}
            ${clientAddress ? `${clientAddress}<br>` : ''}
            ${customerCity ? customerCity : ''}${customerCounty ? `, ${customerCounty}` : ''}${customerPostalCode ? `, ${customerPostalCode}` : ''}${(customerCity || customerCounty || customerPostalCode) ? '<br>' : ''}
            ROMANIA
          </div>
        </div>
      </div>
      
      <!-- Items Table -->
      <table class="table">
        <thead>
          <tr>
            <th style="width: 5%; text-align: center;">#</th>
            <th style="width: 35%;">Articol</th>
            <th style="width: 8%; text-align: center;">U.M.</th>
            <th style="width: 8%; text-align: center;">Cant.</th>
            <th style="width: 11%; text-align: right;">Pret unitar</th>
            <th style="width: 11%; text-align: right;">Valoare</th>
            <th style="width: 11%; text-align: right;">TVA</th>
            <th style="width: 11%; text-align: right;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${itemsTableHTML}
        </tbody>
      </table>
      
      <!-- Totals -->
      <div class="totals">
        <div class="total-row">Total fara TVA: <strong>${totalWithoutVAT.toFixed(2)} RON</strong></div>
        <div class="total-row">TVA 21%: <strong>${vatAmount.toFixed(2)} RON</strong></div>
        <div class="total-final">Total: ${totalAmount.toFixed(2)} Lei</div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        Factura circula fara semnatura si stampila cf. art.V, alin (2) din Ordonanta nr.17/2015 si art. 319 alin (29) din Legea nr. 227/2015 privind Codul fiscal.
      </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Get invoice from KV store
 */
export async function getInvoice(orderNumber: string): Promise<any> {
  try {
    console.log(`🔍 Fetching invoice for order: ${orderNumber}`);
    const invoice = await kv.get(`invoice:${orderNumber}`);
    
    if (!invoice) {
      console.log(`❌ Invoice not found for order: ${orderNumber}`);
      return null;
    }
    
    console.log(`✅ Invoice found for order: ${orderNumber}`);
    return invoice;
  } catch (error) {
    console.error('❌ Error fetching invoice:', error);
    throw error;
  }
}