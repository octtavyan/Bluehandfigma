export function getOrderConfirmationEmailHtml(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  itemsHtml: string;
  subtotal: number;
  deliveryLabel: string;
  deliveryPrice: number;
  paymentLabel: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
  testingModeNotice?: string;
}) {
  const { 
    orderNumber, customerName, customerEmail, total, itemsHtml,
    subtotal, deliveryLabel, deliveryPrice, paymentLabel,
    address, city, county, postalCode, testingModeNotice
  } = data;

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6; 
        color: #333;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
      }
      .container { 
        max-width: 600px; 
        margin: 0 auto; 
        background-color: white;
      }
      .header { 
        background: linear-gradient(135deg, #6994FF 0%, #5078E6 100%);
        color: white; 
        padding: 40px 20px; 
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
      }
      .header p {
        margin: 10px 0 0 0;
        font-size: 16px;
        opacity: 0.9;
      }
      .content { 
        padding: 40px 30px;
      }
      .success-message {
        background-color: #f0fdf4;
        border-left: 4px solid #22c55e;
        padding: 15px 20px;
        margin-bottom: 30px;
        border-radius: 4px;
      }
      .success-message p {
        margin: 0;
        color: #166534;
      }
      .order-number {
        background-color: #fef3c7;
        padding: 15px 20px;
        border-radius: 8px;
        text-align: center;
        margin-bottom: 30px;
      }
      .order-number strong {
        color: #92400e;
        font-size: 18px;
      }
      .section {
        margin-bottom: 30px;
      }
      .section h2 {
        color: #111827;
        font-size: 18px;
        margin: 0 0 15px 0;
        padding-bottom: 10px;
        border-bottom: 2px solid #e5e7eb;
      }
      .order-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      .totals-row {
        background-color: #f9fafb;
      }
      .totals-row td {
        padding: 12px;
        font-size: 15px;
      }
      .final-total {
        background-color: #6994FF !important;
        color: white !important;
        font-size: 18px !important;
        font-weight: bold !important;
      }
      .info-box {
        background-color: #f9fafb;
        padding: 15px 20px;
        border-radius: 8px;
        margin-bottom: 15px;
      }
      .info-box p {
        margin: 8px 0;
        font-size: 15px;
      }
      .info-box strong {
        color: #374151;
        display: inline-block;
        min-width: 140px;
      }
      .footer { 
        background-color: #f9fafb;
        text-align: center; 
        padding: 30px 20px;
        color: #6b7280;
        font-size: 14px;
        border-top: 1px solid #e5e7eb;
      }
      .footer p {
        margin: 5px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>✅ Comanda ta a fost confirmată!</h1>
        <p>Mulțumim pentru comandă, ${customerName}!</p>
      </div>
      
      <div class="content">
        <div class="success-message">
          <p>✨ Comanda ta a fost primită cu succes și este în curs de procesare.</p>
        </div>

        ${testingModeNotice || ''}

        <div class="order-number">
          <strong>Număr Comandă: #${orderNumber}</strong>
        </div>

        <div class="section">
          <h2>📦 Produse Comandate</h2>
          <table class="order-table">
            <tbody>
              ${itemsHtml}
              <tr class="totals-row">
                <td><strong>Subtotal produse</strong></td>
                <td style="text-align: right;"><strong>${subtotal.toFixed(2)} lei</strong></td>
              </tr>
              <tr class="totals-row">
                <td><strong>Livrare (${deliveryLabel})</strong></td>
                <td style="text-align: right;"><strong>${deliveryPrice ? deliveryPrice.toFixed(2) : '0.00'} lei</strong></td>
              </tr>
              <tr class="totals-row final-total">
                <td><strong>TOTAL</strong></td>
                <td style="text-align: right;"><strong>${total.toFixed(2)} lei</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>🚚 Detalii Livrare</h2>
          <div class="info-box">
            <p><strong>Adresă:</strong> ${address}</p>
            <p><strong>Oraș:</strong> ${city}</p>
            <p><strong>Județ:</strong> ${county}</p>
            <p><strong>Cod Poștal:</strong> ${postalCode}</p>
            <p><strong>Metodă livrare:</strong> ${deliveryLabel}</p>
          </div>
        </div>

        <div class="section">
          <h2>💳 Detalii Plată</h2>
          <div class="info-box">
            <p><strong>Metodă plată:</strong> ${paymentLabel}</p>
            <p><strong>Email contact:</strong> ${customerEmail}</p>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #6b7280; margin-bottom: 15px;">Vei primi un email de confirmare când comanda ta va fi expediată.</p>
          <p style="color: #6b7280;">Pentru întrebări sau asistență, te rugăm să ne contactezi la <strong>hello@bluehand.ro</strong></p>
        </div>
      </div>

      <div class="footer">
        <p><strong>BlueHand Canvas</strong></p>
        <p>Transformă amintirile în artă</p>
        <p style="margin-top: 15px;">© ${new Date().getFullYear()} BlueHand Canvas. Toate drepturile rezervate.</p>
      </div>
    </div>
  </body>
</html>`;
}