import { useState, useEffect } from 'react'
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Loader2,
    ShoppingBag,
    Search,
    Package
} from 'lucide-react'
import { merchAPI } from '../lib/api'

interface MerchItem {
    id: string
    name: string
    description?: string
    price: number
    stock: number
    sizes: string[]
    image?: string
    createdAt: string
}

const initialFormData = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    sizes: [] as string[],
    image: '',
}

const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export default function Merchandise() {
    const [items, setItems] = useState<MerchItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState(initialFormData)
    const [actionLoading, setActionLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        setLoading(true)
        try {
            const response = await merchAPI.getAll()
            setItems(response.data.data || [])
        } catch (error) {
            console.error('Error fetching merchandise:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setActionLoading(true)

        const data = {
            name: formData.name,
            description: formData.description || undefined,
            price: Number(formData.price),
            stock: Number(formData.stock),
            sizes: formData.sizes,
            image: formData.image || undefined,
        }

        try {
            if (editingId) {
                await merchAPI.update(editingId, data)
            } else {
                await merchAPI.create(data)
            }
            await fetchItems()
            closeModal()
        } catch (error) {
            console.error('Error saving merchandise:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const handleEdit = (item: MerchItem) => {
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price,
            stock: item.stock,
            sizes: item.sizes || [],
            image: item.image || '',
        })
        setEditingId(item.id)
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        setActionLoading(true)
        try {
            await merchAPI.delete(id)
            await fetchItems()
            setDeleteConfirm(null)
        } catch (error) {
            console.error('Error deleting merchandise:', error)
        } finally {
            setActionLoading(false)
        }
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingId(null)
        setFormData(initialFormData)
    }

    const toggleSize = (size: string) => {
        const newSizes = formData.sizes.includes(size)
            ? formData.sizes.filter(s => s !== size)
            : [...formData.sizes, size]
        setFormData({ ...formData, sizes: newSizes })
    }

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Merchandise</h1>
                    <p className="text-gray-400 mt-1">Manage store items and inventory</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    Add Item
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                    type="text"
                    placeholder="Search merchandise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-12"
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-primary-500" size={40} />
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="mx-auto text-gray-500 mb-4" size={48} />
                    <p className="text-gray-400">No merchandise found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="card group">
                            {/* Image */}
                            <div className="relative mb-4 rounded-lg overflow-hidden bg-dark-300 aspect-square">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ShoppingBag className="text-gray-600" size={48} />
                                    </div>
                                )}
                                {/* Stock badge */}
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${item.stock > 10
                                        ? 'bg-green-500/20 text-green-300'
                                        : item.stock > 0
                                            ? 'bg-yellow-500/20 text-yellow-300'
                                            : 'bg-red-500/20 text-red-300'
                                    }`}>
                                    {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                                </div>
                            </div>

                            {/* Details */}
                            <h3 className="font-semibold text-white mb-1">{item.name}</h3>
                            {item.description && (
                                <p className="text-sm text-gray-400 mb-2 line-clamp-2">{item.description}</p>
                            )}
                            <p className="text-xl font-bold text-primary-400 mb-3">₹{item.price}</p>

                            {/* Sizes */}
                            {item.sizes && item.sizes.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {item.sizes.map(size => (
                                        <span key={size} className="px-2 py-1 text-xs rounded bg-dark-300 text-gray-400">
                                            {size}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="flex-1 btn-secondary py-2 flex items-center justify-center gap-1"
                                >
                                    <Pencil size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(item.id)}
                                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-white">
                                {editingId ? 'Edit Item' : 'Add Item'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input"
                                    placeholder="Product name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input min-h-[80px]"
                                    placeholder="Product description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Price (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="input"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Stock</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                                        className="input"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Sizes</label>
                                <div className="flex flex-wrap gap-2">
                                    {availableSizes.map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => toggleSize(size)}
                                            className={`px-4 py-2 rounded-lg border transition-colors ${formData.sizes.includes(size)
                                                    ? 'bg-primary-500 border-primary-500 text-white'
                                                    : 'bg-dark-300 border-dark-100 text-gray-400 hover:border-primary-500'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
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
                        <h3 className="text-xl font-semibold text-white mb-4">Delete Item</h3>
                        <p className="text-gray-400 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
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
