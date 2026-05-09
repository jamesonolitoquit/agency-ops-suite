function esc(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderContractHtml(contract: any, client: any) {
  const md = contract?.metadata ?? {};
  const packageName = esc(md.packageName ?? md.package ?? 'N/A');
  const price = Number(md.price ?? 0).toFixed(2);
  const timeline = esc(md.timeline ?? 'As agreed in SOW');
  const revisions = esc(md.revisionLimit ?? '2');
  const scope = esc(md.scope ?? 'Services as defined in Statement of Work.');
  const terms = esc(md.terms ?? 'Standard terms and conditions apply.');

  return `
    <section>
      <h2>Service Agreement</h2>
      <p><strong>Contract #:</strong> ${esc(contract.contract_number)}</p>
      <p><strong>Client:</strong> ${esc(client?.name)}</p>
      <p><strong>Website:</strong> ${esc(client?.domain ?? '')}</p>

      <h3>Package & Pricing</h3>
      <p><strong>Package:</strong> ${packageName}</p>
      <p><strong>Price:</strong> ${price}</p>
      <p><strong>Timeline:</strong> ${timeline}</p>
      <p><strong>Revision Limit:</strong> ${revisions}</p>

      <h3>Scope</h3>
      <p>${scope}</p>

      <h3>Terms</h3>
      <p>${terms}</p>
    </section>
  `;
}
