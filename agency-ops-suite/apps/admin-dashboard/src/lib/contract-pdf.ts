import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const PDFDocument = require('pdfkit');

export async function generateContractPdf(contract: any, client: any) {
  const doc = new PDFDocument({ size: 'A4', margin: 48 });

  doc.fontSize(18).text(process.env.NEXT_PUBLIC_COMPANY_NAME || 'Agency', { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(12).text('Service Agreement', { align: 'right' });
  doc.moveDown(1);

  doc.fontSize(10).text(`Contract #: ${contract.contract_number}`);
  doc.text(`Date: ${new Date(contract.created_at).toLocaleDateString()}`);
  doc.moveDown(1);

  doc.fontSize(12).text('Parties');
  doc.fontSize(10).text(`Provider: ${process.env.NEXT_PUBLIC_COMPANY_NAME || 'Agency'}`);
  doc.text(`Client: ${client.name || ''}`);
  if (client.domain) doc.text(`Website: ${client.domain}`);
  doc.moveDown(1);

  const md = contract.metadata || {};
  doc.fontSize(12).text('Scope & Deliverables');
  doc.fontSize(10).text(md.scope || 'As described in the attached SOW.');
  doc.moveDown(0.5);

  doc.fontSize(12).text('Package & Pricing');
  doc.fontSize(10).text(`Package: ${md.packageName || md.package || 'N/A'}`);
  if (md.price) doc.text(`Price: ${Number(md.price).toFixed(2)}`);
  if (md.timeline) doc.text(`Timeline: ${md.timeline}`);
  if (md.revisionLimit) doc.text(`Revision limit: ${md.revisionLimit}`);

  doc.moveDown(1);
  doc.fontSize(12).text('Terms');
  doc.fontSize(10).text(md.terms || 'Standard terms apply. See Service Agreement template.');

  doc.addPage();
  doc.fontSize(12).text('Acceptance & Signature', { underline: true });
  doc.moveDown(1);
  doc.fontSize(10).text('By signing below, Client accepts the terms and scope described in this contract.');

  doc.moveDown(2);
  doc.text('Client name: ____________________________');
  doc.moveDown(1);
  doc.text('Signature: ____________________________');
  doc.moveDown(1);
  doc.text('Date: ____________________________');

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
