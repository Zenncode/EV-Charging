import { useMemo, useState } from "react";

export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const pagination = useMemo(
    () => ({
      page,
      limit,
      setPage,
      setLimit,
      nextPage: () => setPage((prev) => prev + 1),
      reset: () => {
        setPage(initialPage);
        setLimit(initialLimit);
      },
    }),
    [initialLimit, initialPage, limit, page]
  );

  return pagination;
}
