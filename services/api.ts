import { PublishResponse } from '../types';

export const publishLandingPage = async (subdomain: string, file: File): Promise<PublishResponse> => {
  const formData = new FormData();
  formData.append('subdomain', subdomain);
  formData.append('file', file);

  try {
    const response = await fetch('https://api.prosperapages.com.br/publish', {
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