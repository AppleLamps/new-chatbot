'use client'

import React, { useRef, useState } from 'react'
import { useToast } from './ToastProvider'

interface UploadedFile {
  id: string
  filename: string
  mimetype: string
  size: number
  url: string
  extractedText?: string
}

interface FileUploadProps {
  onFileUploaded: (file: UploadedFile) => void
  onError: (error: string) => void
}

export default function FileUpload({ onFileUploaded, onError }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      uploadFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      uploadFile(files[0])
    }
  }

  const uploadFile = async (file: File) => {
    // Validate file type
    const allowedTypes = [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      // Documents
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      // Text formats
      'text/plain', // TXT
      'text/markdown', // MD
      'text/csv', // CSV
      'application/json', // JSON
      'text/html', // HTML
      'application/xml', 'text/xml', // XML
      'application/rtf', 'text/rtf' // RTF
    ]

    // Also validate by file extension (some browsers don't properly detect MIME types)
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'docx', 'txt', 'md', 'csv', 'json', 'html', 'xml', 'rtf']

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
      const message = 'Invalid file type. Supported formats: Images (JPEG, PNG, GIF, WebP), Documents (PDF, DOCX), and Text files (TXT, MD, CSV, JSON, HTML, XML, RTF).'
      onError(message)
      showToast(message, { type: 'error' })
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      const message = 'File too large. Maximum size is 10MB.'
      onError(message)
      showToast(message, { type: 'error' })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      // Attempt to parse JSON only if the response is JSON; otherwise read text
      const contentType = response.headers.get('content-type') || ''
      let data: any = null
      if (contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        if (!response.ok) {
          throw new Error(text || 'Upload failed')
        }
        try {
          data = JSON.parse(text)
        } catch {
          data = { success: false, error: text }
        }
      }

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      if (data.success && data.file) {
        onFileUploaded(data.file)
      }
    } catch (error) {
      console.error('Upload error:', error)
      const message = error instanceof Error ? error.message : 'Failed to upload file'
      onError(message)
      showToast(message, { type: 'error' })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,.md,.csv,.json,.html,.xml,.rtf"
        onChange={handleFileSelect}
        className="hidden"
        title="Upload file"
        aria-label="Upload file"
      />
      
      <button
        onClick={handleClick}
        disabled={isUploading}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Upload image or document"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        )}
      </button>

      {isDragging && (
        <div className="fixed inset-0 bg-brand-600/20 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border-2 border-brand-600 dark:border-brand-600/70">
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200">Drop file to upload</p>
          </div>
        </div>
      )}
    </div>
  )
}

