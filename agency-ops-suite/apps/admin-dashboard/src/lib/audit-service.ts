import { createClient } from '@supabase/supabase-js';
import { randomBytes, randomUUID } from 'crypto';
import {
  getAuditById as getEphemeralAuditById,
  getPublicAuditByToken as getEphemeralPublicAudit,
  isMissingTableError,
  listAuditsForUser as listEphemeralAuditsForUser,
  saveAudit as saveEphemeralAudit,
} from './ephemeral-store';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type ProjectType = 'landing-page' | 'ecommerce' | 'corporate' | 'saas' | 'blog';

export interface LighthouseScores {
  performance: number;
  accessibility: number;
  seo: number;
  bestPractices: number;
}

export interface AuditIssue {
  category: 'performance' | 'accessibility' | 'seo' | 'best-practices';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
}

export interface CostEstimate {
  estimateLow: number;
  estimateHigh: number;
  estimatedHours: number;
  breakdown: {
    category: string;
    hours: number;
    cost: number;
  }[];
}

// Cost estimation formula based on issue severity and count
function estimateCost(issues: AuditIssue[], projectType: ProjectType): CostEstimate {
  const hourlyRate = 150; // $150/hr baseline

  // Categorize issues by severity
  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const highCount = issues.filter((i) => i.severity === 'high').length;
  const mediumCount = issues.filter((i) => i.severity === 'medium').length;

  // Estimate hours per issue type
  const criticalHours = criticalCount * 4; // 4 hours per critical issue
  const highHours = highCount * 2; // 2 hours per high issue
  const mediumHours = mediumCount * 1; // 1 hour per medium issue
  const baseHours = 2; // base analysis + planning

  // Add project-specific overhead
  const projectOverhead = {
    'landing-page': 0,
    ecommerce: 3,
    corporate: 2,
    saas: 3,
    blog: 1,
  }[projectType];

  const totalHours = criticalHours + highHours + mediumHours + baseHours + projectOverhead;
  const baseCost = totalHours * hourlyRate;

  // Add 20% buffer for testing/QA
  const estimateLow = Math.round(baseCost * 1.1);
  const estimateHigh = Math.round(baseCost * 1.3);

  return {
    estimateLow,
    estimateHigh,
    estimatedHours: totalHours,
    breakdown: [
      { category: 'Critical Issues', hours: criticalHours, cost: criticalHours * hourlyRate },
      { category: 'High Issues', hours: highHours, cost: highHours * hourlyRate },
      { category: 'Medium Issues', hours: mediumHours, cost: mediumHours * hourlyRate },
      { category: 'Analysis & Planning', hours: baseHours + projectOverhead, cost: (baseHours + projectOverhead) * hourlyRate },
    ],
  };
}

// Extract actionable issues from Lighthouse audit data
function extractIssues(lhrData: any): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // Performance issues
  if (lhrData.categories?.performance?.score < 0.5) {
    issues.push({
      category: 'performance',
      severity: 'critical',
      title: 'Poor Performance Score',
      description: `Your site scores ${Math.round(lhrData.categories.performance.score * 100)}/100 on performance.`,
      impact: 'Visitors leave slow sites, reducing conversions by 7% for every 1s delay.',
    });
  }

  // SEO issues
  if (lhrData.categories?.seo?.score < 0.7) {
    issues.push({
      category: 'seo',
      severity: 'high',
      title: 'SEO Optimization Needed',
      description: 'Missing critical SEO metadata and optimizations.',
      impact: 'Reduced visibility in search results; estimated 30-50% less organic traffic.',
    });
  }

  // Accessibility issues
  if (lhrData.categories?.accessibility?.score < 0.7) {
    issues.push({
      category: 'accessibility',
      severity: 'high',
      title: 'Accessibility Barriers',
      description: 'Your site is not fully accessible to users with disabilities.',
      impact: 'Excludes 15% of your potential audience; legal liability exposure.',
    });
  }

  // Best practices
  if (lhrData.categories?.['best-practices']?.score < 0.7) {
    issues.push({
      category: 'best-practices',
      severity: 'medium',
      title: 'Security & Best Practices',
      description: 'Missing security headers and outdated dependencies detected.',
      impact: 'Security vulnerabilities; potential data exposure.',
    });
  }

  // Mobile responsive
  if (lhrData.audits?.['viewport']?.score === 0) {
    issues.push({
      category: 'seo',
      severity: 'critical',
      title: 'Not Mobile Responsive',
      description: 'Your site is not optimized for mobile devices.',
      impact: 'Penalized in Google rankings; 60% of traffic is mobile.',
    });
  }

  return issues;
}

// Generate a public token for sharing
function generatePublicToken(): string {
  return randomBytes(16).toString('hex');
}

// Main audit generation function
export async function generateAudit(url: string, projectType: ProjectType, userId: string) {
  try {
    // Validate URL
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid URL protocol. Use http:// or https://');
    }

    // Create audit record with pending status
    const publicToken = generatePublicToken();
    const { data: auditRecord, error: insertError } = await supabase
      .from('audit_reports')
      .insert({
        website_url: url,
        project_type: projectType,
        public_token: publicToken,
        created_by: userId,
        created_at: new Date(),
      })
      .select()
      .single();

    if (insertError && !isMissingTableError(insertError)) throw insertError;

    // Simulate Lighthouse audit (in production, use actual lighthouse library)
    // For now, return mock data structure
    const mockLhrData = {
      categories: {
        performance: { score: Math.random() * 0.8 },
        seo: { score: Math.random() * 0.9 },
        accessibility: { score: Math.random() * 0.85 },
        'best-practices': { score: Math.random() * 0.9 },
      },
      audits: {
        viewport: { score: 1 }, // Assume responsive by default
      },
    };

    const issues = extractIssues(mockLhrData);
    const costEstimate = estimateCost(issues, projectType);

    // Update audit record with results
    let updatedRecord = auditRecord;
    let updateError: unknown = null;

    if (auditRecord && !insertError) {
      const updateResponse = await supabase
        .from('audit_reports')
        .update({
          performance: Math.round(mockLhrData.categories.performance.score * 100),
          accessibility: Math.round(mockLhrData.categories.accessibility.score * 100),
          seo: Math.round(mockLhrData.categories.seo.score * 100),
          best_practices: Math.round(mockLhrData.categories['best-practices'].score * 100),
          issues: issues,
          estimated_cost_low: costEstimate.estimateLow,
          estimated_cost_high: costEstimate.estimateHigh,
          estimated_hours: costEstimate.estimatedHours,
          generated_at: new Date(),
          is_public: true,
        })
        .eq('id', auditRecord.id)
        .select()
        .single();

      updatedRecord = updateResponse.data;
      updateError = updateResponse.error;
    }

    if (updateError && !isMissingTableError(updateError)) throw updateError;

    if (insertError || updateError || !auditRecord || !updatedRecord) {
      const ephemeralAudit = saveEphemeralAudit({
        id: auditRecord?.id ?? randomUUID(),
        website_url: url,
        project_type: projectType,
        performance: Math.round(mockLhrData.categories.performance.score * 100),
        accessibility: Math.round(mockLhrData.categories.accessibility.score * 100),
        seo: Math.round(mockLhrData.categories.seo.score * 100),
        best_practices: Math.round(mockLhrData.categories['best-practices'].score * 100),
        issues,
        created_at: auditRecord?.created_at ?? new Date().toISOString(),
        created_by: userId,
        generated_at: new Date().toISOString(),
        expires_at: null,
        public_token: auditRecord?.public_token ?? publicToken,
        is_public: true,
        estimated_cost_low: costEstimate.estimateLow,
        estimated_cost_high: costEstimate.estimateHigh,
        estimated_hours: costEstimate.estimatedHours,
      });

      if (!ephemeralAudit) {
        throw new Error('Failed to persist fallback audit record');
      }

      return {
        success: true,
        auditId: ephemeralAudit.id,
        publicToken: ephemeralAudit.public_token,
        data: ephemeralAudit,
      };
    }

    return {
      success: true,
      auditId: updatedRecord.id,
      publicToken: updatedRecord.public_token,
      data: updatedRecord,
    };
  } catch (error) {
    console.error('Audit generation failed:', error);
    throw error;
  }
}

// Fetch audit report by ID
export async function getAuditById(auditId: string) {
  const { data, error } = await supabase.from('audit_reports').select('*').eq('id', auditId).single();

  if (error) {
    const ephemeral = getEphemeralAuditById(auditId);
    if (ephemeral) return ephemeral;
    throw error;
  }
  return data;
}

// Fetch public audit report by token (no auth required)
export async function getPublicAudit(token: string) {
  const { data, error } = await supabase.from('audit_reports').select('*').eq('public_token', token).eq('is_public', true).single();

  if (error) {
    const ephemeral = getEphemeralPublicAudit(token);
    if (ephemeral) return ephemeral;
    throw error;
  }
  return data;
}

// List all audits for authenticated user
export async function listAudits(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('audit_reports')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return listEphemeralAuditsForUser(userId, limit);
  }
  return data;
}
