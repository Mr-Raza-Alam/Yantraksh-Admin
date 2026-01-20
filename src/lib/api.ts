import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Auth API
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),

    getMe: () =>
        api.get('/auth/me'),

    getAllUsers: () =>
        api.get('/auth/users'),

    changeUserRole: (userId: string, userType: string) =>
        api.patch(`/auth/users/${userId}/role`, { userType }),

    requestAdmin: () =>
        api.post('/auth/request-admin'),

    getAdminRequests: () =>
        api.get('/auth/admin-requests'),

    handleAdminRequest: (requestId: string, action: 'approve' | 'reject') =>
        api.patch(`/auth/admin-requests/${requestId}`, { action }),
}

// Competitions API
export const competitionsAPI = {
    getAll: () =>
        api.get('/competitions'),

    getById: (id: string) =>
        api.get(`/competitions/${id}`),

    create: (data: {
        title: string
        category: string
        prize: string
        type: 'SOLO' | 'TEAM'
        image: string
        specs: string[]
    }) => api.post('/competitions', data),

    update: (id: string, data: Partial<{
        title: string
        category: string
        prize: string
        type: 'SOLO' | 'TEAM'
        image: string
        specs: string[]
    }>) => api.patch(`/competitions/${id}`, data),

    delete: (id: string) =>
        api.delete(`/competitions/${id}`),
}

// Merchandise API
export const merchAPI = {
    getAll: () =>
        api.get('/merch'),

    getById: (id: string) =>
        api.get(`/merch/${id}`),

    create: (data: {
        name: string
        description?: string
        price: number
        stock: number
        sizes?: string[]
        image?: string
    }) => api.post('/merch', data),

    update: (id: string, data: Partial<{
        name: string
        description: string
        price: number
        stock: number
        sizes: string[]
        image: string
    }>) => api.patch(`/merch/${id}`, data),

    delete: (id: string) =>
        api.delete(`/merch/${id}`),
}

// Participations API
export const participationsAPI = {
    getAll: () =>
        api.get('/participations'),

    getByCompetition: (competitionId: string) =>
        api.get(`/participations/competition/${competitionId}`),
}

export default api
