export const SHOWS_EXHIBITIONS_INDEX_PATH = "/shows-and-exhibitions/";

export function showsExhibitionsIndexPath(page?: number): string {
  if (!page || page <= 1) return SHOWS_EXHIBITIONS_INDEX_PATH;
  return `${SHOWS_EXHIBITIONS_INDEX_PATH}?page=${page}`;
}
