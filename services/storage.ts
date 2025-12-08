import { PublishedLP } from '../types';

const STORAGE_KEY = 'prospera_published_lps';

export const getStoredLPs = (): PublishedLP[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading from local storage", error);
    return [];
  }
};

export const addStoredLP = (lp: PublishedLP): void => {
  try {
    const list = getStoredLPs();
    // Add to beginning of list
    const newList = [lp, ...list];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  } catch (error) {
    console.error("Error saving to local storage", error);
  }
};