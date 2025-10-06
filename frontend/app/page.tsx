'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import MessageBubble from '../components/MessageBubble'
import { useStreamingChat } from '../components/useStreamingChat'
import ChatList from '../components/ChatList'
import ProjectList, { Project } from '../components/ProjectList'
import FileUpload from '../components/FileUpload'
import VoiceInput from '../components/VoiceInput'
import { useDarkMode } from '../components/useDarkMode'
import LoadingIndicator from '../components/LoadingIndicator'
import ModelSelector from '../components/ModelSelector'
import { useToast } from '../components/ToastProvider'
import { TypingIndicator } from '../components/StatusIndicator'

interface Attachment {
  id: string
  filename: string
  mimetype: string
  size: number
  url: string
  extractedText?: string
}

interface GeneratedImage {
  type: 'image_url'
  image_url: {
    url: string
  }
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
  attachments?: Attachment[]
  images?: GeneratedImage[]
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export default function Home() {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<{ [messageId: string]: string[] }>({})
  const [suggestionsLoading, setSuggestionsLoading] = useState<{ [messageId: string]: boolean }>({})
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [enableImageGeneration, setEnableImageGeneration] = useState<boolean>(false)
  const [enableWebSearch, setEnableWebSearch] = useState<boolean>(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>('anthropic/claude-3-haiku:beta')
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const { messages, isLoading, isStreaming, sendMessage, clearMessages, loadMessages, updateMessage } = useStreamingChat()
  const { theme, toggleTheme } = useDarkMode()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { showToast } = useToast()

  // Generate a title from the first message
  const generateTitle = (firstMessage: string): string => {
    const words = firstMessage.trim().split(' ')
    return words.slice(0, 6).join(' ') + (words.length > 6 ? '...' : '')
  }

  // Load sessions from localStorage on component mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('lampchat_sessions')
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }))
        setSessions(parsedSessions)

        // Load the most recent session
        if (parsedSessions.length > 0) {
          const sortedSessions = [...parsedSessions].sort((a, b) =>
            b.updatedAt.getTime() - a.updatedAt.getTime()
          )
          const mostRecent = sortedSessions[0]
          setCurrentSessionId(mostRecent.id)
          loadMessages(mostRecent.messages)
        }
      } catch (error) {
        console.error('Error loading saved sessions:', error)
      }
    }

    // Load projects from localStorage
    const savedProjects = localStorage.getItem('lampchat_projects')
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects).map((project: any) => ({
          ...project,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt)
        }))
        setProjects(parsedProjects)
      } catch (error) {
        console.error('Error loading saved projects:', error)
      }
    }

    // Load current project ID from localStorage
    const savedProjectId = localStorage.getItem('lampchat_current_project')
    if (savedProjectId) {
      setCurrentProjectId(savedProjectId === 'null' ? null : savedProjectId)
    }
  }, [loadMessages])

  // Save current session when messages change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions(prevSessions => {
        const sessionIndex = prevSessions.findIndex(s => s.id === currentSessionId)
        const updatedSession: ChatSession = {
          id: currentSessionId,
          title: prevSessions[sessionIndex]?.title || generateTitle(messages[0].content),
          messages: messages,
          createdAt: prevSessions[sessionIndex]?.createdAt || new Date(),
          updatedAt: new Date()
        }

        let newSessions: ChatSession[]
        if (sessionIndex >= 0) {
          newSessions = [...prevSessions]
          newSessions[sessionIndex] = updatedSession
        } else {
          newSessions = [updatedSession, ...prevSessions]
        }

        localStorage.setItem('lampchat_sessions', JSON.stringify(newSessions))
        return newSessions
      })
    }
  }, [messages, currentSessionId])

  // Fetch suggestions when assistant messages are completed
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'assistant' && !isStreaming && !suggestions[lastMessage.id]) {
      fetchSuggestions(lastMessage.id)
    }
  }, [messages, isStreaming, suggestions])

  const fetchSuggestions = async (messageId: string) => {
    if (suggestionsLoading[messageId]) return

    setSuggestionsLoading(prev => ({ ...prev, [messageId]: true }))

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      const data = await response.json()

      if (response.ok && data.suggestions) {
        setSuggestions(prev => ({
          ...prev,
          [messageId]: data.suggestions
        }))
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setSuggestionsLoading(prev => ({ ...prev, [messageId]: false }))
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  const scrollToTop = () => {
    messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Detect scroll position to show/hide scroll-to-top button
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight

      // Show button when scrolled up more than 300px from bottom
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      setShowScrollToTop(distanceFromBottom > 300)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [input])

  const handleFileUploaded = (file: Attachment) => {
    // Normalize URL to same-origin path so previews load via Next.js rewrite
    let normalizedUrl = file.url
    try {
      const parsed = new URL(file.url)
      // Use path portion only (e.g., /uploads/filename.jpg)
      normalizedUrl = `${parsed.pathname}${parsed.search}${parsed.hash}`
    } catch (_) {
      // If not a valid absolute URL, keep as-is
    }

    setAttachments(prev => [...prev, { ...file, url: normalizedUrl }])
  }

  const handleFileUploadError = (error: string) => {
    showToast(error, { type: 'error' })
  }

  const handleVoiceTranscript = (text: string) => {
    setInput(prev => prev ? `${prev} ${text}` : text)
  }

  const handleVoiceError = (error: string) => {
    showToast(error, { type: 'error' })
  }

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId))
  }

  const handleSendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return

    const messageContent = input.trim() || 'Attached files'
    const messageAttachments = [...attachments]
    const imageGenerationEnabled = enableImageGeneration

    setInput('')
    setAttachments([])

    // Create new session if none exists
    if (!currentSessionId) {
      const newSessionId = uuidv4()
      setCurrentSessionId(newSessionId)
    }

    // Get system prompt from current project
    const systemPrompt = currentProject?.systemPrompt || undefined

    // Send message with current image generation setting and system prompt
    await sendMessage(messageContent, true, undefined, messageAttachments, imageGenerationEnabled, selectedModel, enableWebSearch, systemPrompt)

    // Auto-disable image generation after sending
    if (imageGenerationEnabled) {
      setEnableImageGeneration(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startNewChat = () => {
    const newSessionId = uuidv4()
    setCurrentSessionId(newSessionId)
    clearMessages()
    setInput('')
    setSuggestions({})
  }

  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      setCurrentSessionId(sessionId)
      loadMessages(session.messages)
      setSuggestions({})
    }
  }

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    setSessions(prevSessions => {
      const newSessions = prevSessions.map(session =>
        session.id === sessionId
          ? { ...session, title: newTitle, updatedAt: new Date() }
          : session
      )
      localStorage.setItem('lampchat_sessions', JSON.stringify(newSessions))
      return newSessions
    })
  }

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prevSessions => {
      const newSessions = prevSessions.filter(s => s.id !== sessionId)
      localStorage.setItem('lampchat_sessions', JSON.stringify(newSessions))

      // If deleting current session, switch to another or create new
      if (sessionId === currentSessionId) {
        if (newSessions.length > 0) {
          const nextSession = newSessions[0]
          setCurrentSessionId(nextSession.id)
          loadMessages(nextSession.messages)
        } else {
          startNewChat()
        }
      }

      return newSessions
    })
  }

  // Export current chat as JSON
  const handleExportChat = () => {
    if (!currentSessionId || messages.length === 0) {
      showToast('No chat to export', { type: 'error' })
      return
    }

    const currentSession = sessions.find(s => s.id === currentSessionId)
    const exportData = {
      title: currentSession?.title || 'Untitled Chat',
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lampchat-${currentSession?.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'export'}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showToast('Chat exported successfully', { type: 'success' })
  }

  // Share current chat (copy link to clipboard)
  const handleShareChat = async () => {
    if (!currentSessionId || messages.length === 0) {
      showToast('No chat to share', { type: 'error' })
      return
    }

    // For now, just copy the session data as a shareable JSON
    // In a real app, this would generate a shareable link
    const currentSession = sessions.find(s => s.id === currentSessionId)
    const shareData = {
      title: currentSession?.title || 'Untitled Chat',
      messageCount: messages.length,
      sessionId: currentSessionId
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(shareData, null, 2))
      showToast('Chat info copied to clipboard', { type: 'success' })
    } catch (error) {
      showToast('Failed to copy to clipboard', { type: 'error' })
    }
  }

  // Open settings (placeholder for now)
  const handleOpenSettings = () => {
    showToast('Settings panel coming soon', { type: 'info' })
  }

  const handleEditMessage = async (messageId: string, newContent: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return

    // Update the message content
    updateMessage(messageId, newContent)

    // Remove all messages after the edited message
    const messagesToKeep = messages.slice(0, messageIndex + 1)
    loadMessages(messagesToKeep.map(m =>
      m.id === messageId ? { ...m, content: newContent } : m
    ))

    const imageGenerationEnabled = enableImageGeneration
    const systemPrompt = currentProject?.systemPrompt || undefined

    // Resend the edited message to get new response
    await sendMessage(newContent, true, messagesToKeep.slice(0, messageIndex), undefined, imageGenerationEnabled, selectedModel, enableWebSearch, systemPrompt)

    // Auto-disable image generation after sending
    if (imageGenerationEnabled) {
      setEnableImageGeneration(false)
    }
  }

  const handleRegenerateMessage = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1 || messageIndex === 0) return

    // Get the user message before this assistant message
    const previousMessages = messages.slice(0, messageIndex)
    const lastUserMessage = [...previousMessages].reverse().find(m => m.role === 'user')

    if (!lastUserMessage) return

    // Remove the assistant message and regenerate
    loadMessages(previousMessages)

    const imageGenerationEnabled = enableImageGeneration
    const systemPrompt = currentProject?.systemPrompt || undefined

    // Resend to generate new response
    await sendMessage(lastUserMessage.content, true, previousMessages.slice(0, -1), undefined, imageGenerationEnabled, selectedModel, enableWebSearch, systemPrompt)

    // Auto-disable image generation after sending
    if (imageGenerationEnabled) {
      setEnableImageGeneration(false)
    }
  }

  const chatListSessions = sessions.map(session => ({
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    messageCount: session.messages.length
  }))

  // Project handlers
  const handleCreateProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setProjects(prev => {
      const updated = [...prev, newProject]
      localStorage.setItem('lampchat_projects', JSON.stringify(updated))
      return updated
    })

    // Automatically select the new project
    setCurrentProjectId(newProject.id)
    localStorage.setItem('lampchat_current_project', newProject.id)
    showToast(`Project "${newProject.name}" created`, { type: 'success' })
  }

  const handleUpdateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => {
      const updated = prev.map(project =>
        project.id === projectId
          ? { ...project, ...updates, updatedAt: new Date() }
          : project
      )
      localStorage.setItem('lampchat_projects', JSON.stringify(updated))
      return updated
    })
    showToast('Project updated', { type: 'success' })
  }

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)

    setProjects(prev => {
      const updated = prev.filter(p => p.id !== projectId)
      localStorage.setItem('lampchat_projects', JSON.stringify(updated))
      return updated
    })

    // If deleting current project, switch to default
    if (projectId === currentProjectId) {
      setCurrentProjectId(null)
      localStorage.setItem('lampchat_current_project', 'null')
    }

    showToast(`Project "${project?.name}" deleted`, { type: 'success' })
  }

  const handleSelectProject = (projectId: string | null) => {
    setCurrentProjectId(projectId)
    localStorage.setItem('lampchat_current_project', projectId || 'null')

    const project = projectId ? projects.find(p => p.id === projectId) : null
    if (project) {
      showToast(`Switched to project: ${project.name}`, { type: 'info' })
    } else {
      showToast('Switched to default chat', { type: 'info' })
    }
  }

  // Get current project
  const currentProject = currentProjectId ? projects.find(p => p.id === currentProjectId) : null

  return (
    <div className="flex h-screen bg-white dark:bg-neutral-800 transition-colors">
      {/* Skip to main content link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Mobile Overlay */}
      {(isMobileSidebarOpen || isProjectSidebarOpen) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => {
            setIsMobileSidebarOpen(false)
            setIsProjectSidebarOpen(false)
          }}
        />
      )}

      {/* Chat List Sidebar */}
      <ChatList
        sessions={chatListSessions}
        currentSessionId={currentSessionId}
        onSelectSession={(sessionId) => {
          handleSelectSession(sessionId)
          setIsMobileSidebarOpen(false)
        }}
        onNewChat={() => {
          startNewChat()
          setIsMobileSidebarOpen(false)
        }}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={setIsSidebarCollapsed}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
      />

      {/* Project List Sidebar - positioned on right side */}
      <div className={`fixed right-0 top-0 h-full w-80 glass-light border-l border-neutral-200/60 dark:border-neutral-700/50 z-30 transition-all duration-300 ease-in-out ${isProjectSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0 lg:${isProjectSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="h-full flex flex-col">
          {/* Close button for mobile */}
          <div className="lg:hidden p-4 border-b border-neutral-200/60 dark:border-neutral-700/50 flex justify-between items-center">
            <h2 className="text-subheading text-neutral-800 dark:text-neutral-200">Projects</h2>
            <button
              onClick={() => setIsProjectSidebarOpen(false)}
              className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
              title="Close projects"
            >
              <svg className="w-4 h-4 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ProjectList
            projects={projects}
            currentProjectId={currentProjectId}
            onSelectProject={(projectId) => {
              handleSelectProject(projectId)
              setIsProjectSidebarOpen(false)
            }}
            onCreateProject={handleCreateProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex flex-col flex-1 w-full lg:max-w-5xl lg:mx-auto bg-white dark:bg-neutral-800 lg:shadow-lg transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-14' : 'lg:ml-80'}`}>
        {/* Header with enhanced glass-morphism */}
        <header className="backdrop-blur-md bg-white/70 dark:bg-neutral-800/70 border-b border-neutral-200/50 dark:border-neutral-700/50 shadow-sm p-4 flex items-center justify-between gap-3 sticky top-0 z-10 transition-all duration-200">
          <div className="flex items-center gap-3">
            {/* Hamburger menu for mobile */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">LampChat</h1>

            {/* Current Project Indicator */}
            {currentProject && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg">
                <svg className="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-brand-700 dark:text-brand-300">{currentProject.name}</span>
              </div>
            )}

            {/* Typing Indicator - shows when AI is generating response */}
            {(isLoading || isStreaming) && (
              <div className="animate-fade-in">
                <TypingIndicator size="sm" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-neutral-300 dark:bg-neutral-600" />

            {/* Quick Action Buttons */}
            <div className="hidden sm:flex items-center gap-1">
              {/* Projects Button */}
              <button
                type="button"
                onClick={() => setIsProjectSidebarOpen(!isProjectSidebarOpen)}
                className={`glass-light border border-neutral-300/60 dark:border-neutral-600/50 p-2 rounded-lg hover:bg-white/80 dark:hover:bg-neutral-800/60 transition-all duration-200 hover:scale-110 active:scale-95 ${currentProjectId ? 'border-brand-600 dark:border-brand-600/60 bg-brand-50/50 dark:bg-brand-900/10' : 'hover:border-brand-600 dark:hover:border-brand-600/60'
                  }`}
                aria-label="Toggle projects"
                title={isProjectSidebarOpen ? 'Hide projects' : 'Show projects'}
              >
                <svg className={`w-5 h-5 ${currentProjectId ? 'text-brand-700 dark:text-brand-400' : 'text-neutral-700 dark:text-neutral-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>

              {/* Export Chat Button */}
              <button
                type="button"
                onClick={handleExportChat}
                disabled={messages.length === 0}
                className="glass-light border border-neutral-300/60 dark:border-neutral-600/50 p-2 rounded-lg hover:bg-white/80 dark:hover:bg-neutral-800/60 hover:border-brand-600 dark:hover:border-brand-600/60 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Export chat"
                title="Export chat as JSON"
              >
                <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>

              {/* Share Chat Button */}
              <button
                type="button"
                onClick={handleShareChat}
                disabled={messages.length === 0}
                className="glass-light border border-neutral-300/60 dark:border-neutral-600/50 p-2 rounded-lg hover:bg-white/80 dark:hover:bg-neutral-800/60 hover:border-brand-600 dark:hover:border-brand-600/60 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Share chat"
                title="Share chat"
              >
                <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>

              {/* Settings Button */}
              <button
                type="button"
                onClick={handleOpenSettings}
                className="glass-light border border-neutral-300/60 dark:border-neutral-600/50 p-2 rounded-lg hover:bg-white/80 dark:hover:bg-neutral-800/60 hover:border-brand-600 dark:hover:border-brand-600/60 transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label="Settings"
                title="Settings"
              >
                <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-neutral-300 dark:bg-neutral-600" />

            {/* Mobile Projects Button */}
            <button
              type="button"
              onClick={() => setIsProjectSidebarOpen(!isProjectSidebarOpen)}
              className={`lg:hidden p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${currentProjectId
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                }`}
              aria-label="Toggle projects"
              title="Projects"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Toggle dark mode"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div
          id="main-content"
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-5 relative"
          role="main"
          aria-label="Chat messages"
        >
          {messages.length === 0 && (
            <div className="max-w-3xl mx-auto mt-8 px-4">
              {/* Welcome Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl mb-4 shadow-elev-3">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h2 className="text-title text-neutral-800 dark:text-neutral-100 mb-2">Welcome to LampChat</h2>
                <p className="text-body text-neutral-600 dark:text-neutral-400">Your intelligent AI assistant with advanced capabilities</p>
              </div>

              {/* Example Prompts */}
              <div className="mb-12">
                <h3 className="text-subheading text-neutral-700 dark:text-neutral-300 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-700 dark:text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Try these examples
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
                      text: "Explain quantum computing in simple terms"
                    },
                    {
                      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
                      text: "Write a creative story about a time traveler"
                    },
                    {
                      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
                      text: "Generate an image of a sunset over mountains"
                    },
                    {
                      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
                      text: "Help me debug this Python code"
                    },
                    {
                      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                      text: "What are the best places to visit in Japan?"
                    },
                    {
                      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
                      text: "Summarize the latest in AI research"
                    }
                  ].map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(prompt.text)}
                      className="group flex items-center gap-3 p-3 card text-left"
                    >
                      <div className="text-brand-700 dark:text-brand-600 shrink-0">
                        {prompt.icon}
                      </div>
                      <span className="text-body-sm text-neutral-700 dark:text-neutral-300">{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-subheading text-neutral-700 dark:text-neutral-300 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-700 dark:text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
                      title: "Image Generation",
                      desc: "Create AI images"
                    },
                    {
                      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>,
                      title: "Voice Input",
                      desc: "Speak your queries"
                    },
                    {
                      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
                      title: "File Upload",
                      desc: "Attach documents"
                    },
                    {
                      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
                      title: "Smart Replies",
                      desc: "Follow-up suggestions"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="flex flex-col items-center text-center p-4 card">
                      <div className="text-brand-700 dark:text-brand-600 mb-2">
                        {feature.icon}
                      </div>
                      <h4 className="text-label text-neutral-800 dark:text-neutral-200 mb-1">{feature.title}</h4>
                      <p className="text-caption text-neutral-600 dark:text-neutral-400">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              messageIndex={index}
              isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
              suggestions={suggestions[message.id] || []}
              isSuggestionsLoading={suggestionsLoading[message.id] || false}
              onSuggestionClick={handleSuggestionClick}
              onEditMessage={handleEditMessage}
              onRegenerateMessage={handleRegenerateMessage}
            />
          ))}

          {isLoading && !isStreaming && <LoadingIndicator showSkeleton={true} />}

          <div ref={messagesEndRef} />

          {/* Scroll to Top Button */}
          {showScrollToTop && (
            <button
              type="button"
              onClick={scrollToTop}
              className="fixed bottom-24 right-8 p-3 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-elev-3 hover:shadow-elev-4 transition-all duration-300 hover:scale-110 active:scale-95 animate-fade-in z-20"
              aria-label="Scroll to top"
              title="Scroll to top"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          )}
        </div>

        {/* Input Area with glass-morphism */}
        <div className="glass-light border-t border-neutral-200/50 dark:border-neutral-700/50 shadow-elev-2 p-4">
          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="relative group"
                >
                  {attachment.mimetype.startsWith('image/') ? (
                    <div className="relative inline-block">
                      <div className="relative rounded-2xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700">
                        <img
                          src={attachment.url}
                          alt={attachment.filename}
                          className="block w-32 h-32 object-cover"
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeAttachment(attachment.id)
                        }}
                        className="absolute -top-2 -right-2 p-1.5 bg-neutral-800 dark:bg-neutral-200 hover:bg-neutral-900 dark:hover:bg-neutral-300 text-white dark:text-neutral-800 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
                        title="Remove image"
                        aria-label="Remove image"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="relative inline-block">
                      <div className="flex items-center gap-3 px-4 py-3 bg-neutral-100 dark:bg-neutral-700 rounded-2xl border-2 border-neutral-200 dark:border-neutral-600 min-w-[200px]">
                        <svg className="w-6 h-6 text-neutral-600 dark:text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-neutral-700 dark:text-neutral-300 text-sm max-w-[150px] truncate">{attachment.filename}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeAttachment(attachment.id)
                        }}
                        className="absolute -top-2 -right-2 p-1.5 bg-neutral-800 dark:bg-neutral-200 hover:bg-neutral-900 dark:hover:bg-neutral-300 text-white dark:text-neutral-800 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
                        title="Remove attachment"
                        aria-label="Remove attachment"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Toolbar with action buttons */}
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-neutral-200/60 dark:border-neutral-700/50">
            <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Actions:</span>
            <FileUpload
              onFileUploaded={handleFileUploaded}
              onError={handleFileUploadError}
            />
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              onError={handleVoiceError}
            />
            <button
              onClick={() => {
                const next = !enableImageGeneration
                setEnableImageGeneration(next)
                // Auto-disable web search when enabling image generation
                if (next && enableWebSearch) setEnableWebSearch(false)
              }}
              className={`btn-ghost shrink-0 ${enableImageGeneration ? 'border-brand-600/40 bg-brand-50 dark:bg-brand-600/10' : ''}`}
              title={enableImageGeneration ? 'Image generation enabled' : 'Enable image generation'}
              aria-label={enableImageGeneration ? 'Disable image generation' : 'Enable image generation'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setEnableWebSearch(!enableWebSearch)}
              className={`btn-ghost shrink-0 ${enableWebSearch ? 'border-brand-600/40 bg-brand-50 dark:bg-brand-600/10' : ''} ${enableImageGeneration ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={enableImageGeneration ? 'Web search disabled during image generation' : (enableWebSearch ? 'Web search enabled' : 'Enable web search')}
              aria-label={enableWebSearch ? 'Disable web search' : 'Enable web search'}
              disabled={enableImageGeneration}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Message input area */}
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message…"
              className="flex-1 resize-none rounded-2xl px-4 py-3 glass-light border border-neutral-300/60 dark:border-neutral-600/50 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-600/40 focus:border-transparent shadow-elev-1 focus:shadow-elev-2 transition-all duration-200 min-h-[44px] max-h-[220px]"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={(!input.trim() && attachments.length === 0) || isLoading}
              className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-2"
            >
              {isLoading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              <span>{isLoading ? 'Sending...' : 'Send'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
