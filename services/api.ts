import { PublishResponse, PublishedLP } from '../types';

const API_URL = (import.meta.env.VITE_API_URL || 'https://publicador.useprospera.com.br').replace(/\/$/, '');

async function parseResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  let data: T;
  try {
    data = raw ? JSON.parse(raw) as T : {} as T;
  } catch {
    throw new Error(`Resposta inválida do servidor (${response.status}).`);
  }
  if (!response.ok) {
    const message = (data as { message?: string }).message || `Servidor respondeu HTTP ${response.status}.`;
    throw new Error(message);
  }
  return data;
}

export const getLandingPages = async (): Promise<PublishedLP[]> => {
  const response = await fetch(`${API_URL}/publish`);
  const data = await parseResponse<{ success: boolean; lps?: PublishedLP[] }>(response);
  return data.lps || [];
};

export const publishLandingPage = async (subdomain: string, file: File): Promise<PublishResponse> => {
  const formData = new FormData();
  formData.append('subdomain', subdomain);
  formData.append('file', file);
  try {
    const response = await fetch(`${API_URL}/publish`, { method: 'POST', body: formData });
    return await parseResponse<PublishResponse>(response);
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Erro de conexão com o servidor.' };
  }
};

export const deleteLandingPage = async (subdomain: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/publish/${encodeURIComponent(subdomain)}`, { method: 'DELETE' });
    return await parseResponse<{ success: boolean; message: string }>(response);
  } catch (error) {
    console.error('API Error (Delete):', error);
    return { success: false, message: error instanceof Error ? error.message : 'Falha ao conectar com servidor.' };
  }
};
