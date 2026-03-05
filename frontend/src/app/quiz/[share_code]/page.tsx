'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'


type Option = {
  id: number
  text: string
}

type Question = {
  id: number
  text: string
  type: string
  options: Option[]
}

type Quiz = {
  id: number
  title: string
  description: string
}

export default function QuizPage() {
  const { share_code } = useParams()
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  const [step, setStep] = useState<'name' | 'quiz' | 'result'>('name')
  const [userName, setUserName] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<{ question_id: number, option_id: number }[]>([])
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizRes = await api.get(`/quiz/${share_code}`)
        setQuiz(quizRes.data)
        
        const questionsRes = await api.get(`/quiz/${share_code}/questions`)
        setQuestions(questionsRes.data)
      } catch(error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchQuiz()
  }, [share_code])

  const startQuiz = async () => {
    if(!userName.trim()) return
    await api.post(`/quiz/${share_code}/start`, { user_name: userName })
    setStep('quiz')
  }

  const selectAnswer = (questionId: number, optionId: number) => {
    setAnswers(prev => {
      const exists = prev.find(a => a.question_id === questionId)
      if(exists) {
        return prev.map(a => a.question_id === questionId ? { ...a, option_id: optionId } : a)
      }

      return [...prev, { question_id: questionId, option_id: optionId }]
    })
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const submitQuiz = async () => {
    try {
       const res = await api.post(`/quiz/${share_code}/submit`, {
        user_name: userName,
        answers
       })
       setScore(res.data.score)
       setStep('result')
    } catch(e) {
      console.error(e)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gray-50">
      <div className="w-full max-w-lg">

        {/* Шаг 1 — ввод имени */}
        {step === 'name' && (
          <Card className="shadow-lg border border-gray-100">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold">
                {quiz?.title}
              </CardTitle>

              {quiz?.description && (
                <p className="text-sm text-gray-500 leading-relaxed">
                  {quiz.description}
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Ваше имя</Label>
                <Input
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder="Введите имя"
                  className="h-11"
                />
              </div>

              <Button
                onClick={startQuiz}
                className="w-full h-11 text-base"
              >
                Начать тест
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Шаг 2 — вопросы */}
        {step === 'quiz' && questions.length > 0 && (
          <Card className="shadow-lg border border-gray-100">
            <CardHeader className="space-y-3">

              <div className="flex justify-between text-sm text-gray-400">
                <span>Вопрос {currentIndex + 1}</span>
                <span>{questions.length}</span>
              </div>

              {/* прогресс */}
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-2 transition-all"
                  style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`
                  }}
                />
              </div>

              <CardTitle className="text-lg leading-snug">
                {questions[currentIndex].text}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {questions[currentIndex].options.map(option => {
                const isSelected =
                  answers.find(a => a.question_id === questions[currentIndex].id)
                    ?.option_id === option.id

                return (
                  <div
                    key={option.id}
                    onClick={() =>
                      selectAnswer(questions[currentIndex].id, option.id)
                    }
                    className={`p-4 rounded-xl border cursor-pointer transition-all text-sm ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    {option.text}
                  </div>
                )
              })}

              <div className="pt-3">
                {currentIndex < questions.length - 1 ? (
                  <Button
                    onClick={nextQuestion}
                    className="w-full h-11"
                  >
                    Следующий →
                  </Button>
                ) : (
                  <Button
                    onClick={submitQuiz}
                    className="w-full h-11"
                  >
                    Завершить тест
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Шаг 3 — результат */}
        {step === 'result' && (
          <Card className="shadow-lg border border-gray-100">
            <CardHeader>
              <CardTitle className="text-xl">Результат</CardTitle>
            </CardHeader>

            <CardContent className="text-center space-y-6 py-8">
              <p className="text-6xl font-bold text-blue-600">
                {score}/{questions.length}
              </p>

              <p className="text-gray-500">
                Правильных ответов
              </p>

              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full h-11"
              >
                Пройти снова
              </Button>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}