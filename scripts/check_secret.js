// Check what secret is configured on the server

(async () => {
  const secret = process.env.INTAKE_WEBHOOK_SECRET;
  console.log('🔐 Server-side INTAKE_WEBHOOK_SECRET:');
  console.log(`  Value: ${secret ? '✅ Set' : '❌ Missing'}`);
  if (secret) {
    console.log(`  Length: ${secret.length}`);
    console.log(`  First 10 chars: ${secret.slice(0, 10)}`);
    console.log(`  Last 10 chars: ${secret.slice(-10)}`);
  }
})();
