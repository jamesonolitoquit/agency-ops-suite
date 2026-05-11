import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const PDFDocument = require('pdfkit');

type LineItem = { description: string; qty: number; unitPrice: number };

export async function generateInvoicePdf(invoice: any, client: any, lineItems: LineItem[]) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });

  // Header
  doc.fontSize(20).text(process.env.NEXT_PUBLIC_COMPANY_NAME || 'Agency', { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(10).text(process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Address line 1');
  doc.moveDown(1);

  // Invoice title and meta
  doc.fontSize(16).text('INVOICE', { align: 'right' });
  doc.fontSize(10).text(`Invoice #: ${invoice.invoice_number}`, { align: 'right' });
  doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, { align: 'right' });
  if (invoice.due_date) doc.text(`Due: ${new Date(invoice.due_date).toLocaleDateString()}`, { align: 'right' });

  doc.moveDown(1);

  // Bill to
  doc.fontSize(12).text('Bill To:', { underline: true });
  doc.fontSize(10).text(client.name || 'Client');
  if (client.domain) doc.text(client.domain);
  doc.moveDown(1);

  // Line items table header
  doc.fontSize(10);
  const tableTop = doc.y;
  doc.text('Description', 40, tableTop);
  doc.text('Qty', 340, tableTop, { width: 50, align: 'right' });
  doc.text('Unit', 400, tableTop, { width: 70, align: 'right' });
  doc.text('Total', 470, tableTop, { width: 90, align: 'right' });
  doc.moveDown(0.5);

  // Items
  let position = doc.y;
  let subtotal = 0;
  for (const item of lineItems) {
    const lineTotal = item.qty * item.unitPrice;
    subtotal += lineTotal;
    doc.text(item.description, 40, position);
    doc.text(String(item.qty), 340, position, { width: 50, align: 'right' });
    doc.text(item.unitPrice.toFixed(2), 400, position, { width: 70, align: 'right' });
    doc.text(lineTotal.toFixed(2), 470, position, { width: 90, align: 'right' });
    position += 20;
    doc.y = position;
  }

  doc.moveDown(1);

  // Totals
  const tax = Number(invoice.tax ?? 0);
  const discount = Number(invoice.discount ?? 0);
  const total = Number(invoice.total ?? subtotal + tax - discount);

  doc.text(`Subtotal: ${subtotal.toFixed(2)}`, { align: 'right' });
  doc.text(`Tax: ${tax.toFixed(2)}`, { align: 'right' });
  doc.text(`Discount: ${discount.toFixed(2)}`, { align: 'right' });
  doc.fontSize(12).text(`Total: ${total.toFixed(2)}`, { align: 'right' });

  doc.moveDown(1);
  doc.fontSize(10).text('Payment Instructions:', { underline: true });
  doc.text(process.env.NEXT_PUBLIC_PAYMENT_INSTRUCTIONS || 'Bank transfer / GCash: contact accounting');

  if (invoice.notes) {
    doc.moveDown(1);
    doc.text('Notes:', { underline: true });
    doc.text(invoice.notes);
  }

  doc.end();

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    doc.on('data', (chunk: Buffer | Uint8Array) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    doc.on('end', () => resolve());
    doc.on('error', reject);
  });

  return Buffer.concat(chunks);
}
