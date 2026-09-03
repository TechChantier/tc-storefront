import type { z } from "zod";
import type {
  storefrontBrandingSchema,
  storefrontBusinessSchema,
  storefrontConfigSchema,
  storefrontSectionsSchema,
  storefrontSeoSchema,
  storefrontStatusSchema,
} from "@/lib/schemas/storefront";

export type StorefrontStatus = z.infer<typeof storefrontStatusSchema>;
export type StorefrontBranding = z.infer<typeof storefrontBrandingSchema>;
export type StorefrontBusiness = z.infer<typeof storefrontBusinessSchema>;
export type StorefrontSections = z.infer<typeof storefrontSectionsSchema>;
export type StorefrontSeo = z.infer<typeof storefrontSeoSchema>;
export type StorefrontConfig = z.infer<typeof storefrontConfigSchema>;
export type StorefrontResolveResponse = StorefrontConfig;
