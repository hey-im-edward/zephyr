"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Filter, Search } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CatalogSearchParams = {
  category?: string;
  brand?: string;
  silhouette?: string;
  size?: string;
  query?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
};

type CatalogFacetOptions = {
  categories: string[];
  brands: string[];
  silhouettes: string[];
  sizes: string[];
};

type CatalogFacetDraft = {
  category?: string;
  brand?: string;
  silhouette?: string;
  size?: string;
};

type SortOption = {
  value: string;
  label: string;
};

type CatalogSearchSortControlsProps = {
  baseParams: CatalogSearchParams;
  initialQuery?: string;
  initialSort: string;
  sortOptions: readonly SortOption[];
};

type CatalogFacetRailProps = {
  baseParams: CatalogSearchParams;
  initialDraft: CatalogFacetDraft;
  facets: CatalogFacetOptions;
  totalItems: number;
};

function buildCatalogQuery(baseParams: CatalogSearchParams, patch: Partial<CatalogSearchParams>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(baseParams)) {
    if (!value) continue;
    query.set(key, value);
  }

  for (const [key, value] of Object.entries(patch)) {
    if (!value) {
      query.delete(key);
      continue;
    }
    query.set(key, value);
  }

  query.delete("page");
  return query.toString();
}

function toCatalogHref(queryString: string) {
  return queryString ? `/catalog?${queryString}` : "/catalog";
}

export function CatalogSearchSortControls({
  baseParams,
  initialQuery,
  initialSort,
  sortOptions,
}: CatalogSearchSortControlsProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [sort, setSort] = useState(initialSort);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = query.trim();
    const next = buildCatalogQuery(baseParams, {
      query: normalizedQuery || undefined,
      sort,
    });

    router.push(toCatalogHref(next));
  }

  return (
    <form className="mt-8 grid gap-3 lg:grid-cols-[1fr_220px_auto]" onSubmit={handleSubmit}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--foreground-dim)" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tên mẫu, brand, dòng giày"
          className="h-12 w-full rounded-full border border-white/82 bg-white/34 pl-11 pr-4 text-sm text-foreground outline-none placeholder:text-(--foreground-dim) focus:border-white"
        />
      </div>

      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger aria-label="Sắp xếp catalog" className="h-12 rounded-full border-white/82 bg-white/34">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="submit" size="lg">
        <Filter size={16} />
        Áp dụng
      </Button>
    </form>
  );
}

export function CatalogFacetRail({ baseParams, initialDraft, facets, totalItems }: CatalogFacetRailProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<CatalogFacetDraft>(initialDraft);

  const activeFilters = useMemo(() => {
    return [
      draft.category,
      draft.brand,
      draft.silhouette,
      draft.size ? `Size ${draft.size}` : undefined,
      baseParams.query ? `“${baseParams.query}”` : undefined,
    ].filter(Boolean) as string[];
  }, [baseParams.query, draft.brand, draft.category, draft.silhouette, draft.size]);

  function toggleFilter(key: keyof CatalogFacetDraft, value: string) {
    setDraft((current) => ({
      ...current,
      [key]: current[key] === value ? undefined : value,
    }));
  }

  function applyDraft() {
    const next = buildCatalogQuery(baseParams, {
      category: draft.category,
      brand: draft.brand,
      silhouette: draft.silhouette,
      size: draft.size,
    });
    router.push(toCatalogHref(next));
  }

  function clearAllFilters() {
    setDraft({});

    const hasAppliedParams = Boolean(
      baseParams.category ||
        baseParams.brand ||
        baseParams.silhouette ||
        baseParams.size ||
        baseParams.query ||
        baseParams.minPrice ||
        baseParams.maxPrice ||
        baseParams.sort ||
        baseParams.page,
    );

    if (hasAppliedParams) {
      router.push("/catalog");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="utility-label">Facet rail</div>
        <div className="mt-2 font-display text-[1.7rem] font-semibold tracking-[-0.035em] text-(--foreground-hero)">
          Bộ lọc điều hướng
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-(--foreground-dim)">Danh mục</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {facets.categories.map((category) => (
              <Button
                key={category}
                type="button"
                variant={draft.category === category ? "default" : "secondary"}
                size="sm"
                onClick={() => toggleFilter("category", category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-(--foreground-dim)">Thương hiệu</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {facets.brands.map((brand) => (
              <Button
                key={brand}
                type="button"
                variant={draft.brand === brand ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter("brand", brand)}
              >
                {brand}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-(--foreground-dim)">Silhouette</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {facets.silhouettes.map((silhouette) => (
              <Button
                key={silhouette}
                type="button"
                variant={draft.silhouette === silhouette ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter("silhouette", silhouette)}
              >
                {silhouette}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-(--foreground-dim)">Size</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {facets.sizes.map((size) => (
              <Button
                key={size}
                type="button"
                variant={draft.size === size ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter("size", size)}
              >
                EU {size}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/82 bg-white/34 p-4">
        <div className="text-sm text-(--muted)">
          Đang hiển thị <span className="font-semibold text-(--foreground-hero)">{totalItems}</span> sản phẩm.
        </div>
        {activeFilters.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Badge key={filter} variant="secondary">
                {filter}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={applyDraft}>
            Áp dụng bộ lọc
          </Button>
          <Button type="button" size="sm" onClick={clearAllFilters}>
            Xóa toàn bộ bộ lọc
          </Button>
        </div>
      </div>
    </div>
  );
}