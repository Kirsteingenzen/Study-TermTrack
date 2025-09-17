"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Trophy, Target } from "lucide-react"

interface QuizDashboardProps {
  onStartQuiz: () => void
}

export function QuizDashboard({ onStartQuiz }: QuizDashboardProps) {
  const [recentScores, setRecentScores] = useState<Array<{ score: number; total: number; date: string }>>([])

  useEffect(() => {
    const savedScores = localStorage.getItem("studyTermTrackScores")
    if (savedScores) {
      setRecentScores(JSON.parse(savedScores))
    }
  }, [])

  const averageScore =
    recentScores.length > 0
      ? Math.round(
          recentScores.reduce((sum, score) => sum + (score.score / score.total) * 100, 0) / recentScores.length,
        )
      : 0

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Study TermTrack</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Master your course concepts through interactive quizzes. Test your knowledge with MCQs, fill-in-the-blanks,
          and true/false questions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentScores.length}</div>
            <p className="text-xs text-gray-600">Total completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <p className="text-xs text-gray-600">Across all quizzes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentScores.length * 5}m</div>
            <p className="text-xs text-gray-600">Estimated total</p>
          </CardContent>
        </Card>
      </div>

      {/* Start Quiz Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Ready to Test Your Knowledge?</span>
          </CardTitle>
          <CardDescription>Take a timed quiz with multiple question formats to reinforce your learning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Multiple Choice</Badge>
                <Badge variant="secondary">Fill-in-the-Blank</Badge>
                <Badge variant="secondary">True/False</Badge>
              </div>
              <p className="text-sm text-gray-600">15 seconds per question • Instant feedback</p>
            </div>
            <Button onClick={onStartQuiz} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              Start Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Scores */}
      {recentScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Quiz Results</CardTitle>
            <CardDescription>Your latest quiz performances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentScores
                .slice(-5)
                .reverse()
                .map((score, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Quiz {recentScores.length - index}</p>
                      <p className="text-sm text-gray-600">{score.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {score.score}/{score.total}
                      </p>
                      <p className="text-sm text-gray-600">{Math.round((score.score / score.total) * 100)}%</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
