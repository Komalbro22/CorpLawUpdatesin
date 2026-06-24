import { z } from 'zod'

export const articleSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  summary: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  published_at: z.string().nullable().optional(),
  is_featured: z.boolean().optional(),
  effective_date: z.string().nullable().optional(),
  featured_image_url: z.string().nullable().optional(),
  impact_level: z.string().nullable().optional(),
  source_name: z.string().nullable().optional(),
  source_url: z.string().nullable().optional(),
  sources: z.any().nullable().optional(),
  key_change: z.string().nullable().optional(),
  key_changes: z.any().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  views: z.number().optional(),
  seo_title: z.string().nullable().optional(),
  seo_description: z.string().nullable().optional(),
  quick_answer: z.string().nullable().optional(),
  regulation_ref: z.string().nullable().optional(),
  last_verified: z.string().nullable().optional(),
  last_amended: z.string().nullable().optional(),
  key_takeaways: z.any().nullable().optional(),
  has_steps: z.boolean().optional(),
  steps_json: z.any().nullable().optional(),
  reading_time: z.number().optional()
})

export const glossarySchema = z.object({
  term: z.string().optional(),
  slug: z.string().optional(),
  definition: z.string().optional(),
  category: z.string().optional(),
  keywords: z.array(z.string()).nullable().optional(),
  synonyms: z.array(z.string()).nullable().optional(),
  is_verified: z.boolean().optional()
})

export const complianceSchema = z.object({
  regulator: z.string().optional(),
  form_name: z.string().nullable().optional(),
  compliance_title: z.string().optional(),
  due_date: z.string().optional(),
  applicable_to: z.string().nullable().optional(),
  penalty: z.string().nullable().optional(),
  regulation_reference: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  is_verified: z.boolean().optional(),
  created_by: z.string().nullable().optional(),
  contributor_name: z.string().nullable().optional(),
  contributor_profession: z.string().nullable().optional(),
  correction_count: z.number().optional(),
  frequency: z.string().nullable().optional(),
  display_order: z.number().optional()
})

export const documentTemplateSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  content: z.string().optional(),
  is_active: z.boolean().optional(),
  is_free: z.boolean().optional(),
  usage_count: z.number().optional(),
  display_order: z.number().optional(),
  fields: z.any().optional(),
  category: z.string().nullable().optional(),
  price: z.number().nullable().optional()
})
