import { create } from 'zustand'
import api from '../services/api'

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,

  loadUser: () => {
    const user = localStorage.getItem('user')
    if (user) set({ user: JSON.parse(user) })
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('user', JSON.stringify(res.data.data))
      set({ user: res.data.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true })
    try {
      const res = await api.post('/auth/register', { name, email, password })
      localStorage.setItem('user', JSON.stringify(res.data.data))
      set({ user: res.data.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: async () => {
    await api.get('/auth/logout')
    localStorage.removeItem('user')
    set({ user: null })
  }
}))