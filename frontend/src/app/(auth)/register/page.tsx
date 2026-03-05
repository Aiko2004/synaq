'use client'

import { useForm } from 'react-hook-form'
import { zodResolver }  from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const registerSchema = z.object({
    name: z.string().min(2, 'Имя минимум 2 символа'),
    email: z.string().email('Неверный email'),
    password: z.string().min(6, 'Пароль минимум 6 символов')
})

type RegisterForm = z.infer<typeof registerSchema>


export default function RegisterPage() {
    const router = useRouter()
    const { setToken, setUser } = useAuthStore()

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema)
    })

    const onSubmit = async(data: RegisterForm) => {
        try {
            const res = await api.post('/auth/register', data)
            const loginRes = await api.post('/auth/login', {
                email: data.email,
                password: data.password
            })
            setToken(loginRes.data.access_token)
            setUser(res.data)
            router.push('/dashboard')
        } catch(error) {
            console.error(error)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gray-50">
            
            <Card className="w-full max-w-md shadow-lg border border-gray-100">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">
                Регистрация
                </CardTitle>
                <p className="text-sm text-gray-500">
                Создайте новый аккаунт
                </p>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                <div className="space-y-2">
                    <Label>Имя</Label>
                    <Input
                    {...register('name')}
                    placeholder="Ваше имя"
                    className="h-11"
                    />
                    {errors.name && (
                    <p className="text-red-500 text-sm">
                        {errors.name.message}
                    </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Логин</Label>
                    <Input
                    {...register('email')}
                    placeholder="email@example.com"
                    className="h-11"
                    />
                    {errors.email && (
                    <p className="text-red-500 text-sm">
                        {errors.email.message}
                    </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Пароль</Label>
                    <Input
                    {...register('password')}
                    type="password"
                    placeholder="********"
                    className="h-11"
                    />
                    {errors.password && (
                    <p className="text-red-500 text-sm">
                        {errors.password.message}
                    </p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full h-11 text-base"
                >
                    Зарегистрироваться
                </Button>
                <p className="text-sm text-center text-gray-500">
                    Уже есть аккаунт? 
                    <span 
                        className="text-blue-600 cursor-pointer ml-1"
                        onClick={() => router.push('/login')}
                    >
                        Войти
                    </span>
                </p>    
                </form>
            </CardContent>
            </Card>
        </div>
    )
}