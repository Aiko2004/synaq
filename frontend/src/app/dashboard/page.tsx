'use client'

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import api from '@/lib/api'

type Quiz = {
    id: number
    title: string
    description: string
    is_public: boolean
    share_code: string
}

export default function DashboardPage() {
    const router = useRouter()
    const { logout } = useAuthStore()
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        const fetchQuizzes = async() => {
            try {
                const res = await api.get('/quizzes/')
                setQuizzes(res.data)
            } catch(error) {
                console.error(error)
            }
            finally{
                setLoading(false)
            }
        }
        fetchQuizzes()
    }, [])

    return (
        <div className="container mx-auto px-6 py-10">

            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight">
                    Мои тесты
                </h1>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            logout()
                            router.push('/login')
                        }}
                    >
                        Выйти
                    </Button>
                    <Button
                        onClick={() => router.push('/quiz/create')}
                        className="h-11 px-6"
                    >
                        + Создать тест
                    </Button>
                </div>
            </div>

            {loading && (
                <p className="text-gray-400 text-center py-10">
                    Загрузка...
                </p>
            )}

            {!loading && quizzes?.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    У вас пока нет тестов
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes?.map((quiz) => (
                    <Card
                    key={quiz.id}
                    className="shadow-sm hover:shadow-md transition border border-gray-100"
                    >
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                        {quiz.title}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <p className="text-gray-500 text-sm leading-relaxed min-h-[40px]">
                        {quiz.description || 'Без описания'}
                        </p>

                        <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Код теста</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {quiz.share_code}
                        </span>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <div className="grid grid-cols-2 gap-2 pt-2">
                            <Button
                                variant="outline"
                                className="h-10"
                                onClick={() => router.push(`/quiz/manage/${quiz.id}/edit`)}
                            >
                                Редактировать
                            </Button>

                            <Button
                                className="h-10"
                                onClick={() => router.push(`/quiz/manage/${quiz.id}/live`)}
                            >
                                Live
                            </Button>
                            </div>
                        </div>
                    </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
};
