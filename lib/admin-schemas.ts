import { z } from 'zod'

export const articleSchema = z.object({
  title: z.string().min(3).max(500).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(200).optional(),
  summary: z.string().max(1000).optional(),
  content: z.string().max(200000).optional(),
  category: z.string().max(100).optional(),
  published_at: z.string().nullable().optional(),
  is_featured: z.boolean().optional(),
  effective_date: z.string().nullable().optional(),
  featured_image_url: z.string().url().nullable().optional(),
  impact_level: z.string().max(50).nullable().optional(),
  source_name: z.string().max(200).nullable().optional(),
  source_url: z.string().url().nullable().optional(),
  sources: z.any().nullable().optional(),
  key_change: z.string().max(2000).nullable().optional(),
  key_changes: z.any().nullable().optional(),
  tags: z.array(z.string().max(100)).nullable().optional(),
  views: z.number().optional(),
  seo_title: z.string().max(200).nullable().optional(),
  seo_description: z.string().max(500).nullable().optional(),
  quick_answer: z.string().max(2000).nullable().optional(),
  regulation_ref: z.string().max(500).nullable().optional(),
  last_verified: z.string().nullable().optional(),
  last_amended: z.string().nullable().optional(),
  key_takeaways: z.any().nullable().optional(),
  has_steps: z.boolean().optional(),
  steps_json: z.any().nullable().optional(),
  reading_time: z.number().optional()
})

export const glossarySchema = z.object({
  term: z.string().min(1).max(300).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(200).optional(),
  definition: z.string().max(10000).optional(),
  category: z.string().max(100).optional(),
  keywords: z.array(z.string().max(100)).nullable().optional(),
  synonyms: z.array(z.string().max(100)).nullable().optional(),
  is_verified: z.boolean().optional()
})

export const complianceSchema = z.object({
  regulator: z.string().max(100).optional(),
  form_name: z.string().max(200).nullable().optional(),
  compliance_title: z.string().min(3).max(500).optional(),
  due_date: z.string().optional(),
  applicable_to: z.string().max(500).nullable().optional(),
  penalty: z.string().max(1000).nullable().optional(),
  regulation_reference: z.string().max(500).nullable().optional(),
  is_active: z.boolean().optional(),
  is_verified: z.boolean().optional(),
  created_by: z.string().max(200).nullable().optional(),
  contributor_name: z.string().max(200).nullable().optional(),
  contributor_profession: z.string().max(200).nullable().optional(),
  correction_count: z.number().optional(),
  frequency: z.string().max(100).nullable().optional(),
  display_order: z.number().optional()
})

export const documentTemplateSchema = z.object({
  name: z.string().min(3).max(300).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  content: z.string().max(200000).optional(),
  is_active: z.boolean().optional(),
  is_free: z.boolean().optional(),
  usage_count: z.number().optional(),
  display_order: z.number().optional(),
  fields: z.any().optional(),
  category: z.string().max(100).nullable().optional(),
  price: z.number().nullable().optional()
})

