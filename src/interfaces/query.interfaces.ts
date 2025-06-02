export interface WithPaginationServiceParams {
  search: string;
  page: number;
  pp: number;
  sortType: "asc" | "desc";
  sortBy: string;
}
