import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { deletePatient } from '../api/patientApi'
import toast from 'react-hot-toast'
import LoadingSpinner from './LoadingSpinner'

export default function DeleteConfirmModal({ patient, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deletePatient(patient.id)
      toast.success(`${patient.name} has been deleted`)
      onSuccess()
      onClose()
    } catch {
      toast.error('Failed to delete patient')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 text-red-600 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Delete Patient</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-slate-600 mb-6">
          Are you sure you want to delete <span className="font-semibold text-slate-800">{patient.name}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {loading && <LoadingSpinner size="sm" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
