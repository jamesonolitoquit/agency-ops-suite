const requiredVars = [
  "STAGING_INTAKE_SECRET",
  "STAGING_SUPABASE_URL",
  "STAGING_SUPABASE_SERVICE_ROLE_KEY"
];

const missing = requiredVars.filter((name) => {
  const value = process.env[name];
  return !value || !value.trim();
});

if (process.env.STAGING_ENABLE_LIVE_INTAKE === "true" && missing.length > 0) {
  console.error("Missing required staging live intake env vars:");
  for (const name of missing) {
    console.error(`- ${name}`);
  }
  process.exit(1);
}

console.log("Staging env precheck passed.");
