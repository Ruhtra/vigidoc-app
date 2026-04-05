import Constants from 'expo-constants';
import { api } from '@lib/api/client';

export interface VersionConfig {
  latest_version: string;
  min_version: string;
  store_url: string;
  force_update: boolean;
}

export const VersionService = {
  /**
   * Obtém as configurações de versão da API.
   */
  async getConfig(): Promise<VersionConfig> {
    const response = await api.get('/api/config/version');
    return response.data;
  },

  /**
   * Verifica se a versão atual é inferior à mínima exigida.
   * Retorna true se precisar de atualização obrigatória.
   */
  async checkUpdateRequired(minVersion: string): Promise<boolean> {
    const currentVersion = Constants.expoConfig?.version || '1.0.0';
    
    // Converte '1.2.3' para um array [1, 2, 3] para comparação
    const currentParts = currentVersion.split('.').map(Number);
    const minParts = minVersion.split('.').map(Number);

    for (let i = 0; i < Math.max(currentParts.length, minParts.length); i++) {
      const current = currentParts[i] || 0;
      const min = minParts[i] || 0;

      if (current < min) return true;
      if (current > min) return false;
    }

    return false;
  }
};
