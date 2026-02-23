// API Configuration for different environments
const ENV = {
    development: {
        API_BASE_URL: 'http://localhost:5151',
        FRONTEND_URL: 'http://localhost:3000',
    },
    production: {
        API_BASE_URL: process.env.REACT_APP_API_URL || 'https://api.yourdomain.com',
        FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL || 'https://yourdomain.com',
    }
};

const currentEnv = process.env.NODE_ENV || 'development';

const API_BASE_URL = ENV[currentEnv].API_BASE_URL;
const FRONTEND_URL = ENV[currentEnv].FRONTEND_URL;

// API Configuration Object
export const config = {
    API_BASE_URL,
    FRONTEND_URL,

    // API Endpoints
    endpoints: {
        // Auth
        login: '/api/users/login-admin',
        admins: '/api/users/admins',
        addAdmin: '/api/users/add-admin',
        forgotPassword: '/api/users/forgot-password',
        resetPassword: '/api/users/reset-password',
        changePassword: '/api/users/change-password',

        // OTP
        sendOTP: '/api/otp/send-otp',
        verifyOTP: '/api/otp/verify-otp',

        // Clients
        clients: '/api/client/clients',
        clientById: (id) => `/api/client/clients/${id}`,
        deleteClients: '/api/client/client',
        gstDetails: (gstNumber) => `/api/client/gst-details/${gstNumber}`,

        // Projects
        projects: '/api/project/projects',
        projectById: (id) => `/api/project/projects/${id}`,
        projectDetails: (id) => `/api/project/projects-details/${id}`,
        projectsByClient: (clientId) => `/api/project/projects-client/${clientId}`,
        deleteProjects: '/api/project/project',

        // Invoices
        invoices: '/api/invoice/invoices',
        invoiceById: (id) => `/api/invoice/invoice/${id}`,
        sendInvoiceEmail: '/api/invoice/send-invoice-email',
        deleteInvoices: '/api/invoice/invoice',

        // Expenses
        expenses: '/api/expense/expenses',
        quarterlyExpenses: '/api/expense/quarterly-expenses',
        yearlyExpenses: '/api/expense/yearly-expenses',
        deleteExpenses: '/api/expense/expense',

        // Follow-ups
        followUps: '/api/followUp/followUps',
        allFollowUps: '/api/followUp/all-followUps',
        followUpsByProject: (projectId) => `/api/followUp/followUps/${projectId}`,
        deleteFollowUps: '/api/followUp/delete',

        // Company
        companyDetails: '/api/companyDetail/companyDetails',
        companyDetailsById: (id) => `/api/companyDetail/companyDetails/${id}`,

        // Dashboard
        dashboardStats: '/api/dashboard/stats',

        // Contact & Newsletter
        contact: '/api/contact/submit',
        newsletter: '/api/newsletter/subscribe',
        leads: '/api/leads/submit',

        // SuperAdmin
        superAdminPlans: '/api/superadmin/plans',
        superAdminAdmins: '/api/superadmin/admins',
        superAdminAdminById: (id) => `/api/superadmin/admins/${id}`,
        adminDetails: (id) => `/api/superadmin/admins/${id}/details`,
        suspendAdmin: (id) => `/api/superadmin/admins/${id}/suspend`,
        adminInvoice: (id) => `/api/superadmin/admins/${id}/invoice`,
    },
};

// Helper function to get full URL
export const getApiUrl = (endpoint) => {
    if (typeof endpoint === 'function') {
        throw new Error('Please call the endpoint function first, then pass the result to getApiUrl');
    }
    return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get asset URL (for images, PDFs, etc.)
export const getAssetUrl = (path) => {
    if (!path) return '';
    // If path already includes http, return as is
    if (path.startsWith('http')) return path;
    // If path starts with /, remove it to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Helper function to get auth headers for file upload
export const getAuthHeadersForUpload = () => {
    const token = localStorage.getItem('token');
    return {
        ...(token && { 'Authorization': `Bearer ${token}` })
        // Don't set Content-Type for FormData - browser will set it with boundary
    };
};

// Helper function to handle auth errors
export const handleAuthError = (navigate) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (navigate) {
        navigate('/login');
    }
};

// Export default
export default config;
