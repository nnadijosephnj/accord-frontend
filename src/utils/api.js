import { BACKEND_URL } from './contractABI';

export async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('jwt_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API call failed');
    }

    return response.json();
}

export async function uploadFileCall(endpoint, formData) {
    const token = localStorage.getItem('jwt_token');
    const headers = {
        ...(token && { 'Authorization': `Bearer ${token}` })
        // Do NOT set Content-Type for FormData, browser does it automatically with boundary
    };

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
    }

    return response.json();
}
