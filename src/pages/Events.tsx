import { useState, useEffect } from 'react'
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Loader2,
    Calendar,
    Search
} from 'lucide-react'
import { competitionsAPI } from '../lib/api'

interface Competition {
    id: string
    title: string
    category: string
    prize: string
    type: 'SOLO' | 'TEAM'
    image: string
    specs: string[]
    createdAt: string
}

const initialFormData = {
    title: '',
    category: '',
    prize: '',
    type: 'SOLO' as 'SOLO' | 'TEAM',
    image: '',
    specs: [''],
}

export default function Events() {
    const [competitions, setCompetitions] = useState<Competition[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState(initialFormData)
    const [actionLoading, setActionLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    useEffect(() => {
        fetchCompetitions()
    }, [])

    const fetchCompetitions = async () => {
        setLoading(true)
        try {
            const response = await competitionsAPI.getAll()
            setCompetitions(response.data.data || [])
        } catch (error) {
            console.error('Error fetching competitions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setActionLoading(true)

        const data = {
            ...formData,
            specs: formData.specs.filter(s => s.trim() !== ''),
        }

        try {
            if (editingId) {
                await competitionsAPI.update(editingId, data)
            } else {
                await competitionsAPI.create(data)
            }
            await fetchCompetitions()
            closeModal()
        } catch (error) {
            console.error('Error saving competition:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleEdit = (competition: Competition) => {
        setFormData({
            title: competition.title,
            category: competition.category,
            prize: competition.prize,
            type: competition.type,
            image: competition.image,
            specs: competition.specs.length > 0 ? competition.specs : [''],
        })
        setEditingId(competition.id)
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        setActionLoading(true)
        try {
            await competitionsAPI.delete(id)
            await fetchCompetitions()
            setDeleteConfirm(null)
        } catch (error) {
            console.error('Error deleting competition:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingId(null)
        setFormData(initialFormData)
    }

    const addSpec = () => {
        setFormData({ ...formData, specs: [...formData.specs, ''] })
    }

    const updateSpec = (index: number, value: string) => {
        const newSpecs = [...formData.specs]
        newSpecs[index] = value
        setFormData({ ...formData, specs: newSpecs })
    }

    const removeSpec = (index: number) => {
        const newSpecs = formData.specs.filter((_, i) => i !== index)
        setFormData({ ...formData, specs: newSpecs.length > 0 ? newSpecs : [''] })
    }

    const filteredCompetitions = competitions.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Events</h1>
                    <p className="text-gray-400 mt-1">Manage competitions and events</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    Add Event
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-12"
                />
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
                                <th>Event</th>
                                <th>Category</th>
                                <th>Type</th>
                                <th>Prize</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCompetitions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-400">
                                        No events found
                                    </td>
                                </tr>
                            ) : (
                                filteredCompetitions.map((competition) => (
                                    <tr key={competition.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                {competition.image ? (
                                                    <img
                                                        src={competition.image}
                                                        alt={competition.title}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                                                        <Calendar className="text-primary-400" size={20} />
                                                    </div>
                                                )}
                                                <span className="font-medium text-white">{competition.title}</span>
                                            </div>
                                        </td>
                                        <td>{competition.category}</td>
                                        <td>
                                            <span className={`px-2 py-1 text-xs rounded-full ${competition.type === 'SOLO'
                                                    ? 'bg-blue-500/20 text-blue-300'
                                                    : 'bg-green-500/20 text-green-300'
                                                }`}>
                                                {competition.type}
                                            </span>
                                        </td>
                                        <td>{competition.prize}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(competition)}
                                                    className="p-2 rounded-lg hover:bg-primary-500/20 text-gray-400 hover:text-primary-400 transition-colors"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(competition.id)}
                                                    className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-white">
                                {editingId ? 'Edit Event' : 'Create Event'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input"
                                    placeholder="Event title"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="input"
                                        placeholder="e.g., Technical"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'SOLO' | 'TEAM' })}
                                        className="input"
                                    >
                                        <option value="SOLO">Solo</option>
                                        <option value="TEAM">Team</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Prize</label>
                                <input
                                    type="text"
                                    value={formData.prize}
                                    onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                                    className="input"
                                    placeholder="e.g., ₹10,000"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="input"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Specifications</label>
                                {formData.specs.map((spec, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={spec}
                                            onChange={(e) => updateSpec(index, e.target.value)}
                                            className="input"
                                            placeholder="Specification"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeSpec(index)}
                                            className="p-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addSpec}
                                    className="text-sm text-primary-400 hover:text-primary-300"
                                >
                                    + Add specification
                                </button>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="flex-1 btn-secondary">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                                >
                                    {actionLoading && <Loader2 size={18} className="animate-spin" />}
                                    {editingId ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-white mb-4">Delete Event</h3>
                        <p className="text-gray-400 mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-secondary">
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                disabled={actionLoading}
                                className="flex-1 btn-danger flex items-center justify-center gap-2"
                            >
                                {actionLoading && <Loader2 size={18} className="animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
