import { PublishResponse } from '../types';

export const publishLandingPage = async (subdomain: string, file: File): Promise<PublishResponse> => {
  const formData = new FormData();
  formData.append('subdomain', subdomain);
  formData.append('file', file);

  try {
    // Em produção, a URL deve vir da variável de ambiente VITE_API_URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const response = await fetch(`${apiUrl}/publish`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data as PublishResponse;
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      message: "Erro de conexão com o servidor. Tente novamente."
    };
  }
};