(async () => {
  const intakeSecret = process.env.INTAKE_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;
  const deployUrl = process.env.DEPLOY_URL;

  if (!intakeSecret || !supabaseUrl || !serviceKey || !deployUrl) {
    console.error('Missing required env vars. Required: INTAKE_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE, DEPLOY_URL');
    process.exit(2);
  }

  const testEmail = 'smoke+test@jumpstart.dev';
  try {
    console.log('Posting test lead to', deployUrl + '/api/intake/lead');
    const intakeRes = await fetch(deployUrl + '/api/intake/lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-intake-secret': intakeSecret,
      },
      body: JSON.stringify({ name: 'Smoke Test', email: testEmail, businessType: 'Testing' }),
    });

    const intakeText = await intakeRes.text();
    console.log('Intake response:', intakeRes.status, intakeText.slice(0, 2000));

    // Wait briefly for async processing
    await new Promise((r) => setTimeout(r, 1000));

    // Query Supabase REST for lead
    const query = `email=eq.${encodeURIComponent(testEmail)}`;
    const url = `${supabaseUrl}/rest/v1/leads?select=*&${query}`;
    console.log('Querying Supabase:', url);

    const supaRes = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
      },
    });

    const supaText = await supaRes.text();
    console.log('Supabase query status:', supaRes.status);
    let rows = null;
    try {
      rows = JSON.parse(supaText);
    } catch (e) {
      console.log('Failed to parse Supabase response as JSON:', supaText.slice(0, 2000));
    }

    console.log('Rows found:', Array.isArray(rows) ? rows.length : 'unknown');
    if (Array.isArray(rows) && rows.length > 0) {
      for (const r of rows) {
        console.log(' - id:', r.id, 'email:', r.email);
      }

      // Cleanup: delete created rows
      for (const r of rows) {
        const delUrl = `${supabaseUrl}/rest/v1/leads?id=eq.${r.id}`;
        const delRes = await fetch(delUrl, {
          method: 'DELETE',
          headers: {
            apikey: serviceKey,
            Authorization: 'Bearer ' + serviceKey,
          },
        });
        console.log('Deleted id', r.id, 'status', delRes.status);
      }
    } else {
      console.log('No rows found for test lead.');
    }

    console.log('Smoke test completed.');
  } catch (err) {
    console.error('Error during smoke test:', err);
    process.exit(1);
  }
})();
