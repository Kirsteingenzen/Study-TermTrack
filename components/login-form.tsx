"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface LoginFormProps {
  onLogin: (email: string) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("signin")

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.endsWith("@carsu.edu.ph")) {
      setError("Please use your @carsu.edu.ph email address")
      return
    }

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields")
      return
    }

    const users = JSON.parse(localStorage.getItem("carsu_users") || "{}")
    if (!users[email]) {
      setError("Account not found. Please register first.")
      return
    }

    if (users[email].password !== password) {
      setError("Invalid password")
      return
    }

    onLogin(email)
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.endsWith("@carsu.edu.ph")) {
      setError("Please use your @carsu.edu.ph email address")
      return
    }

    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !fullName.trim()) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    const users = JSON.parse(localStorage.getItem("carsu_users") || "{}")
    if (users[email]) {
      setError("Account already exists. Please sign in instead.")
      return
    }

    users[email] = {
      fullName,
      password,
      registeredAt: new Date().toISOString(),
    }
    localStorage.setItem("carsu_users", JSON.stringify(users))

    // Auto sign in after registration
    onLogin(email)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4">
              <Image
                src="/caraga-state-university-logo-with-shield-and-sun-r.jpg"
                alt="Caraga State University Logo"
                width={80}
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Caraga State University</h1>
            <p className="text-gray-600 text-sm">Student To Do List</p>
          </div>

          <div className="w-full mb-6">
            <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab("signin")}
                className={`py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "signin"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-800"
                }`}
                style={{
                  color: activeTab === "signin" ? "#ffffff" : "#374151",
                  backgroundColor: activeTab === "signin" ? "#7c3aed" : "transparent",
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className={`py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "register"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-800"
                }`}
                style={{
                  color: activeTab === "register" ? "#ffffff" : "#374151",
                  backgroundColor: activeTab === "register" ? "#7c3aed" : "transparent",
                }}
              >
                Register
              </button>
            </div>
          </div>

          {activeTab === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">University Email</label>
                <Input
                  type="email"
                  placeholder="your.name@carsu.edu.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-medium py-3"
              >
                Sign In
              </Button>
            </form>
          )}

          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">University Email</label>
                <Input
                  type="email"
                  placeholder="your.name@carsu.edu.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <Input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-medium py-3"
              >
                Register
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Only students with valid @carsu.edu.ph email addresses can access this application.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
