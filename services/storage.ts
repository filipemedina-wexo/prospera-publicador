import { PublishedLP } from '../types';

// Compatibilidade com instalações antigas; a fonte oficial agora é a API.
const STORAGE_KEY = 'prospera_published_lps';

export const getStoredLPs = (): PublishedLP[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const addStoredLP = (lp: PublishedLP): void => {
  const list = getStoredLPs().filter(item => item.subdomain !== lp.subdomain);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([lp, ...list]));
};

export const removeStoredLP = (subdomain: string): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getStoredLPs().filter(lp => lp.subdomain !== subdomain)));
};
