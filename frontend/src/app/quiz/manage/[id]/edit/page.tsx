'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Option = {
  id: number
  text: string
  is_correct: boolean
}

type Question = {
  id: number
  text: string
  type: string
  order_index: number
  options: Option[]
}

type Quiz = {
  id: number
  title: string
  description: string
  share_code: string
}

export default function EditQuizPage() {
  const { id } = useParams()
  const router = useRouter()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  const [newQuestion, setNewQuestion] = useState({
    text: '',
    type: 'single',
    options: [
      {text: '', is_correct: false },
      { text: '', is_correct: false }
    ]
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizRes, questionRes] = await Promise.all([
          api.get(`/quizzes/${id}`),
          api.get(`/quizzes/${id}/questions`)
        ])
        setQuiz(quizRes.data)
        setQuestions(questionRes.data)
      } catch(error) {
        console.error(error)
      } finally{
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const addOption = () => {
    setNewQuestion(prev => ({
      ...prev,
      options: [...prev.options, { text: '', is_correct: false }]
    }))
  }

  const updateOption = (index: number, field: string, value: string | boolean) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? { ...opt, [field]: value } : opt)
    }))
  }

  const submitQuestion = async () => {
    if (!newQuestion.text.trim()) {
      alert('Введите текст вопроса')
      return
    }

    const emptyOption = newQuestion.options.some(opt => !opt.text.trim())
    if(emptyOption) {
      alert('Заполните все варианты ответов')
      return
    }

    const hasCorrect = newQuestion.options.some(opt => opt.is_correct)
    if(!hasCorrect) {
      alert('Выберите хотя бы один правильный ответ')
      return
    }
    
    try{
      const res = await api.post(`/quizzes/${id}/questions`, newQuestion)
      setQuestions(prev => [...prev, res.data])
      setNewQuestion({
        text: '',
        type: 'single',
        options: [
          { text: '', is_correct: false },
          { text: '', is_correct: false }
        ]
      })
    } catch(error){
      console.error(error)
    }
  }

  const deleteQuestion = async (questionId: number) => {
    try{
      const res = await api.delete(`/quizzes/${id}/questions/${questionId}`)
      setQuestions(prev => prev.filter(q => q.id != questionId))
    } catch(error) {
      console.error(error)
    }
  }

  return (
  <div className="max-w-3xl mx-auto px-4 py-10">
    {loading && <p className="text-center text-gray-400">Загрузка...</p>}

    {quiz && (
      <div className="mb-10">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            ← Назад
          </Button>
        </div>
        <p className="text-sm text-gray-400">
          Ссылка для прохождения:{' '}
          <span className="font-mono text-blue-500">/quiz/{quiz.share_code}</span>
        </p>
      </div>
    )}

    {/* Список вопросов */}
    <div className="space-y-4 mb-10">
      {questions.length === 0 && (
        <p className="text-center text-gray-400 py-8">Вопросов пока нет</p>
      )}
      {questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-4">
              <CardTitle className="text-base font-medium">
                {index + 1}. {question.text}
              </CardTitle>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteQuestion(question.id)}
              >
                Удалить
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {question.options.map(option => (
                <div key={option.id} className="flex items-center gap-2 text-sm">
                  <span>{option.is_correct ? '✅' : '⬜'}</span>
                  <span className={option.is_correct ? 'font-medium' : 'text-gray-500'}>
                    {option.text}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Форма добавления вопроса */}
    <Card>
      <CardHeader>
        <CardTitle>Добавить вопрос</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1">
          <Label>Текст вопроса</Label>
          <Input
            value={newQuestion.text}
            onChange={e => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
            placeholder="Введите вопрос"
          />
        </div>

        <div className="space-y-2">
          <Label>Варианты ответов</Label>
          {newQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={option.is_correct}
                onChange={e => updateOption(index, 'is_correct', e.target.checked)}
                className="w-4 h-4"
              />
              <Input
                value={option.text}
                onChange={e => updateOption(index, 'text', e.target.value)}
                placeholder={`Вариант ${index + 1}`}
              />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addOption} className="mt-1">
            + Добавить вариант
          </Button>
        </div>

        <Button onClick={submitQuestion} className="w-full">
          Добавить вопрос
        </Button>
      </CardContent>
    </Card>
  </div>
)
}