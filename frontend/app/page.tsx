"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import DotGrid from "@/components/DotGrid"

export default function HomePage() {
  const { login, user, isAuthChecked } = useAuth()
  const router = useRouter()
  const [loginForm, setLoginForm] = useState({ email: "", password: "", role: "" })
  const [isLoading, setIsLoading] = useState(false)

  // 🔹 Redirect if already logged in
  if (user && isAuthChecked) {
    router.push(`/dashboard/${user.role}`)
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const success = await login(loginForm.email, loginForm.password)

    if (!success) {
      alert("Invalid credentials")
    }

    setIsLoading(false)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <DotGrid
          dotSize={10}
          gap={15}
          baseColor="#5227FF"
          activeColor="#5227FF"
          proximity={140}
          shockRadius={200}
          shockStrength={20}
          resistance={200}
          returnDuration={1.5}
        />
      </div>

      <header className="relative z-20 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">EduNova</h1>
              <p className="text-sm text-gray-400">The Future Classroom</p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-20 container mx-auto px-4 py-10">
        <div className="max-w-md mx-auto">
          <Card className="border border-white/40 bg-emerald-900/30 backdrop-blur-3xl shadow-2xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold text-white mb-2">Sign In</CardTitle>
              <CardDescription className="text-white/90">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white">Email</Label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="h-12 text-white border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    className="h-12 text-white border-gray-300 focus:border-blue-500 dark:focus:border-blue-400"
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </div>

                {/* 🔹 Role dropdown kept for UI only (backend decides role) */}
                <div className="space-y-2">
                  <Label className="text-white">Role</Label>
                  <Select
                    value={loginForm.role}
                    onValueChange={(value) => setLoginForm({ ...loginForm, role: value })}
                  >
                    <SelectTrigger className="h-12 text-white border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin" className="bg-white text-black hover:bg-black hover:text-white focus:bg-black focus:text-white data-[state=checked]:bg-black data-[state=checked]:text-white">Admin</SelectItem>
                      <SelectItem value="teacher" className="bg-white text-black hover:bg-black hover:text-white focus:bg-black focus:text-white data-[state=checked]:bg-black data-[state=checked]:text-white">Teacher</SelectItem>
                      <SelectItem value="student" className="bg-white text-black hover:bg-black hover:text-white focus:bg-black focus:text-white data-[state=checked]:bg-black data-[state=checked]:text-white">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="text-center pt-4">
                <p className="text-white">
                  Need an account?{" "}
                  <Link href="/signup" className="text-blue-400">
                    Contact your administrator
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
