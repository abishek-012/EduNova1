"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot } from "lucide-react"

// TypeScript fix for custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": any
    }
  }
}

export default function AIAssistant() {
  useEffect(() => {
    // Load Eleven Labs script once
    if (!document.getElementById("elevenlabs-widget")) {
      const script = document.createElement("script")
      script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed"
      script.async = true
      script.id = "elevenlabs-widget"
      document.body.appendChild(script)
    }
  }, [])

  return (
    <Card className="h-[600px] max-w-md mx-auto flex flex-col shadow-md rounded-2xl overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Study Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center p-0">
        {/* Eleven Labs Embed */}
        <elevenlabs-convai
          agent-id="agent_4001k5vjrs41ep4sa466f8bh9jc4"
          style={{
            width: "400px",
            height: "600px",
            border: "none",
            borderRadius: "16px",
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
          }}
        ></elevenlabs-convai>
      </CardContent>
    </Card>
  )
}