import axiosInstance from './axiosInstance'

export const getPatients = async () => {
  const response = await axiosInstance.get('/api/patients')
  return response.data
}

export const createPatient = async (data) => {
  const response = await axiosInstance.post('/api/patients', data)
  return response.data
}

export const updatePatient = async (id, data) => {
  const response = await axiosInstance.put(`/api/patients/${id}`, data)
  return response.data
}

export const deletePatient = async (id) => {
  await axiosInstance.delete(`/api/patients/${id}`)
}
