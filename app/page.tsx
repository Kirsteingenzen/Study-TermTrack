"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { QuizDashboard } from "@/components/quiz-dashboard"
import { QuizInterface } from "@/components/quiz-interface"

export default function Home() {
  const [user, setUser] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<"dashboard" | "quiz">("dashboard")

  useEffect(() => {
    const savedUser = localStorage.getItem("studyTermTrackUser")
    if (savedUser) {
      setUser(savedUser)
    }
  }, [])

  const handleLogin = (email: string) => {
    setUser(email)
    localStorage.setItem("studyTermTrackUser", email)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("studyTermTrackUser")
    setCurrentView("dashboard")
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ST</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Study TermTrack</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user}</span>
              <button onClick={handleLogout} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "dashboard" ? (
          <QuizDashboard onStartQuiz={() => setCurrentView("quiz")} />
        ) : (
          <QuizInterface onBackToDashboard={() => setCurrentView("dashboard")} />
        )}
      </main>
    </div>
  )
}
