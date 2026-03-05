import { create } from 'zustand'

type User = {
    id: number
    email: string
    name: string
}

type AuthStore = {
    token: string | null
    user: User | null
    setToken: (token: string) => void
    setUser: (user: User) => void
    logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
    token: null,
    user: null,

    setToken: (token) => {
        localStorage.setItem('token', token)
        document.cookie = `token=${token}; path=/`
        set({ token })
    },
    setUser: (user) => set({ user }),
    logout: () => {
        localStorage.removeItem('token')
        document.cookie = `token=; path=/; max-age=0`
        set({ token: null, user: null })
    }
}))