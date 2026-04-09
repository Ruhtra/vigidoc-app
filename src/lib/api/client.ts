import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'vigidoc_session';

// export const API_BASE_URL = 'https://medic.vigidoc.org';
export const API_BASE_URL = "http://192.168.0.3:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    // Identificar que a requisição vem do app Android/iOS ajuda o backend a evitar bloqueios
    "User-Agent": `VigiDocApp/${Platform.OS}`,
  },
});

/**
 * Interceptor para injetar o token de autenticação (JWT) em todas as requisições.
 * Isso garante que rotas protegidas não retornem 401.
 */
api.interceptors.request.use(async (config) => {
  try {
    const sessionData = await SecureStore.getItemAsync(SESSION_KEY);
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      
      // Extração robusta do token do Better-Auth 
      const token = 
        parsed?.session?.token || 
        parsed?.token || 
        parsed?.session?.id || 
        parsed?.id;
      
      if (token && parsed.user) {
        // 1. Autenticação padrão Better-Auth
        config.headers.Authorization = `Bearer ${token}`;
        config.headers['x-better-auth-session-token'] = token;
        
        // 2. Identidade direta (Conforme esperado pelo getAuthContext do backend)
        // Isso permite que o backend identifique o usuário sem precisar consultar o banco
        config.headers['x-user-id'] = parsed.user.id;
        config.headers['x-user-role'] = parsed.user.role || 'user';
        
        // Se for um médico, enviamos o doctorId se disponível na sessão
        if (parsed.user.doctorId) {
          config.headers['x-doctor-id'] = parsed.user.doctorId;
        }
      }
    }
  } catch (error) {
    console.error('[API Client] Erro ao recuperar token do SecureStore:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
