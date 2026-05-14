import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-deaf8e85`;

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('accessToken');
}

// Set auth token in localStorage
export function setAuthToken(token: string) {
  localStorage.setItem('accessToken', token);
}

// Remove auth token from localStorage
export function clearAuthToken() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}

// Set user data in localStorage
export function setUserData(user: any) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Get user data from localStorage
export function getUserData() {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
}

// API call helper
async function apiCall(endpoint: string, options: RequestInit = {}, useUserToken: boolean = true) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Always include the anon key for Supabase Edge Functions
  headers['Authorization'] = `Bearer ${publicAnonKey}`;

  // For protected routes, add user token in custom header
  if (useUserToken) {
    const token = getAuthToken();
    console.log('API Call - useUserToken:', useUserToken, 'token exists:', !!token, 'token preview:', token ? token.substring(0, 20) + '...' : 'null');
    if (token) {
      headers['X-User-Token'] = token;
    }
  } else {
    console.log('API Call - useUserToken:', useUserToken, 'using public anon key only');
  }

  console.log('API Call - endpoint:', endpoint, 'method:', options.method || 'GET');

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response received:', text.substring(0, 200));
      throw new Error('El servidor no está respondiendo correctamente. Verifica tu conexión.');
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('API Call failed:', endpoint, 'status:', response.status, 'data:', data);
      throw new Error(data.error || 'Error en la petición');
    }

    return data;
  } catch (error: any) {
    // If it's already our custom error, re-throw it
    if (error.message && !error.message.includes('JSON')) {
      throw error;
    }

    // Handle JSON parsing errors or network errors
    console.error('API Call error:', error);
    throw new Error('Error de comunicación con el servidor. Por favor, intenta de nuevo.');
  }
}

// Auth API
export const authAPI = {
  async register(userData: {
    email: string;
    password: string;
    nombre: string;
    apellidos: string;
    cedulaProfesional: string;
    especialidad: string;
    telefono?: string;
  }) {
    const data = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false); // Don't use user token for registration
    
    if (data.success) {
      setUserData(data.user);
    }
    
    return data;
  },

  async login(email: string, password: string) {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false); // Don't use user token for login
    
    if (data.success) {
      setAuthToken(data.accessToken);
      setUserData(data.user);
    }
    
    return data;
  },

  async getCurrentUser() {
    return await apiCall('/auth/me');
  },

  async requestPasswordReset(email: string) {
    return await apiCall('/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false);
  },

  async resetPassword(email: string, code: string, newPassword: string) {
    return await apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    }, false);
  },

  logout() {
    clearAuthToken();
  }
};

// Professional API
export const professionalAPI = {
  async getPatients() {
    return await apiCall('/professional/patients');
  },

  async addPatient(patientData: {
    email: string;
    password: string;
    nombre: string;
    apellidos: string;
    edad: number;
    sexoBiologico: string;
    telefono?: string;
    peso?: number;
    talla?: number;
  }) {
    return await apiCall('/professional/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  },
};

// Patient API
export const patientAPI = {
  async getPatientById(patientId: string) {
    return await apiCall(`/patient/${patientId}`);
  },

  async saveGlucoseRecord(recordData: {
    glucoseValue: number;
    date: string;
    time: string;
    notes?: string;
    patientId?: string;
  }) {
    return await apiCall('/patient/glucose', {
      method: 'POST',
      body: JSON.stringify(recordData),
    });
  },

  async getGlucoseRecords(patientId: string) {
    return await apiCall(`/patient/${patientId}/glucose`);
  },

  async saveFoodRecord(recordData: {
    foodName: string;
    foodGroup?: string;
    quantity: number;
    unit: string;
    mealType: string;
    location: string;
    preparedBy: string;
    consumptionOrder?: string;
    date: string;
    time: string;
    nutritionalInfo?: any;
    patientId?: string;
  }) {
    return await apiCall('/patient/food', {
      method: 'POST',
      body: JSON.stringify(recordData),
    });
  },

  async getFoodRecords(patientId: string) {
    return await apiCall(`/patient/${patientId}/food`);
  },
};

// User API
export const userAPI = {
  async uploadProfilePicture(imageBase64: string, fileName: string) {
    const data = await apiCall('/user/profile-picture', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, fileName }),
    });

    if (data.success) {
      setUserData(data.user);
    }

    return data;
  },

  async updateProfile(updates: {
    nombre?: string;
    apellidos?: string;
    telefono?: string;
    especialidad?: string;
    direccion?: string;
    fechaNacimiento?: string;
  }) {
    const data = await apiCall('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (data.success) {
      setUserData(data.user);
    }

    return data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const data = await apiCall('/user/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    return data;
  },
};