const requiredVars = [
  "SMOKE_ENABLE_LIVE_INTAKE",
  "SMOKE_INTAKE_SECRET",
  "SMOKE_SUPABASE_URL"
];

const smokeSecretKey = process.env.SMOKE_SUPABASE_SECRET_KEY ?? process.env.SMOKE_SUPABASE_SERVICE_ROLE_KEY;

const missing = requiredVars.filter((name) => {
  const value = process.env[name];
  return !value || !value.trim();
});

if (!smokeSecretKey || !smokeSecretKey.trim()) {
  missing.push("SMOKE_SUPABASE_SECRET_KEY or SMOKE_SUPABASE_SERVICE_ROLE_KEY");
}

if (process.env.SMOKE_ENABLE_LIVE_INTAKE !== "true") {
  console.error(
    "SMOKE_ENABLE_LIVE_INTAKE must be set to 'true' before running test:intake-live."
  );
  process.exit(1);
}

if (missing.length > 0) {
  console.error("Missing required live intake env vars:");
  for (const name of missing) {
    console.error(`- ${name}`);
  }
  process.exit(1);
}

console.log("Live intake env precheck passed.");
