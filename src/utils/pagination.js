/**
 * Shared server-side pagination helpers matching the JobVault AI backend envelope:
 * { items: [...], pagination: { total, page, page_size, total_pages, has_next, has_prev } }
 */

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_REVIEW_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 15, 25, 50, 100];

export function createDefaultPagination(pageSize = DEFAULT_PAGE_SIZE) {
  return {
    total: 0,
    page: 1,
    page_size: pageSize,
    requested_page_size: pageSize,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  };
}

export function normalizePaginatedPayload(
  payload,
  { defaultPage = 1, defaultPageSize = DEFAULT_PAGE_SIZE } = {}
) {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.results)
    ? payload.results
    : [];

  const meta =
    payload &&
    typeof payload === "object" &&
    payload.pagination &&
    typeof payload.pagination === "object"
      ? payload.pagination
      : null;

  const pageSize = Math.max(
    1,
    Number(meta?.page_size ?? payload?.page_size ?? defaultPageSize) ||
      defaultPageSize
  );
  const total = Math.max(
    0,
    Number(
      meta?.total ??
        meta?.count ??
        payload?.total ??
        payload?.count ??
        items.length
    ) || 0
  );
  const totalPages = Math.max(
    1,
    Number(meta?.total_pages ?? Math.ceil(total / pageSize)) || 1
  );
  const page = Math.min(
    totalPages,
    Math.max(1, Number(meta?.page ?? payload?.page ?? defaultPage) || defaultPage)
  );
  const hasNext =
    typeof meta?.has_next === "boolean" ? meta.has_next : page < totalPages;
  const hasPrev =
    typeof meta?.has_prev === "boolean" ? meta.has_prev : page > 1;

  return {
    items,
    pagination: {
      total,
      page,
      page_size: pageSize,
      requested_page_size: defaultPageSize,
      total_pages: totalPages,
      has_next: hasNext,
      has_prev: hasPrev,
    },
  };
}

export function appendPaginationQuery(
  searchParams,
  params = {},
  defaultPageSize = DEFAULT_PAGE_SIZE
) {
  const page = Math.max(1, Number(params?.page || 1) || 1);
  const pageSize = Math.max(
    1,
    Number(params?.page_size || defaultPageSize) || defaultPageSize
  );
  searchParams.set("page", String(page));
  searchParams.set("page_size", String(pageSize));
  return searchParams;
}

export function getRequestServerPage(currentPage, pageSize, serverPagination) {
  const safePage = Math.max(1, Number(currentPage) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE);
  const serverPageSize = Math.max(
    1,
    Number(serverPagination?.page_size) || safePageSize
  );
  const requestedMatches =
    Number(serverPagination?.requested_page_size) === safePageSize;

  if (requestedMatches && serverPageSize > safePageSize) {
    return Math.floor(((safePage - 1) * safePageSize) / serverPageSize) + 1;
  }
  return safePage;
}

export function getEffectivePaginationView(
  items = [],
  serverPagination = null,
  currentPage = 1,
  pageSize = DEFAULT_PAGE_SIZE
) {
  const safeList = Array.isArray(items) ? items : [];
  const safePageSize = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE);
  const serverPageSize = Math.max(
    1,
    Number(serverPagination?.page_size) || safePageSize
  );
  const serverTotal = Math.max(
    safeList.length,
    Number(serverPagination?.total) || safeList.length
  );

  // When backend enforces a larger minimum page size (e.g. 25/50) than selected UI limit (10/15),
  // slice the active page cleanly to the selected UI row limit.
  const serverReturnedLargerPage =
    serverPageSize > safePageSize && safeList.length > safePageSize;

  if (!serverReturnedLargerPage) {
    const totalPages = Math.max(
      1,
      Number(serverPagination?.total_pages) ||
        Math.ceil(serverTotal / safePageSize) ||
        1
    );
    const safePage = Math.min(
      totalPages,
      Math.max(1, Number(serverPagination?.page ?? currentPage) || 1)
    );
    return {
      visibleItems: safeList,
      total: serverTotal,
      page: safePage,
      pageSize: safePageSize,
      totalPages,
      hasNext:
        typeof serverPagination?.has_next === "boolean"
          ? serverPagination.has_next
          : safePage < totalPages,
      hasPrev:
        typeof serverPagination?.has_prev === "boolean"
          ? serverPagination.has_prev
          : safePage > 1,
    };
  }

  const totalPages = Math.max(1, Math.ceil(serverTotal / safePageSize));
  const safePage = Math.min(totalPages, Math.max(1, Number(currentPage) || 1));
  const serverPage = Math.max(1, Number(serverPagination?.page) || 1);
  const serverStartOffset = (serverPage - 1) * serverPageSize;
  const requestedStart = (safePage - 1) * safePageSize;
  const localStart = Math.max(0, requestedStart - serverStartOffset);
  const visibleItems = safeList.slice(localStart, localStart + safePageSize);

  return {
    visibleItems,
    total: serverTotal,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
}
