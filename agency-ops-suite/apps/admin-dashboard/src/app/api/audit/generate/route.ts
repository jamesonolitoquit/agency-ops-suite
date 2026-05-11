import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateAudit, listAudits, ProjectType } from '@/lib/audit-service';

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request
    const body = await req.json();
    const { url, projectType } = body;

    if (!url || !projectType) {
      return NextResponse.json(
        { error: 'Missing required fields: url, projectType' },
        { status: 400 }
      );
    }

    if (!['landing-page', 'ecommerce', 'corporate', 'saas', 'blog'].includes(projectType)) {
      return NextResponse.json(
        { error: 'Invalid projectType' },
        { status: 400 }
      );
    }

    // Generate audit
    const result = await generateAudit(url, projectType as ProjectType, user.id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Audit generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate audit' },
      { status: 500 }
    );
  }
}

// GET /api/audit - list all audits for user
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const audits = await listAudits(user.id);

    return NextResponse.json({ audits }, { status: 200 });
  } catch (error) {
    console.error('Error fetching audits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audits' },
      { status: 500 }
    );
  }
}
