/** Pages an in-memory list (for endpoints that return everything at once). */
export function paginate<T>(items: T[], page: number, limit: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    rows: items.slice((safePage - 1) * limit, safePage * limit),
    pagination: { page: safePage, limit, total: items.length, totalPages },
  };
}
