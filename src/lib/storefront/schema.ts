import { z } from "zod";

export const storefrontStatusSchema = z.enum([
  "active",
  "setup_incomplete",
  "subscription_expired",
  "suspended",
  "disabled",
]);

export const storefrontBrandingSchema = z.object({
  business_name: z.string(),
  logo_url: z.string().nullable().optional(),
  favicon_url: z.string().nullable().optional(),
  primary_color: z.string().nullable().optional(),
  secondary_color: z.string().nullable().optional(),
  font_key: z.string().nullable().optional(),
});

export const storefrontBusinessSchema = z.object({
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  whatsapp_number: z.string().nullable().optional(),
});

export const storefrontSectionsSchema = z.object({
  hero: z.boolean(),
  categories: z.boolean(),
  featured_products: z.boolean(),
  new_arrivals: z.boolean().optional(),
  promotions: z.boolean().optional(),
  live_chat: z.boolean().optional(),
  testimonials: z.boolean().optional(),
});

export const storefrontSeoSchema = z.object({
  title_en: z.string().nullable().optional(),
  title_fr: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  description_fr: z.string().nullable().optional(),
  indexing_enabled: z.boolean(),
});

export const storefrontConfigSchema = z.object({
  tcpos_subdomain: z.string().min(1),
  storefront_subdomain: z.string().min(1).nullable().optional(),
  storefront_status: storefrontStatusSchema,
  template_key: z.string().min(1),
  default_locale: z.string().min(1),
  supported_locales: z.array(z.string().min(1)).min(1),
  current_domain: z.string().min(1),
  primary_domain: z.string().min(1),
  branding: storefrontBrandingSchema,
  business: storefrontBusinessSchema,
  sections: storefrontSectionsSchema,
  seo: storefrontSeoSchema,
  config_version: z.number().int().nonnegative(),
  updated_at: z.string().min(1),
});

export const storefrontResolveSuccessSchema = z.object({
  success: z.literal(true),
  data: storefrontConfigSchema,
});

export const storefrontErrorEnvelopeSchema = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string().optional(),
  errors: z.record(z.string(), z.unknown()).optional(),
});

export function parseStorefrontConfig(data: unknown) {
  return storefrontConfigSchema.safeParse(data);
}

export function parseStorefrontResolveSuccess(payload: unknown) {
  return storefrontResolveSuccessSchema.safeParse(payload);
}

export function parseStorefrontErrorEnvelope(payload: unknown) {
  return storefrontErrorEnvelopeSchema.safeParse(payload);
}
