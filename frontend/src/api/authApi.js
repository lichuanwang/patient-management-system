import axiosInstance from './axiosInstance'

export const login = async (email, password) => {
  const response = await axiosInstance.post('/auth/login', { email, password })
  return response.data
}

export const validateToken = async () => {
  const response = await axiosInstance.get('/auth/validate')
  return response.data
}
