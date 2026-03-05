'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const createQuizSchema = z.object({
    title: z.string().min(3, 'Название минимум 3 символов'),
    description: z.string().optional(),
    is_public: z.boolean().default(false)
})

type CreateQuizForm = z.infer<typeof createQuizSchema>

export default function CreateQuizPage() {
    const router = useRouter()

    const { register, handleSubmit, formState: { errors } } = useForm<CreateQuizForm>({
        resolver: zodResolver(createQuizSchema) as any
    })

    const onSubmit = async(data: CreateQuizForm) => {
        try {
            const res = await api.post('/quizzes/', data)
            router.push(`/quiz/manage/${res.data.id}/edit`)
        } catch(error) {
            console.error(error)
        }
    }

    return (
  <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gray-50">
    
    <Card className="w-full max-w-md shadow-lg border border-gray-100">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          Создать тест
        </CardTitle>
        <p className="text-sm text-gray-500">
          Заполните информацию о тесте
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <div className="space-y-2">
            <Label>Название</Label>
            <Input
              {...register('title')}
              placeholder="Название теста"
              className="h-11"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Описание</Label>
            <Input
              {...register('description')}
              placeholder="Описание (необязательно)"
              className="h-11"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              {...register('is_public')}
              id="is_public"
              className="w-4 h-4"
            />
            <Label
              htmlFor="is_public"
              className="text-sm text-gray-600 cursor-pointer"
            >
              Публичный тест
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base"
          >
            Создать тест
          </Button>

        </form>
      </CardContent>
    </Card>

  </div>
)
};
