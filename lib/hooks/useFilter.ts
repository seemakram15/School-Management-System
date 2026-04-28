import { useState, useMemo } from "react";

interface UseFilterOptions<T> {
  data: T[];
  keys: (keyof T)[];
  initialQuery?: string;
}

export function useFilter<T>({ data, keys, initialQuery = "" }: UseFilterOptions<T>) {
  const [query, setQuery] = useState(initialQuery);

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const lower = query.toLowerCase();
    return data.filter((item) =>
      keys.some((key) => {
        const val = item[key];
        return typeof val === "string" && val.toLowerCase().includes(lower);
      })
    );
  }, [data, keys, query]);

  return { query, setQuery, filtered, total: filtered.length };
}
