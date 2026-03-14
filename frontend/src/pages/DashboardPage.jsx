import { useState, useEffect, useCallback } from 'react'
import { Users, UserPlus, Plus } from 'lucide-react'
import Navbar from '../components/Navbar'
import PatientTable from '../components/PatientTable'
import PatientFormModal from '../components/PatientFormModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import StatsCard from '../components/StatsCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { getPatients } from '../api/patientApi'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [editPatient, setEditPatient] = useState(null)
  const [deletePatient, setDeletePatient] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  const fetchPatients = useCallback(async () => {
    try {
      const data = await getPatients()
      setPatients(data)
    } catch {
      toast.error('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const recentCount = patients.filter((p) => {
    const date = new Date(p.registeredDate)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return date >= thirtyDaysAgo
  }).length

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Patient Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage and monitor patient records</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-700 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Patient
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <StatsCard title="Total Patients" value={patients.length} icon={Users} color="indigo" />
          <StatsCard title="Last 30 Days" value={recentCount} icon={UserPlus} color="teal" />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-24">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <PatientTable
            patients={patients}
            onEdit={setEditPatient}
            onDelete={setDeletePatient}
          />
        )}
      </main>

      {/* Modals */}
      {showCreate && (
        <PatientFormModal
          onClose={() => setShowCreate(false)}
          onSuccess={fetchPatients}
        />
      )}
      {editPatient && (
        <PatientFormModal
          patient={editPatient}
          onClose={() => setEditPatient(null)}
          onSuccess={fetchPatients}
        />
      )}
      {deletePatient && (
        <DeleteConfirmModal
          patient={deletePatient}
          onClose={() => setDeletePatient(null)}
          onSuccess={fetchPatients}
        />
      )}
    </div>
  )
}
