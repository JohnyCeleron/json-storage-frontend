export const PAGINATION = {
    PAGE_SIZE: 7,
    get FETCH_LIMIT() {
        return this.PAGE_SIZE + 1;
    }
} as const;

export const TOAST_TIMINGS = {
  VISIBLE_MS: 2200,
  FADE_MS: 350,
} as const;