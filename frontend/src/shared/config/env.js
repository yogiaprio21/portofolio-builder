export const env = {
  get apiBase() {
    return (
      (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
      'http://localhost:3000'
    );
  },
};
