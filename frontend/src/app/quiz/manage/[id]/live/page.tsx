'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function LivePage() {
  const { id } = useParams()
  const router = useRouter()

  const [participants, setParticipants] = useState<string[]>([])
  const [count, setCount] = useState(0)

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/quiz/${id}`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.event === 'update' || data.event === 'current_participants') {
        setParticipants(data.names)
        setCount(data.count)
      }
    }

    ws.onclose = () => console.log('WebSocket отключён')

    return () => ws.close()
  }, [id])

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
        
        <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
            Live результаты
        </h1>

        <Button
            variant="outline"
            className="hover:bg-gray-100 transition"
            onClick={() => router.push('/dashboard')}
        >
            ← Назад
        </Button>
        </div>

        <Card className="shadow-md border border-gray-100">
        <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
            Сейчас проходят тест: 
            <span className="ml-2 text-green-600 font-bold">{count}</span>
            </CardTitle>
        </CardHeader>

        <CardContent className="pt-2">
            {participants.length === 0 ? (
            <p className="text-gray-400 text-center py-8 text-sm">
                Ожидание участников...
            </p>
            ) : (
            <div className="space-y-3">
                {participants.map((name, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 transition rounded-xl"
                >
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />

                    <span className="font-medium text-gray-700">
                    {name}
                    </span>
                </div>
                ))}
            </div>
            )}
        </CardContent>
        </Card>

    </div>
    )
}