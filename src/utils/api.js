import { BACKEND_URL } from './contractABI';

export async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('jwt_token');
    // For now, if no token is found, we still proceed but without the Auth header
    // In the future, we will use the wallet signature as auth
    const isFormData = options.isFormData || options.body instanceof FormData;
    const headers = {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            const text = await response.text();
            let errorMsg = 'API call failed';
            try {
                const errorJson = JSON.parse(text);
                errorMsg = errorJson.error || errorMsg;
            } catch (p) {
                errorMsg = text || errorMsg;
            }
            throw new Error(errorMsg);
        }

        return await response.json();
    } catch (err) {
        console.error("API Call error:", err.message);
        throw err;
    }
}

export async function uploadFileCall(endpoint, formData) {
    return apiCall(endpoint, {
        method: 'POST',
        body: formData,
        isFormData: true
    });
}
