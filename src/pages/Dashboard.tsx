import { useState, useEffect } from 'react'
import {
    Users,
    Calendar,
    ShoppingBag,
    Trophy,
    UserPlus,
    Shield,
    CheckCircle,
    XCircle,
    X,
    Loader2
} from 'lucide-react'
import { authAPI, competitionsAPI, merchAPI, participationsAPI } from '../lib/api'

interface Stats {
    totalUsers: number
    totalEvents: number
    totalMerch: number
    totalParticipations: number
}

interface User {
    id: string
    name: string
    email: string
    userType: string
}

interface AdminRequest {
    id: string
    userId: string
    status: string
    createdAt: string
    user: {
        id: string
        name: string
        email: string
        userType: string
    }
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalEvents: 0,
        totalMerch: 0,
        totalParticipations: 0,
    })
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<User[]>([])
    const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([])

    // Modal states
    const [showMakeAdmin, setShowMakeAdmin] = useState(false)
    const [showAllAdmins, setShowAllAdmins] = useState(false)
    const [showGrantRequests, setShowGrantRequests] = useState(false)
    const [selectedUser, setSelectedUser] = useState<string>('')
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [usersRes, eventsRes, merchRes, participationsRes] = await Promise.all([
                authAPI.getAllUsers(),
                competitionsAPI.getAll(),
                merchAPI.getAll(),
                participationsAPI.getAll(),
            ])

            setUsers(usersRes.data)
            setStats({
                totalUsers: usersRes.data.length,
                totalEvents: eventsRes.data.data?.length || 0,
                totalMerch: merchRes.data.data?.length || 0,
                totalParticipations: participationsRes.data.data?.length || 0,
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchAdminRequests = async () => {
        try {
            const response = await authAPI.getAdminRequests()
            setAdminRequests(response.data.data || [])
        } catch (error) {
            console.error('Error fetching admin requests:', error)
        }
    }

    const handleMakeAdmin = async () => {
        if (!selectedUser) return
        setActionLoading(true)
        try {
            await authAPI.changeUserRole(selectedUser, 'ADMIN')
            await fetchData()
            setShowMakeAdmin(false)
            setSelectedUser('')
        } catch (error) {
            console.error('Error making admin:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleAdminRequest = async (requestId: string, action: 'approve' | 'reject') => {
        setActionLoading(true)
        try {
            await authAPI.handleAdminRequest(requestId, action)
            await fetchAdminRequests()
            await fetchData()
        } catch (error) {
            console.error('Error handling request:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const admins = users.filter(u => u.userType === 'ADMIN')
    const nonAdmins = users.filter(u => u.userType !== 'ADMIN')

    const statsCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-blue-600' },
        { label: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'from-purple-500 to-purple-600' },
        { label: 'Merchandise', value: stats.totalMerch, icon: ShoppingBag, color: 'from-green-500 to-green-600' },
        { label: 'Participations', value: stats.totalParticipations, icon: Trophy, color: 'from-orange-500 to-orange-600' },
    ]

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 mt-1">Welcome to Yantraksh Admin Panel</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => (
                    <div
                        key={stat.label}
                        className="stats-card card animate-slideIn"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">{stat.label}</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {loading ? '-' : stat.value}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                                <stat.icon className="text-white" size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Admin Actions */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Admin Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Make Admin */}
                    <button
                        onClick={() => setShowMakeAdmin(true)}
                        className="card hover:border-primary-500/60 flex items-center gap-4 text-left transition-all"
                    >
                        <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                            <UserPlus className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Make Admin</h3>
                            <p className="text-sm text-gray-400">Promote user to admin</p>
                        </div>
                    </button>

                    {/* Get All Admins */}
                    <button
                        onClick={() => setShowAllAdmins(true)}
                        className="card hover:border-primary-500/60 flex items-center gap-4 text-left transition-all"
                    >
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                            <Shield className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Get All Admins</h3>
                            <p className="text-sm text-gray-400">{admins.length} active admins</p>
                        </div>
                    </button>

                    {/* Grant Requests */}
                    <button
                        onClick={() => {
                            fetchAdminRequests()
                            setShowGrantRequests(true)
                        }}
                        className="card hover:border-primary-500/60 flex items-center gap-4 text-left transition-all"
                    >
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                            <CheckCircle className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Grant Requests</h3>
                            <p className="text-sm text-gray-400">Approve admin requests</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Make Admin Modal */}
            {showMakeAdmin && (
                <div className="modal-overlay" onClick={() => setShowMakeAdmin(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-white">Make Admin</h3>
                            <button onClick={() => setShowMakeAdmin(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Select User
                            </label>
                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="input"
                            >
                                <option value="">Choose a user...</option>
                                {nonAdmins.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowMakeAdmin(false)}
                                className="flex-1 btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMakeAdmin}
                                disabled={!selectedUser || actionLoading}
                                className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {actionLoading && <Loader2 size={18} className="animate-spin" />}
                                Make Admin
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* All Admins Modal */}
            {showAllAdmins && (
                <div className="modal-overlay" onClick={() => setShowAllAdmins(false)}>
                    <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-white">All Admins ({admins.length})</h3>
                            <button onClick={() => setShowAllAdmins(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {admins.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">No admins found</p>
                            ) : (
                                admins.map(admin => (
                                    <div key={admin.id} className="flex items-center gap-3 p-3 rounded-lg bg-dark-300">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                            <span className="text-white font-semibold">
                                                {admin.name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{admin.name}</p>
                                            <p className="text-sm text-gray-400">{admin.email}</p>
                                        </div>
                                        <div className="ml-auto">
                                            <span className="px-2 py-1 text-xs rounded-full bg-primary-500/20 text-primary-300">
                                                ADMIN
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => setShowAllAdmins(false)}
                            className="w-full mt-6 btn-secondary"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Grant Requests Modal */}
            {showGrantRequests && (
                <div className="modal-overlay" onClick={() => setShowGrantRequests(false)}>
                    <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-white">Admin Requests</h3>
                            <button onClick={() => setShowGrantRequests(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {adminRequests.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">No pending requests</p>
                            ) : (
                                adminRequests.map(request => (
                                    <div key={request.id} className="p-4 rounded-lg bg-dark-300">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                                                <span className="text-white font-semibold">
                                                    {request.user?.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{request.user?.name}</p>
                                                <p className="text-sm text-gray-400">{request.user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAdminRequest(request.id, 'approve')}
                                                disabled={actionLoading}
                                                className="flex-1 btn-primary py-2 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={18} />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleAdminRequest(request.id, 'reject')}
                                                disabled={actionLoading}
                                                className="flex-1 btn-danger py-2 flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={18} />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => setShowGrantRequests(false)}
                            className="w-full mt-6 btn-secondary"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
