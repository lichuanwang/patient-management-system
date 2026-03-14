import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { createPatient, updatePatient } from '../api/patientApi'
import toast from 'react-hot-toast'
import LoadingSpinner from './LoadingSpinner'

export default function PatientFormModal({ patient, onClose, onSuccess }) {
  const isEdit = Boolean(patient)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: isEdit
      ? {
          name: patient.name,
          email: patient.email,
          dateOfBirth: patient.dateOfBirth,
          address: patient.address,
        }
      : {},
  })

  useEffect(() => {
    if (isEdit) {
      reset({
        name: patient.name,
        email: patient.email,
        dateOfBirth: patient.dateOfBirth,
        address: patient.address,
      })
    }
  }, [patient, isEdit, reset])

  const onSubmit = async (data) => {
    setLoading(true)
    setServerError(null)
    try {
      if (isEdit) {
        await updatePatient(patient.id, data)
        toast.success('Patient updated successfully')
      } else {
        const payload = { ...data, registeredDate: new Date().toISOString().slice(0, 10) }
        await createPatient(payload)
        toast.success('Patient created successfully')
      }
      onSuccess()
      onClose()
    } catch (err) {
      const errData = err.response?.data
      if (errData && typeof errData === 'object' && errData.message) {
        setServerError(errData.message)
      } else if (errData && typeof errData === 'object') {
        const messages = Object.values(errData).join(', ')
        setServerError(messages)
      } else {
        setServerError('An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (hasError) =>
    `w-full rounded-lg border px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 transition ${
      hasError
        ? 'border-red-400 focus:ring-red-200'
        : 'border-slate-200 focus:ring-primary-200 focus:border-primary-400'
    }`

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEdit ? 'Edit Patient' : 'New Patient'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              {...register('name', {
                required: 'Name is required',
                maxLength: { value: 100, message: 'Max 100 characters' },
              })}
              className={inputClass(errors.name)}
              placeholder="Jane Doe"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
              })}
              className={inputClass(errors.email)}
              placeholder="jane@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
            <input
              type="date"
              {...register('dateOfBirth', { required: 'Date of birth is required' })}
              className={inputClass(errors.dateOfBirth)}
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <input
              {...register('address', { required: 'Address is required' })}
              className={inputClass(errors.address)}
              placeholder="123 Main St, City, State"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 font-medium text-sm flex items-center gap-2 disabled:opacity-60"
            >
              {loading && <LoadingSpinner size="sm" />}
              {isEdit ? 'Save Changes' : 'Create Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
