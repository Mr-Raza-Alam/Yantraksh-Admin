import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI } from '../lib/api'

interface User {
    id: string
    name: string
    email: string
    userType: 'ADMIN' | 'AUS_STUDENT' | 'NON_AUS'
    rollNumber?: string
    department?: string
    year?: number
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            authAPI.getMe()
                .then((response) => {
                    if (response.data.userType === 'ADMIN') {
                        setUser(response.data)
                    } else {
                        localStorage.removeItem('token')
                    }
                })
                .catch(() => {
                    localStorage.removeItem('token')
                })
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    const login = async (email: string, password: string) => {
        const response = await authAPI.login(email, password)
        const { token } = response.data
        localStorage.setItem('token', token)

        const userResponse = await authAPI.getMe()
        if (userResponse.data.userType !== 'ADMIN') {
            localStorage.removeItem('token')
            throw new Error('Access denied. Admin privileges required.')
        }
        setUser(userResponse.data)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            loading,
            login,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
