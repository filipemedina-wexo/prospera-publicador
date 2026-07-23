const STORAGE_KEY = 'prospera_auth_session';

const VALID_USER = {
  email: import.meta.env.VITE_AUTH_EMAIL,
  password: import.meta.env.VITE_AUTH_PASSWORD
};

export const login = (email: string, password: string): boolean => {
  if (email === VALID_USER.email && password === VALID_USER.password) {
    localStorage.setItem(STORAGE_KEY, 'true');
    return true;
  }
  return false;
};

export const logout = (): void => localStorage.removeItem(STORAGE_KEY);
export const isAuthenticated = (): boolean => localStorage.getItem(STORAGE_KEY) === 'true';
export const getUserEmail = (): string => VALID_USER.email;
