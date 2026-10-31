import { z } from 'zod';

export type UserRole = 'student' | 'faculty' | 'admin';

export interface UserSession {
  email: string;
  role: UserRole;
  name: string;
  institutionSubdomain: string;
  institutionName: string;
}

export const ResourceTypeSchema = z.enum([
  'video',
  'notes',
  'revision_pdf',
  'past_paper',
  'pdf',
  'textbook',
  'course_page',
  'study_guide',
]);
export type ResourceType = z.infer<typeof ResourceTypeSchema>;

export const VerificationStatusSchema = z.enum(['pending', 'verified', 'outdated']);
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

export const ExamRelevanceSchema = z.enum(['high', 'medium', 'low']);
export type ExamRelevance = z.infer<typeof ExamRelevanceSchema>;

export const TimeToConsumeSchema = z.enum(['15 min', '30 min', '45 min', '1 hr', '3 hr', '6 hr+']);
export type TimeToConsume = z.infer<typeof TimeToConsumeSchema>;

export const AcademicResourceSchema = z.object({
  id: z.number(),
  title: z.string(),
  type: ResourceTypeSchema,
  resourceType: z.enum(['video', 'notes', 'revision_pdf', 'past_paper']).default('notes'),
  source: z.string(),
  url: z.string().url().describe('Direct, verified academic URL.'),
  description: z.string(),
  curriculumMatch: z.number().int().min(0).max(100),
  downloadable: z.boolean(),
  verify_before_use: z.boolean().optional(),
  topics: z.array(z.string()),
  unit_tags: z.array(z.string()),
  anchor_resource: z.boolean(),
  exam_relevance: ExamRelevanceSchema.optional(),
  time_to_consume: TimeToConsumeSchema.optional(),

  // New Multi-Tenant & Verification Fields
  verificationStatus: VerificationStatusSchema.default('verified'),
  verifiedBy: z.string().nullable().default(null),
  lastUpdated: z.string().default(new Date().toISOString()),
  regulation: z.string().default('R22'),
  semester: z.number().int().default(5),
  department: z.string().default('CSE'),
  unit: z.number().int().default(1),
  youtubeVideoId: z.string().nullable().optional(),
  fileSize: z.string().optional(),
  institutionSubdomain: z.string().default('jntuh'),
});

export type AcademicResource = z.infer<typeof AcademicResourceSchema>;

export const QueryAnalysisSchema = z.object({
  detected_institution: z.string().nullable(),
  detected_course_code: z.string().nullable(),
  subject_domain: z.string(),
  academic_level: z.enum(['ug_1_2', 'ug_3_4', 'pg', 'unknown']),
  institution_tier: z.enum(['tier1_global', 'tier1_indian', 'tier2_indian', 'unspecified']),
  curriculum_standard: z.string(),
  total_resources: z.number(),
  detected_regulation: z.string().optional(),
  detected_semester: z.number().optional(),
});
export type QueryAnalysis = z.infer<typeof QueryAnalysisSchema>;

export const SyllabusMapEntrySchema = z.object({
  unit: z.string(),
  unit_number: z.number().optional(),
  title: z.string().optional(),
  topics: z.array(z.string()),
  resource_ids: z.array(z.number()),
  anchor_resource_id: z.number(),
  coverage_score: z.number().int().min(0).max(100),
});
export type SyllabusMapEntry = z.infer<typeof SyllabusMapEntrySchema>;

export const CoverageReportSchema = z.object({
  topics_covered: z.array(z.string()),
  topics_missing: z.array(z.string()),
  weak_coverage_warning: z.string().nullable(),
  recommended_start: z.number(),
});
export type CoverageReportData = z.infer<typeof CoverageReportSchema>;

export interface CourseHierarchyUnit {
  unitNumber: number;
  title: string;
  topics: string[];
}

export interface CourseHierarchyItem {
  id: string;
  code: string;
  name: string;
  department: string;
  regulation: string;
  semester: number;
  units: CourseHierarchyUnit[];
}

export interface InstitutionTenant {
  subdomain: string;
  name: string;
  shortName: string;
  tier: string;
  regulations: string[];
  departments: string[];
  bannerText: string;
}
