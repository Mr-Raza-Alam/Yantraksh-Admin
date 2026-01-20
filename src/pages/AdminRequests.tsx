import { useState, useEffect } from 'react'
import {
    Loader2,
    ShieldCheck,
    ShieldX,
    UserCheck,
    Clock,
    Mail,
    User
} from 'lucide-react'
import { authAPI } from '../lib/api'

interface AdminRequest {
    id: string
    userId: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    createdAt: string
    user: {
        id: string
        name: string
        email: string
        userType: string | null
    }
}

export default function AdminRequests() {
    const [requests, setRequests] = useState<AdminRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        setLoading(true)
        try {
            const response = await authAPI.getAdminRequests()
            setRequests(response.data.data || [])
        } catch (error) {
            console.error('Error fetching admin requests:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
        setActionLoading(requestId)
        try {
            await authAPI.handleAdminRequest(requestId, action)
            setSuccessMessage(
                action === 'approve'
                    ? 'User has been granted admin access!'
                    : 'Request has been rejected.'
            )
            await fetchRequests()
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (error) {
            console.error('Error handling request:', error)
        } finally {
            setActionLoading(null)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Admin Requests</h1>
                <p className="text-gray-400 mt-1">Review and manage admin access requests</p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
                    <UserCheck size={20} />
                    {successMessage}
                </div>
            )}

            {/* Stats Card */}
            <div className="card py-4 px-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary-500/20">
                    <ShieldCheck className="text-primary-400" size={24} />
                </div>
                <div>
                    <p className="text-2xl font-bold text-white">{requests.length}</p>
                    <p className="text-sm text-gray-400">Pending Requests</p>
                </div>
            </div>

            {/* Requests List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-primary-500" size={40} />
                </div>
            ) : requests.length === 0 ? (
                <div className="card py-12 text-center">
                    <ShieldCheck className="mx-auto text-gray-500 mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-white mb-2">No Pending Requests</h3>
                    <p className="text-gray-400">
                        All admin access requests have been processed.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {requests.map((request) => (
                        <div
                            key={request.id}
                            className="card hover:border-primary-500/40 transition-all duration-300"
                        >
                            {/* User Info */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-semibold text-lg">
                                        {request.user.name?.charAt(0).toUpperCase() || '?'}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-white truncate">
                                        {request.user.name}
                                    </h3>
                                    <div className="flex items-center gap-1 text-sm text-gray-400">
                                        <Mail size={14} />
                                        <span className="truncate">{request.user.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <User size={14} className="text-gray-500" />
                                    <span className="text-gray-400">Current Role:</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${request.user.userType === 'AUS_STUDENT'
                                            ? 'bg-green-500/20 text-green-300'
                                            : 'bg-blue-500/20 text-blue-300'
                                        }`}>
                                        {request.user.userType || 'Unknown'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock size={14} className="text-gray-500" />
                                    <span className="text-gray-400">Requested:</span>
                                    <span className="text-gray-300">
                                        {formatDate(request.createdAt)}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleRequest(request.id, 'approve')}
                                    disabled={actionLoading === request.id}
                                    className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading === request.id ? (
                                        <Loader2 className="animate-spin" size={16} />
                                    ) : (
                                        <>
                                            <ShieldCheck size={16} />
                                            Approve
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleRequest(request.id, 'reject')}
                                    disabled={actionLoading === request.id}
                                    className="flex-1 py-2 text-sm rounded-lg border border-red-500/30 
                                             bg-red-500/10 text-red-400 hover:bg-red-500/20 
                                             transition-all duration-300 flex items-center justify-center gap-2
                                             disabled:opacity-50"
                                >
                                    <ShieldX size={16} />
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
