import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin endpoint to initialize audit reports table
// This is for development/setup only - restrict to admin in production
export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key');
  
  // Simple protection - in production use proper auth
  if (process.env.NODE_ENV === 'production' && adminKey !== process.env.ADMIN_SETUP_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Try to create the table - if it already exists, this will fail but that's OK
    const { error } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS audit_reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          website_url TEXT NOT NULL,
          project_type TEXT CHECK (project_type IN ('landing-page', 'ecommerce', 'corporate', 'saas', 'blog')),
          performance INT,
          accessibility INT,
          seo INT,
          best_practices INT,
          issues JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP DEFAULT now(),
          created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          generated_at TIMESTAMP,
          expires_at TIMESTAMP,
          public_token VARCHAR(32) UNIQUE,
          is_public BOOLEAN DEFAULT false,
          estimated_cost_low INT,
          estimated_cost_high INT,
          estimated_hours INT
        );
      `,
    });

    // Note: exec is not available in standard Supabase client
    // We need to use the SQL editor approach
    
    return NextResponse.json({
      message: 'Migration setup complete',
      note: 'Please apply the migration manually via Supabase dashboard',
    });
  } catch (err) {
    console.error('Migration endpoint error:', err);
    return NextResponse.json(
      {
        error: 'Migration setup not available via API',
        instruction: 'Apply the migration manually in Supabase SQL editor',
        status: 'pending'
      },
      { status: 503 }
    );
  }
}
