export const PRODUCT_AVAILABILITY = ["all", "in_stock", "out_of_stock"] as const;

export type ProductAvailability = (typeof PRODUCT_AVAILABILITY)[number];

export type ProductQuery = {
  page: number;
  per_page: number;
  locale?: string;
  category?: string;
  featured?: boolean;
  search?: string;
  min_price?: number;
  max_price?: number;
  availability?: ProductAvailability;
};

export const DEFAULT_PRODUCT_PAGE = 1;
export const DEFAULT_PRODUCT_PER_PAGE = 24;
export const DEFAULT_PRODUCT_QUERY: ProductQuery = {
  page: DEFAULT_PRODUCT_PAGE,
  per_page: DEFAULT_PRODUCT_PER_PAGE,
};

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseOptionalNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function isAvailability(value: string): value is ProductAvailability {
  return (PRODUCT_AVAILABILITY as readonly string[]).includes(value);
}

export function parseProductQuery(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): ProductQuery {
  const params =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(
          Object.entries(searchParams).flatMap(([key, value]) => {
            if (value === undefined) return [];
            if (Array.isArray(value)) {
              return value.map((entry) => [key, entry] as [string, string]);
            }
            return [[key, value] as [string, string]];
          }),
        );

  const featuredRaw = params.get("featured");
  const availabilityRaw = params.get("availability");

  return {
    page: parsePositiveInt(params.get("page"), DEFAULT_PRODUCT_PAGE),
    per_page: Math.min(
      parsePositiveInt(params.get("per_page"), DEFAULT_PRODUCT_PER_PAGE),
      100,
    ),
    locale: params.get("locale")?.trim() || undefined,
    category: params.get("category")?.trim() || undefined,
    featured:
      featuredRaw === "1" || featuredRaw === "true"
        ? true
        : undefined,
    search: params.get("search")?.trim() || undefined,
    min_price: parseOptionalNumber(params.get("min_price")),
    max_price: parseOptionalNumber(params.get("max_price")),
    availability:
      availabilityRaw && isAvailability(availabilityRaw)
        ? availabilityRaw
        : undefined,
  };
}

export function serializeProductQuery(
  query: Partial<ProductQuery>,
): URLSearchParams {
  const params = new URLSearchParams();

  if (query.page && query.page !== DEFAULT_PRODUCT_PAGE) {
    params.set("page", String(query.page));
  }
  if (query.per_page && query.per_page !== DEFAULT_PRODUCT_PER_PAGE) {
    params.set("per_page", String(query.per_page));
  }
  if (query.locale) params.set("locale", query.locale);
  if (query.category) params.set("category", query.category);
  if (query.featured === true) params.set("featured", "1");
  if (query.search) params.set("search", query.search);
  if (query.min_price !== undefined) {
    params.set("min_price", String(query.min_price));
  }
  if (query.max_price !== undefined) {
    params.set("max_price", String(query.max_price));
  }
  if (query.availability && query.availability !== "all") {
    params.set("availability", query.availability);
  }

  return params;
}

export function productQueryToSearchParamsRecord(
  query: ProductQuery,
): Record<string, string | number | boolean | undefined> {
  return {
    page: query.page,
    per_page: query.per_page,
    locale: query.locale,
    category: query.category,
    featured: query.featured === true ? 1 : undefined,
    search: query.search,
    min_price: query.min_price,
    max_price: query.max_price,
    availability:
      query.availability && query.availability !== "all"
        ? query.availability
        : undefined,
  };
}

export function buildProductListHref(
  locale: string,
  query: Partial<ProductQuery>,
  basePath = `/${locale}/products`,
): string {
  const params = serializeProductQuery({ ...query, locale: undefined });
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
