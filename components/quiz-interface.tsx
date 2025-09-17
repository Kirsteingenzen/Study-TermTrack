"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, ArrowLeft } from "lucide-react"

interface Question {
  type: "MCQ" | "FILL" | "TF"
  question: string
  options?: string[]
  correctAnswer: string
}

interface QuizInterfaceProps {
  onBackToDashboard: () => void
}

export function QuizInterface({ onBackToDashboard }: QuizInterfaceProps) {
  const sampleQuestions: Question[] = [
    {
      type: "MCQ",
      question: "What is the capital of the Philippines?",
      options: ["Manila", "Cebu", "Davao", "Iloilo"],
      correctAnswer: "Manila",
    },
    {
      type: "FILL",
      question: "The largest island in the Philippines is _____.",
      correctAnswer: "Luzon",
    },
    {
      type: "TF",
      question: "The Philippines has more than 7,000 islands.",
      correctAnswer: "True",
    },
    {
      type: "MCQ",
      question: "Which programming language is known for web development?",
      options: ["Python", "JavaScript", "C++", "Java"],
      correctAnswer: "JavaScript",
    },
    {
      type: "FILL",
      question: "HTML stands for HyperText _____ Language.",
      correctAnswer: "Markup",
    },
  ]

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [timeLeft, setTimeLeft] = useState(15)
  const [showResult, setShowResult] = useState(false)
  const [resultMessage, setResultMessage] = useState("")
  const [isQuizComplete, setIsQuizComplete] = useState(false)
  const [questions] = useState(sampleQuestions)

  useEffect(() => {
    if (timeLeft > 0 && !showResult && !isQuizComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp()
    }
  }, [timeLeft, showResult, isQuizComplete])

  const handleTimeUp = () => {
    setResultMessage("Time's up! No answer submitted.")
    setShowResult(true)
    setTimeout(() => {
      nextQuestion()
    }, 2000)
  }

  const resetTimer = () => {
    setTimeLeft(15)
  }

  const nextQuestion = useCallback(() => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1)
      setUserAnswer("")
      setShowResult(false)
      setResultMessage("")
      resetTimer()
    } else {
      completeQuiz()
    }
  }, [currentQuestion, questions.length])

  const completeQuiz = () => {
    setIsQuizComplete(true)

    const newScore = {
      score,
      total: questions.length,
      date: new Date().toLocaleDateString(),
    }

    const existingScores = JSON.parse(localStorage.getItem("studyTermTrackScores") || "[]")
    existingScores.push(newScore)
    localStorage.setItem("studyTermTrackScores", JSON.stringify(existingScores))
  }

  const handleSubmit = () => {
    const currentQ = questions[currentQuestion]
    const isCorrect = userAnswer.toLowerCase().trim() === currentQ.correctAnswer.toLowerCase().trim()

    if (isCorrect) {
      setScore(score + 1)
      setResultMessage("Correct!")
    } else {
      setResultMessage(`Incorrect! Correct answer: ${currentQ.correctAnswer}`)
    }

    setShowResult(true)
    setTimeout(() => {
      nextQuestion()
    }, 2000)
  }

  if (isQuizComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-600">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-6xl font-bold text-gray-900">
              {score}/{questions.length}
            </div>
            <div className="text-xl text-gray-600">Final Score: {Math.round((score / questions.length) * 100)}%</div>
            <div className="flex justify-center space-x-4">
              <Button onClick={onBackToDashboard} className="bg-purple-600 hover:bg-purple-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress and Timer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-red-500" />
              <span className="text-red-500 font-bold">{timeLeft}s</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {currentQ.type === "MCQ"
                ? "Multiple Choice"
                : currentQ.type === "FILL"
                  ? "Fill-in-the-Blank"
                  : "True or False"}
            </Badge>
          </div>
          <CardTitle className="text-xl">{currentQ.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQ.type === "MCQ" && (
            <div className="space-y-3">
              {currentQ.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={`option-${index}`}
                    name="mcq-answer"
                    value={option}
                    checked={userAnswer === option}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <label htmlFor={`option-${index}`} className="cursor-pointer text-gray-700">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          )}

          {currentQ.type === "FILL" && (
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="text-lg"
            />
          )}

          {currentQ.type === "TF" && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="true"
                  name="tf-answer"
                  value="True"
                  checked={userAnswer === "True"}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <label htmlFor="true" className="cursor-pointer text-gray-700">
                  True
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="false"
                  name="tf-answer"
                  value="False"
                  checked={userAnswer === "False"}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <label htmlFor="false" className="cursor-pointer text-gray-700">
                  False
                </label>
              </div>
            </div>
          )}

          {/* Result Message */}
          {showResult && (
            <div
              className={`flex items-center space-x-2 p-3 rounded-lg ${
                resultMessage.includes("Correct") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {resultMessage.includes("Correct") ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{resultMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          {!showResult && (
            <Button
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Submit Answer
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Back Button */}
      <div className="text-center">
        <Button variant="outline" onClick={onBackToDashboard}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
