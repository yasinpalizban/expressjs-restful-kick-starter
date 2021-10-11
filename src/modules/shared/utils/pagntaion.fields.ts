export function paginationFields(limit: number, page: number):object {
  return {
    limit: limit,
    page: { $sum: [1, { $divide: [page, limit] }] },
    totalPages: { $ceil: { $divide: ["$totalDocs", limit] } },
    pagingCounter: { $sum: [1, { $divide: [page, limit] }] },
    nextPage: {
      $cond: {
        if: { $gt: ["$page", "$totalPages"] },
        then: null,
        else: { $sum: [1, "$page"] }
      }


    },
    prevPage: {
      $subtract: ["$page", 1]
    },
    hasNextPage: {
      $let:
        {
          vars: { np: { $sum: [1, "$page"] } },
          in: { $gt: ["$totalPages", "$$np"] }
        }
    }, hasPrevPage: {
      $let:
        {
          vars: { np: { $subtract: ["$page", 1] } },
          in: { $lt: ["$totalPages", "$$np"] }
        }
    }
  };
}
