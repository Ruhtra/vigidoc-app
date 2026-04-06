// src/lib/api/client.ts
import axios from 'axios';
import { Platform } from 'react-native';

export const API_BASE_URL = 'https://medic.vigidoc.org';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Identificar que a requisição vem do app Android/iOS ajuda o backend a evitar bloqueios
    'User-Agent': `VigiDocApp/${Platform.OS}`, 
  },
});
