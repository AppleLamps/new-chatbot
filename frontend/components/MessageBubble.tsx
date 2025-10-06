import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import FollowUpSuggestions from './FollowUpSuggestions'

// Memoized markdown content to prevent re-parsing on every render
const MarkdownContent = React.memo(({ content, messageId, onCopyCode, copiedCode }: {
  content: string
  messageId: string
  onCopyCode: (code: string, codeId: string) => void
  copiedCode: string | null
}) => {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert prose-pre:bg-neutral-950 prose-pre:border prose-pre:border-white/10 prose-code:before:content-[''] prose-code:after:content-[''] prose-p:leading-relaxed prose-headings:tracking-tight">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props: any) {
            const { node, inline, className, children, ...rest } = props
            const match = /language-(\w+)/.exec(className || '')
            const codeString = String(children).replace(/\n$/, '')
            const codeId = `${messageId}-${match?.[1] || 'code'}-${codeString.slice(0, 20)}`
            const isCopied = copiedCode === codeId

            return !inline && match ? (
              <div className="relative group my-4">
                {/* Language Label Badge */}
                <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-700/50 rounded-t-xl">
                  <span className="text-xs font-medium text-neutral-300 uppercase tracking-wider">
                    {match[1]}
                  </span>
                  {/* Copy Button with Glass Effect */}
                  <button
                    type="button"
                    onClick={() => onCopyCode(codeString, codeId)}
                    className="glass-dark px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-elev-2 hover:shadow-elev-3 flex items-center gap-2"
                    title={isCopied ? 'Copied!' : 'Copy code'}
                    aria-label={isCopied ? 'Copied!' : 'Copy code'}
                  >
                    {isCopied ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                {/* Code Block with Enhanced Styling */}
                <div className="code-block-wrapper">
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    className="!rounded-t-none !rounded-b-xl !text-sm !my-0 shadow-elev-2"
                    showLineNumbers={true}
                    lineNumberStyle={{
                      minWidth: '3em',
                      paddingRight: '1em',
                      color: '#6b7280',
                      borderRight: '1px solid #374151',
                      marginRight: '1em',
                      userSelect: 'none',
                    }}
                    customStyle={{
                      margin: 0,
                      padding: '1.25rem',
                      background: '#0a0a0a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderTop: 'none',
                    }}
                    codeTagProps={{
                      style: {
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontSize: '0.875rem',
                        lineHeight: '1.7',
                      }
                    }}
                    lineProps={(lineNumber) => ({
                      style: {
                        display: 'block',
                        width: '100%',
                      },
                      className: 'code-line hover:bg-neutral-800/50 transition-colors duration-150 px-2 -mx-2 rounded',
                    })}
                    {...rest}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              </div>
            ) : (
              <code
                className={`${inline ? 'bg-neutral-800 text-neutral-200 px-1 py-0.5 rounded' : ''}`}
                {...rest}
              >
                {children}
              </code>
            )
          },
          p: ({ children }) => (
            <p className="mb-3 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 last:mb-0 ml-4 list-disc">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 last:mb-0 ml-4 list-decimal">{children}</ol>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full text-sm">{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
})

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

interface MessageBubbleProps {
  message: {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    attachments?: Attachment[]
    images?: GeneratedImage[]
  }
  isStreaming?: boolean
  suggestions?: string[]
  isLastMessage?: boolean
  isSuggestionsLoading?: boolean
  onSuggestionClick?: (suggestion: string) => void
  onEditMessage?: (messageId: string, newContent: string) => void
  onRegenerateMessage?: (messageId: string) => void
  messageIndex?: number // For staggered animation delay
}

/**
 * MessageBubble Component
 *
 * Modern tail-less bubble design with:
 * - Clean rectangular bubbles with rounded corners (no tails/arrows)
 * - Subtle shadows for depth (shadow-elev-2, hover:shadow-elev-3)
 * - Glass-morphism effects with backdrop blur
 * - Smooth hover interactions
 * - Proper spacing between consecutive messages (space-y-5 in parent)
 */
export default function MessageBubble({
  message,
  isStreaming = false,
  suggestions = [],
  isSuggestionsLoading = false,
  onSuggestionClick,
  onEditMessage,
  onRegenerateMessage,
  messageIndex = 0
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editContent, setEditContent] = React.useState(message.content)
  const [isSpeaking, setIsSpeaking] = React.useState(false)
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null)
  const [hasAnimated, setHasAnimated] = React.useState(false)
  const [wasStreaming, setWasStreaming] = React.useState(isStreaming)
  const [shouldBounce, setShouldBounce] = React.useState(false)
  const animationDelayClass = React.useMemo(() => {
    const delayClasses = ['message-delay-0', 'message-delay-1', 'message-delay-2', 'message-delay-3']
    const delayIndex = Math.min(Math.max(Math.floor(messageIndex), 0), delayClasses.length - 1)
    return delayClasses[delayIndex]
  }, [messageIndex])

  const handleAnimationEnd = React.useCallback(() => {
    if (!hasAnimated) {
      setHasAnimated(true)
    }
  }, [hasAnimated])

  // Track when streaming completes for smooth transition and bounce effect
  React.useEffect(() => {
    if (wasStreaming && !isStreaming) {
      // Streaming just completed - trigger bounce animation
      setWasStreaming(false)
      setShouldBounce(true)
      // Remove bounce class after animation completes
      const timer = setTimeout(() => {
        setShouldBounce(false)
      }, 400)
      return () => clearTimeout(timer)
    } else if (isStreaming) {
      setWasStreaming(true)
    }
  }, [isStreaming, wasStreaming])

  // Reset animation when a new message is rendered
  React.useEffect(() => {
    setHasAnimated(false)
  }, [message.id])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditContent(message.content)
  }

  const handleSaveEdit = () => {
    if (editContent.trim() && onEditMessage) {
      onEditMessage(message.id, editContent.trim())
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(message.content)
  }

  const handleRegenerate = () => {
    if (onRegenerateMessage) {
      onRegenerateMessage(message.id)
    }
  }

  const handleTextToSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      } else {
        const utterance = new SpeechSynthesisUtterance(message.content)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
        setIsSpeaking(true)
      }
    }
  }

  const handleCopyCode = (code: string, codeId: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(codeId)
      setTimeout(() => setCopiedCode(null), 2000)
    }).catch((err) => {
      console.error('Failed to copy code:', err)
    })
  }

  React.useEffect(() => {
    return () => {
      if (isSpeaking && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const containerClasses = [
    'flex',
    message.role === 'user' ? 'justify-end' : 'justify-start',
    'group',
    hasAnimated ? 'message-animated' : 'message-animate',
  ]

  if (!hasAnimated) {
    containerClasses.push(animationDelayClass)
  }

  return (
    <div className={containerClasses.join(' ')} onAnimationEnd={handleAnimationEnd}>
      <div className="relative max-w-xs lg:max-w-2xl">
        <div
          className={`px-4 py-3 transition-all duration-300 ease-out ${message.role === 'user'
            ? 'rounded-3xl bg-gradient-to-br from-brand-600/90 to-brand-700/90 backdrop-blur-sm text-white border border-brand-500/20 shadow-elev-2 hover:shadow-elev-3 hover:scale-[1.01] hover:from-brand-600 hover:to-brand-700'
            : 'rounded-2xl backdrop-blur-sm bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/50 dark:border-neutral-700/40 text-neutral-900 dark:text-neutral-100 shadow-elev-2 hover:shadow-elev-3 hover:scale-[1.01] hover:bg-white/90 dark:hover:bg-neutral-800/90'
            } ${isStreaming ? 'opacity-90 scale-[0.995]' : 'opacity-100 scale-100'} ${shouldBounce ? 'animate-bounce-complete' : ''}`}
        >
          {isEditing ? (
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-accent-blue-600 dark:border-accent-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-accent-blue-500 dark:focus:ring-accent-blue-500 text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800"
                rows={3}
                placeholder="Edit your message"
                aria-label="Edit message"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-xs bg-accent-blue-600 text-white rounded hover:bg-accent-blue-700 transition-colors duration-200"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-xs bg-neutral-300 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded hover:bg-neutral-400 dark:hover:bg-neutral-500 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Display attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mb-3 space-y-2">
                  {message.attachments.map((attachment) => (
                    <div key={attachment.id}>
                      {attachment.mimetype.startsWith('image/') ? (
                        <img
                          src={attachment.url}
                          alt={attachment.filename}
                          className="max-w-xs rounded-2xl"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-2 bg-white dark:bg-neutral-600 rounded-xl border border-neutral-300 dark:border-neutral-500">
                          <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-body-sm font-medium text-neutral-800 dark:text-neutral-100">{attachment.filename}</p>
                            <p className="text-caption text-neutral-500 dark:text-neutral-400">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Display generated images */}
              {message.images && message.images.length > 0 && (
                <div className="mb-3 space-y-2">
                  {message.images.map((image, index) => (
                    <div key={index}>
                      <img
                        src={image.image_url.url}
                        alt={`Generated image ${index + 1}`}
                        className="max-w-md rounded-2xl border border-gray-200"
                      />
                    </div>
                  ))}
                </div>
              )}

              {message.role === 'assistant' ? (
                <MarkdownContent
                  content={message.content}
                  messageId={message.id}
                  onCopyCode={handleCopyCode}
                  copiedCode={copiedCode}
                />
              ) : (
                <p className="whitespace-pre-wrap text-body leading-relaxed">{message.content}</p>
              )}

              <p
                className={`text-caption mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}
              >
                {formatTime(message.timestamp)}
                {isStreaming && ' • Typing...'}
              </p>

              {/* Follow-up suggestions for assistant messages */}
              {message.role === 'assistant' && onSuggestionClick && (
                <FollowUpSuggestions
                  suggestions={suggestions}
                  onSuggestionClick={onSuggestionClick}
                  isLoading={isSuggestionsLoading}
                />
              )}
            </>
          )}
        </div>

        {/* Action buttons (Edit/Regenerate) - Fade in smoothly when streaming completes */}
        {!isStreaming && !isEditing && (
          <div className={`flex gap-1 mt-1 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {message.role === 'user' && onEditMessage && (
              <button
                onClick={handleStartEdit}
                className="p-1 backdrop-blur-sm bg-white/80 dark:bg-neutral-700/80 hover:bg-white/95 dark:hover:bg-neutral-700/95 rounded-lg border border-neutral-300/60 dark:border-neutral-600/50 transition-all duration-300 ease-out hover:scale-110 shadow-elev-1 hover:shadow-elev-2"
                title="Edit message"
                aria-label="Edit message"
              >
                <svg className="w-3 h-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            {message.role === 'assistant' && onRegenerateMessage && (
              <button
                onClick={handleRegenerate}
                className="p-1 backdrop-blur-sm bg-white/80 dark:bg-neutral-700/80 hover:bg-white/95 dark:hover:bg-neutral-700/95 rounded-lg border border-neutral-300/60 dark:border-neutral-600/50 transition-all duration-300 ease-out hover:scale-110 shadow-elev-1 hover:shadow-elev-2"
                title="Regenerate response"
                aria-label="Regenerate response"
              >
                <svg className="w-3 h-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
            {message.role === 'assistant' && 'speechSynthesis' in window && (
              <button
                onClick={handleTextToSpeech}
                className={`p-1 rounded-lg border transition-all duration-300 ease-out hover:scale-110 shadow-elev-1 hover:shadow-elev-2 ${isSpeaking
                  ? 'bg-accent-blue-600 text-white border-accent-blue-600 animate-pulse-soft hover:bg-accent-blue-700'
                  : 'backdrop-blur-sm bg-white/80 dark:bg-neutral-700/80 hover:bg-white/95 dark:hover:bg-neutral-700/95 border-neutral-300/60 dark:border-neutral-600/50'
                  }`}
                title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
              >
                <svg className={`w-3 h-3 transition-colors ${isSpeaking ? 'text-white' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
