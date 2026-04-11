import { BACKEND_URL } from './contractABI';
import { getWalletAuthHeaders } from '../lib/walletApiAuth';

export async function apiCall(endpoint, options = {}) {
    const {
        headers: optionHeaders = {},
        isFormData: optionIsFormData,
        requiresWalletAuth = endpoint.startsWith('/api/'),
        ...fetchOptions
    } = options;

    const isFormData = optionIsFormData || fetchOptions.body instanceof FormData;
    const walletAuthHeaders = requiresWalletAuth ? await getWalletAuthHeaders() : {};
    const headers = {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...walletAuthHeaders,
        ...optionHeaders
    };

    try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
            ...fetchOptions,
            headers
        });

        if (!response.ok) {
            const text = await response.text();
            let errorMsg = 'API call failed';
            try {
                const errorJson = JSON.parse(text);
                errorMsg = errorJson.error || errorMsg;
            } catch {
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
