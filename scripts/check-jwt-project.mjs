#!/usr/bin/env node
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYXNmeXVodGVsbG1zeW9yeWdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM1MDM2MiwiZXhwIjoyMDkzOTI2MzYyfQ.AvXInuCkAHFyJOFqJPcvyezKIgj60aj4dxo5b0FdnTA';
const parts = key.split('.');
const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
console.log('Key Project ID (from JWT ref):', payload.ref);
console.log('Expected Project ID:         xfasfyuhtelnmsyokygc');
console.log('Match?', payload.ref === 'xfasfyuhtelnmsyokygc' ? '✅ YES' : '❌ NO');
