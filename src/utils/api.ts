export const API_URL = import.meta.env.VITE_API_URL || 'http://13.61.187.38';

export const getAuthToken = () => localStorage.getItem('admin_token');
export const setAuthToken = (token: string) => localStorage.setItem('admin_token', token);
export const removeAuthToken = () => localStorage.removeItem('admin_token');

export const fetchJson = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.message || 'Something went wrong');
    }

    return data;
};
