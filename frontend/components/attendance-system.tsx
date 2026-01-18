"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Users, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface Student {
  id: string
  name: string
  rollNumber: string
  status: "present" | "absent" | "late" | "pending"
  timestamp?: string
  confidence?: number
}

interface AttendanceSession {
  id: string
  courseCode: string
  courseName: string
  date: string
  startTime: string
  endTime: string
  totalStudents: number
  presentCount: number
  absentCount: number
  lateCount: number
}

export default function AttendanceSystem() {
  const [isRecording, setIsRecording] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)

  const faceapiRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<number | null>(null)

  const [students, setStudents] = useState<Student[]>([
    { id: "1", name: "Alice Johnson", rollNumber: "CS001", status: "pending" },
    { id: "2", name: "Bob Smith", rollNumber: "CS002", status: "pending" },
    { id: "3", name: "Carol Davis", rollNumber: "CS003", status: "pending" },
    { id: "4", name: "David Wilson", rollNumber: "CS004", status: "pending" },
    { id: "5", name: "Harisankar", rollNumber: "CS005", status: "pending" },
    { id: "6", name: "Deepankar Sharma", rollNumber: "CS006", status: "pending" },
    { id: "7", name: "Deepan Bomb", rollNumber: "CS007", status: "pending" },
    { id: "8", name: "Alwin", rollNumber: "CS008", status: "pending" },
    { id: "9", name: "Abishek Kandan", rollNumber: "CS009", status: "pending" },
    { id: "10", name: "Harini Narayanasamay", rollNumber: "CS010", status: "pending" },
  ])

  const [sessions] = useState<AttendanceSession[]>([
    {
      id: "1",
      courseCode: "CS101",
      courseName: "Introduction to Programming",
      date: "2024-01-15",
      startTime: "09:00",
      endTime: "10:30",
      totalStudents: 25,
      presentCount: 23,
      absentCount: 2,
      lateCount: 0,
    },
  ])

  // 🔥 FIXED: lazy load face-api (NO SSR CRASH)
  useEffect(() => {
    const loadFaceApi = async () => {
      const faceapi = await import("face-api.js")
      faceapiRef.current = faceapi

      const MODEL_URL = "/models"
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)

      setModelsLoaded(true)
      console.log("face-api loaded")
    }

    loadFaceApi()
  }, [])

  const startFacialRecognition = async () => {
    if (!modelsLoaded) return

    setIsRecording(true)

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
    })

    if (videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.onplay = () => {
        if (canvasRef.current) {
          canvasRef.current.width = videoRef.current!.videoWidth
          canvasRef.current.height = videoRef.current!.videoHeight
        }
        intervalRef.current = window.setInterval(detectFaces, 1500)
      }
    }
  }

  const stopFacialRecognition = () => {
    setIsRecording(false)
    if (intervalRef.current) clearInterval(intervalRef.current)

    const tracks = (videoRef.current?.srcObject as MediaStream)?.getTracks()
    tracks?.forEach((t) => t.stop())
  }

  const detectFaces = async () => {
    const faceapi = faceapiRef.current
    if (!faceapi || !videoRef.current || !canvasRef.current) return

    const detections = await faceapi.detectAllFaces(
      videoRef.current,
      new faceapi.TinyFaceDetectorOptions()
    )

    const ctx = canvasRef.current.getContext("2d")
    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    if (detections.length > 0) {
      setStudents((prev) => {
        const pending = prev.filter((s) => s.status === "pending")
        if (!pending.length) return prev

        const chosen = pending[Math.floor(Math.random() * pending.length)]
        return prev.map((s) =>
          s.id === chosen.id
            ? { ...s, status: "present", timestamp: new Date().toLocaleTimeString() }
            : s
        )
      })
    }
  }

  const presentCount = students.filter((s) => s.status === "present").length
  const lateCount = students.filter((s) => s.status === "late").length
  const absentCount = students.filter((s) => s.status === "absent").length
  const pendingCount = students.filter((s) => s.status === "pending").length

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Smart Attendance System</h2>
        {!isRecording ? (
          <Button onClick={startFacialRecognition} disabled={!modelsLoaded}>
            <Camera className="mr-2 h-4 w-4" /> Start Recognition
          </Button>
        ) : (
          <Button variant="destructive" onClick={stopFacialRecognition}>
            Stop
          </Button>
        )}
      </div>

      <video ref={videoRef} autoPlay muted className="hidden" />
      <canvas ref={canvasRef} className="absolute top-0 left-0" />

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent>{presentCount} Present</CardContent></Card>
        <Card><CardContent>{lateCount} Late</CardContent></Card>
        <Card><CardContent>{absentCount} Absent</CardContent></Card>
        <Card><CardContent>{pendingCount} Pending</CardContent></Card>
      </div>
    </div>
  )
}
