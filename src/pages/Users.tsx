import { useState, useEffect } from 'react'
import {
    Search,
    Loader2,
    Users as UsersIcon,
    Filter
} from 'lucide-react'
import { authAPI } from '../lib/api'

interface User {
    id: string
    name: string
    email: string
    userType: 'ADMIN' | 'AUS_STUDENT' | 'NON_AUS' | null
    rollNumber?: string
    department?: string
    college?: string
    phone?: string
    year?: number
    createdAt: string
}

const userTypeOptions = ['ALL', 'ADMIN', 'AUS_STUDENT', 'NON_AUS'] as const

export default function Users() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<string>('ALL')
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const response = await authAPI.getAllUsers()
            setUsers(response.data)
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId: string, newRole: string) => {
        setActionLoading(userId)
        try {
            await authAPI.changeUserRole(userId, newRole)
            await fetchUsers()
        } catch (error) {
            console.error('Error changing role:', error)
        } finally {
            setActionLoading(null)
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filterType === 'ALL' || user.userType === filterType
        return matchesSearch && matchesFilter
    })

    const getUserTypeBadge = (userType: string | null) => {
        switch (userType) {
            case 'ADMIN':
                return 'bg-primary-500/20 text-primary-300 border-primary-500/30'
            case 'AUS_STUDENT':
                return 'bg-green-500/20 text-green-300 border-green-500/30'
            case 'NON_AUS':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
            default:
                return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        }
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Users</h1>
                <p className="text-gray-400 mt-1">Manage user accounts and roles</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-12"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="input pl-12 pr-8 min-w-[180px]"
                    >
                        {userTypeOptions.map(type => (
                            <option key={type} value={type}>
                                {type === 'ALL' ? 'All Users' : type.replace('_', ' ')}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card py-4">
                    <p className="text-2xl font-bold text-white">{users.length}</p>
                    <p className="text-sm text-gray-400">Total Users</p>
                </div>
                <div className="card py-4">
                    <p className="text-2xl font-bold text-primary-400">
                        {users.filter(u => u.userType === 'ADMIN').length}
                    </p>
                    <p className="text-sm text-gray-400">Admins</p>
                </div>
                <div className="card py-4">
                    <p className="text-2xl font-bold text-green-400">
                        {users.filter(u => u.userType === 'AUS_STUDENT').length}
                    </p>
                    <p className="text-sm text-gray-400">AUS Students</p>
                </div>
                <div className="card py-4">
                    <p className="text-2xl font-bold text-blue-400">
                        {users.filter(u => u.userType === 'NON_AUS').length}
                    </p>
                    <p className="text-sm text-gray-400">External Users</p>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-primary-500" size={40} />
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Type</th>
                                <th>Details</th>
                                <th>Change Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-400">
                                        <UsersIcon className="mx-auto mb-2" size={32} />
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                                    <span className="text-white font-semibold">
                                                        {user.name?.charAt(0).toUpperCase() || '?'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{user.name}</p>
                                                    <p className="text-sm text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`px-3 py-1 text-xs rounded-full border ${getUserTypeBadge(user.userType)}`}>
                                                {user.userType || 'UNKNOWN'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="text-sm text-gray-400">
                                                {user.userType === 'AUS_STUDENT' && (
                                                    <>
                                                        {user.rollNumber && <p>Roll: {user.rollNumber}</p>}
                                                        {user.department && <p>Dept: {user.department}</p>}
                                                        {user.year && <p>Year: {user.year}</p>}
                                                    </>
                                                )}
                                                {user.userType === 'NON_AUS' && user.college && (
                                                    <p>College: {user.college}</p>
                                                )}
                                                {user.phone && <p>Phone: {user.phone}</p>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="relative">
                                                {actionLoading === user.id ? (
                                                    <Loader2 className="animate-spin text-primary-500" size={20} />
                                                ) : (
                                                    <select
                                                        value={user.userType || ''}
                                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                        className="input py-2 text-sm min-w-[140px]"
                                                    >
                                                        <option value="AUS_STUDENT">AUS Student</option>
                                                        <option value="NON_AUS">Non AUS</option>
                                                        <option value="ADMIN">Admin</option>
                                                    </select>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
