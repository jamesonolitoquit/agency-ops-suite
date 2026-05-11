import { generateInvoicePdf } from '../../src/lib/invoice-pdf.js';

const sampleInvoice = {
  invoice_number: 'INV-TEST-0001',
  created_at: new Date().toISOString(),
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  tax: 0,
  discount: 0,
  total: 2500,
  notes: 'Test invoice',
};

const client = { name: 'Test Client', domain: 'test.example' };
const items = [{ description: 'Website design', qty: 1, unitPrice: 2500 }];

it('generates a PDF buffer', async () => {
  const buf = await generateInvoicePdf(sampleInvoice, client, items);
  if (!buf || buf.length < 100) throw new Error('PDF buffer too small');
});
