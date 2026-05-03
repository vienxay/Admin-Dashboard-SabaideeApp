import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
})

// ── Token interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ✅ ເພີ່ມ: Response interceptor — log ທຸກ request
api.interceptors.response.use(
  (response) => {
    console.log(
      `%c✅ API Connected %c${response.config.method?.toUpperCase()} ${response.config.url} %c${response.status}`,
      'color: #00d4aa; font-weight: bold;',
      'color: #94a3b8;',
      'color: #00d4aa; font-weight: bold;'
    )
    return response
  },
  (error) => {
    console.error(
      `%c❌ API Error %c${error.config?.method?.toUpperCase()} ${error.config?.url} %c${error.response?.status || 'Network Error'}`,
      'color: #ef4444; font-weight: bold;',
      'color: #94a3b8;',
      'color: #ef4444; font-weight: bold;'
    )
    return Promise.reject(error)
  }
)

// ✅ ເພີ່ມ: ກວດ connection ຕອນ startup
export const checkConnection = async () => {
  try {
    await api.get('/wallet/rate') // ໃຊ້ endpoint ທີ່ບໍ່ຕ້ອງ auth
    console.log(
      '%c🚀 API Connected Successfully!',
      'color: #00d4aa; font-size: 14px; font-weight: bold;'
    )
    console.log(
      `%c📡 Base URL: ${api.defaults.baseURL}`,
      'color: #475569; font-size: 12px;'
    )
    return true
  } catch {
    console.error(
      '%c❌ API Connection Failed!',
      'color: #ef4444; font-size: 14px; font-weight: bold;'
    )
    console.error(
      `%c📡 Base URL: ${api.defaults.baseURL}`,
      'color: #ef4444; font-size: 12px;'
    )
    return false
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const login = async (email, password) => {
  const res  = await api.post('/auth/login', { email, password })
  const role = res.data?.user?.role
  if (!['admin', 'staff'].includes(role)) {
    throw new Error('ທ່ານບໍ່ມີສິດເຂົ້າ Dashboard')
  }
  return res
}

// ── KYC ──────────────────────────────────────────────────────────────────
export const getKycList = (status = 'pending') => api.get(`/kyc/list?status=${status}`)
export const reviewKyc  = (userId, status, reviewNote = '') =>
  api.put(`/kyc/verify/${userId}`, { status, reviewNote })

// ── Users ─────────────────────────────────────────────────────────────────
export const getUsers   = ()                => api.get('/admin/users')
export const updateRole = (userId, role)    => api.put(`/admin/users/${userId}/role`, { role })
export const deleteUser = (userId)          => api.delete(`/admin/users/${userId}`)

// ✅ ເພີ່ມ
export const hasAdmin      = ()                           => api.get('/admin/has-admin')
export const setupAdmin    = (name, email, password)      => api.post('/admin/setup', { name, email, password })
export const createStaff   = (name, email, password)      => api.post('/admin/create-staff', { name, email, password })

// ── Rate + Stats ──────────────────────────────────────────────────────────
export const getRate  = () => api.get('/admin/rate')
export const getStats = () => api.get('/admin/stats')

export default api