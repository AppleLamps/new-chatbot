import React, { useState } from 'react'

interface ChatSession {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
}

interface ChatListProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onNewChat: () => void
  onRenameSession: (sessionId: string, newTitle: string) => void
  onDeleteSession: (sessionId: string) => void
  isCollapsed: boolean
  onToggleCollapse: (collapsed: boolean) => void
  isMobileSidebarOpen?: boolean
  onCloseMobileSidebar?: () => void
}

export default function ChatList({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onDeleteSession,
  isCollapsed,
  onToggleCollapse,
  isMobileSidebarOpen = false,
  onCloseMobileSidebar
}: ChatListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleStartEdit = (session: ChatSession) => {
    setEditingId(session.id)
    setEditTitle(session.title)
  }

  const handleSaveEdit = (sessionId: string) => {
    if (editTitle.trim()) {
      onRenameSession(sessionId, editTitle.trim())
    }
    setEditingId(null)
    setEditTitle('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  // Filter sessions based on search query
  const filteredSessions = sessions.filter(session => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase()
    const titleMatch = session.title.toLowerCase().includes(query)

    return titleMatch
  })

  if (isCollapsed) {
    return (
      <div className="hidden lg:flex fixed left-0 top-0 h-full w-14 glass-light border-r border-neutral-200/60 dark:border-neutral-700/50 p-2 flex-col items-center z-10 transition-all duration-300 ease-in-out">
        <button
          onClick={() => onToggleCollapse(false)}
          className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-200"
          title="Expand sidebar"
        >
          <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className={`fixed left-0 top-0 h-full w-80 glass-light border-r border-neutral-200/60 dark:border-neutral-700/50 flex flex-col z-30 transition-all duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
      {/* Header */}
      <div className="p-5 border-b border-neutral-200/60 dark:border-neutral-700/50 flex justify-between items-center">
        <h2 className="text-subheading text-neutral-800 dark:text-neutral-200">Chats</h2>
        <div className="flex gap-2">
          {/* Close button for mobile */}
          <button
            onClick={onCloseMobileSidebar}
            className="lg:hidden p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
            title="Close menu"
          >
            <svg className="w-4 h-4 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Collapse button for desktop */}
          <button
            onClick={() => onToggleCollapse(true)}
            className="hidden lg:block p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
            title="Collapse sidebar"
          >
            <svg className="w-4 h-4 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            aria-label="Search chats"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors duration-200"
              title="Clear search"
              aria-label="Clear search"
            >
              <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat Sessions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-label text-gray-700 dark:text-gray-300 mb-1">No chats yet</h3>
            <p className="text-caption text-gray-500 dark:text-gray-400 mb-4">Start a conversation by clicking the button above</p>
            <button
              onClick={onNewChat}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" />
              </svg>
              <span>Start Your First Chat</span>
            </button>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-label text-gray-700 dark:text-gray-300 mb-1">No results found</h3>
            <p className="text-caption text-gray-500 dark:text-gray-400 mb-3">Try a different search term</p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-lg transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isActive = session.id === currentSessionId
            return (
              <div
                key={session.id}
                className={`relative group rounded-lg transition-all duration-200 ease-out ${isActive
                  ? 'bg-brand-50 dark:bg-brand-900/20 border-l-4 border-brand-600 shadow-sm'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent hover:shadow-md hover:scale-[1.02]'
                  }`}
              >
                {editingId === session.id ? (
                  <div className="p-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(session.id)
                        if (e.key === 'Escape') handleCancelEdit()
                      }}
                      className="w-full px-2 py-1 text-sm border border-blue-500 dark:border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="Enter chat title"
                      aria-label="Chat title"
                      autoFocus
                    />
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => handleSaveEdit(session.id)}
                        className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 px-2 py-1 text-xs bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onSelectSession(session.id)}
                      className="w-full p-4 text-left"
                    >
                      <div className={`text-body-sm font-medium truncate mb-1 transition-colors duration-200 ${isActive
                        ? 'text-brand-700 dark:text-brand-400'
                        : 'text-gray-800 dark:text-gray-200'
                        }`}>
                        {session.title}
                      </div>
                      <div className="text-caption text-gray-500 dark:text-gray-400 flex justify-between">
                        <span>{session.messageCount} messages</span>
                        <span>{formatDate(session.updatedAt)}</span>
                      </div>
                    </button>

                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hidden group-hover:flex gap-1 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartEdit(session)
                        }}
                        className="p-1 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded shadow-sm transition-all duration-200 hover:scale-110"
                        title="Rename chat"
                      >
                        <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (window.confirm('Are you sure you want to delete this chat?')) {
                            onDeleteSession(session.id)
                          }
                        }}
                        className="p-1 bg-white dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900 rounded shadow-sm transition-all duration-200 hover:scale-110"
                        title="Delete chat"
                      >
                        <svg className="w-3 h-3 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-caption text-gray-500 dark:text-gray-400 text-center">
          {searchQuery ? (
            <>
              {filteredSessions.length} of {sessions.length} {sessions.length === 1 ? 'chat' : 'chats'}
            </>
          ) : (
            <>
              {sessions.length} {sessions.length === 1 ? 'chat' : 'chats'}
            </>
          )}
        </p>
      </div>
    </div>
  )
}

