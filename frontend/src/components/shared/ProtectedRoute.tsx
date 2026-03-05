'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"

export default function ProtectedRoute({ children } : { children : React.ReactNode }) {
    const router = useRouter()
    const { token } = useAuthStore()

    useEffect(() => {
        if(!token) {
            const savedToken = localStorage.getItem('token')
            if(!savedToken) {
                router.push('/login')
            }
        }
    }, [token, router])

    return <>{children}</>
};
