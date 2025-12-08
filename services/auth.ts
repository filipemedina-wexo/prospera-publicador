
const STORAGE_KEY = 'prospera_auth_session';

// Em uma aplicação real, isso seria validado no backend via API.
// Para este protótipo estático, validamos localmente conforme solicitado.
const VALID_USER = {
  email: 'filipe@useprospera.com.br',
  password: 'R@fa@1307'
};

export const login = (email: string, password: string): boolean => {
  if (email === VALID_USER.email && password === VALID_USER.password) {
    localStorage.setItem(STORAGE_KEY, 'true');
    return true;
  }
  return false;
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem(STORAGE_KEY) === 'true';
};

export const getUserEmail = (): string => {
  return VALID_USER.email;
};
