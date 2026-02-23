import config from '../config/api';

/**
 * Secure API utility with error handling, retry logic, and authentication
 */

class ApiService {
    constructor() {
        this.baseURL = config.API_BASE_URL;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    /**
     * Get authentication headers
     */
    getHeaders(customHeaders = {}) {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...customHeaders
        };
    }

    /**
     * Handle API errors
     */
    handleError(error, navigate) {
        if (error.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (navigate) {
                navigate('/login');
            }
            throw new Error('Session expired. Please login again.');
        } else if (error.status === 403) {
            throw new Error('Access denied. You do not have permission to perform this action.');
        } else if (error.status === 404) {
            throw new Error('Resource not found.');
        } else if (error.status === 429) {
            throw new Error('Too many requests. Please try again later.');
        } else if (error.status >= 500) {
            throw new Error('Server error. Please try again later.');
        }
        throw error;
    }

    /**
     * Retry logic for failed requests
     */
    async retryRequest(fn, attempts = this.retryAttempts) {
        try {
            return await fn();
        } catch (error) {
            if (attempts <= 1 || error.status === 401 || error.status === 403) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, this.retryDelay));
            return this.retryRequest(fn, attempts - 1);
        }
    }

    /**
     * GET request
     */
    async get(endpoint, options = {}) {
        const { navigate, retry = false, ...fetchOptions } = options;

        const makeRequest = async () => {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders(fetchOptions.headers),
                ...fetchOptions
            });

            if (!response.ok) {
                const error = new Error(response.statusText);
                error.status = response.status;
                this.handleError(error, navigate);
            }

            return response.json();
        };

        return retry ? this.retryRequest(makeRequest) : makeRequest();
    }

    /**
     * POST request
     */
    async post(endpoint, data, options = {}) {
        const { navigate, retry = false, ...fetchOptions } = options;

        const makeRequest = async () => {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(fetchOptions.headers),
                body: JSON.stringify(data),
                ...fetchOptions
            });

            if (!response.ok) {
                const error = new Error(response.statusText);
                error.status = response.status;

                // Try to get error message from response
                try {
                    const errorData = await response.json();
                    error.message = errorData.message || response.statusText;
                } catch (e) {
                    // Use default error message
                }

                this.handleError(error, navigate);
            }

            return response.json();
        };

        return retry ? this.retryRequest(makeRequest) : makeRequest();
    }

    /**
     * PUT request
     */
    async put(endpoint, data, options = {}) {
        const { navigate, retry = false, ...fetchOptions } = options;

        const makeRequest = async () => {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(fetchOptions.headers),
                body: JSON.stringify(data),
                ...fetchOptions
            });

            if (!response.ok) {
                const error = new Error(response.statusText);
                error.status = response.status;
                this.handleError(error, navigate);
            }

            return response.json();
        };

        return retry ? this.retryRequest(makeRequest) : makeRequest();
    }

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        const { navigate, retry = false, ...fetchOptions } = options;

        const makeRequest = async () => {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders(fetchOptions.headers),
                ...fetchOptions
            });

            if (!response.ok) {
                const error = new Error(response.statusText);
                error.status = response.status;
                this.handleError(error, navigate);
            }

            return response.json();
        };

        return retry ? this.retryRequest(makeRequest) : makeRequest();
    }

    /**
     * Upload file
     */
    async uploadFile(endpoint, formData, options = {}) {
        const { navigate, onProgress, ...fetchOptions } = options;
        const token = localStorage.getItem('token');

        const headers = {
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...fetchOptions.headers
        };

        // Don't set Content-Type for FormData - browser will set it with boundary
        delete headers['Content-Type'];

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
            ...fetchOptions
        });

        if (!response.ok) {
            const error = new Error(response.statusText);
            error.status = response.status;
            this.handleError(error, navigate);
        }

        return response.json();
    }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
