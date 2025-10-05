'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useToast } from './ToastProvider'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  onError: (error: string) => void
}

export default function VoiceInput({ onTranscript, onError }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const { showToast } = useToast()

  useEffect(() => {
    // Check if Web Speech API is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          onTranscript(transcript)
          setIsListening(false)
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          const message = `Speech recognition error: ${event.error}`
          onError(message)
          showToast(message, { type: 'error' })
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onTranscript, onError])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      const message = 'Speech recognition not supported in this browser'
      onError(message)
      showToast(message, { type: 'error' })
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error('Error starting recognition:', error)
        const message = 'Failed to start speech recognition'
        onError(message)
        showToast(message, { type: 'error' })
      }
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <button
      onClick={toggleListening}
      className={`p-2 rounded-lg transition-colors ${
        isListening
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'btn-ghost text-gray-600 dark:text-gray-400'
      }`}
      title={isListening ? 'Stop recording' : 'Voice input'}
    >
      {isListening ? (
        <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  )
}

