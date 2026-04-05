import { BACKEND_URL } from './contractABI';

export async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('jwt_token');
    const isFormData = options.isFormData || options.body instanceof FormData;
    const headers = {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
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
    return apiCall(endpoint, {
        method: 'POST',
        body: formData,
        isFormData: true
    });
}
