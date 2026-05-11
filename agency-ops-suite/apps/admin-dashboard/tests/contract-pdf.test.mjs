import { generateContractPdf } from '../../src/lib/contract-pdf.js';

const sampleContract = {
  contract_number: 'CTR-TEST-0001',
  created_at: new Date().toISOString(),
  metadata: { packageName: 'starter', price: 2500, timeline: '2 weeks', scope: 'Website' }
};

const client = { name: 'Test Client', domain: 'test.example' };

it('generates a contract PDF buffer', async () => {
  const buf = await generateContractPdf(sampleContract, client);
  if (!buf || buf.length < 100) throw new Error('PDF buffer too small');
});
