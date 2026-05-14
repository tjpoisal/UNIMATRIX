import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
    });

    // Add token to requests
    this.client.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth
  async register(email: string, password: string, name: string) {
    const response = await this.client.post('/auth/register', {
      email,
      password,
      name,
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  // Palaces
  async getPalaces() {
    const response = await this.client.get('/palaces');
    return response.data;
  }

  async getPalace(id: string) {
    const response = await this.client.get(`/palaces/${id}`);
    return response.data;
  }

  async createPalace(name: string, description: string) {
    const response = await this.client.post('/palaces', {
      name,
      description,
    });
    return response.data;
  }

  async updatePalace(id: string, name: string, description: string) {
    const response = await this.client.put(`/palaces/${id}`, {
      name,
      description,
    });
    return response.data;
  }

  async deletePalace(id: string) {
    const response = await this.client.delete(`/palaces/${id}`);
    return response.data;
  }

  // Memories
  async createMemory(locationId: string, content: string, tags: string[]) {
    const response = await this.client.post('/memories', {
      locationId,
      content,
      tags,
    });
    return response.data;
  }

  async updateMemory(id: string, content: string, tags: string[]) {
    const response = await this.client.put('/memories', {
      id,
      content,
      tags,
    });
    return response.data;
  }

  async deleteMemory(id: string) {
    const response = await this.client.delete('/memories', {
      data: { id },
    });
    return response.data;
  }

  // Sync (offline-first)
  async sync(changes: any[]) {
    const deviceId = await AsyncStorage.getItem('deviceId');
    const response = await this.client.post('/sync', {
      deviceId,
      deviceName: 'Mobile',
      changes,
    });
    return response.data;
  }

  // Search
  async search(query: string, palaceId?: string) {
    const response = await this.client.get('/search', {
      params: {
        q: query,
        ...(palaceId && { palaceId }),
      },
    });
    return response.data;
  }

  // Export
  async exportPalace(palaceId: string, format: 'json' | 'markdown') {
    const response = await this.client.post('/export', {
      palaceId,
      format,
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
