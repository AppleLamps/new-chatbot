'use client'

import { useState, useRef, useEffect } from 'react'

interface Model {
  id: string
  name: string
  contextLength: number
}

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
}

const MODELS: Model[] = [
  { id: 'openai/gpt-5', name: 'GPT-5', contextLength: 400000 },
  { id: 'openai/gpt-5-chat', name: 'GPT-5 Chat', contextLength: 128000 },
  { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5', contextLength: 1000000 },
  { id: 'anthropic/claude-opus-4.1', name: 'Claude Opus 4.1', contextLength: 200000 },
  { id: 'thedrummer/cydonia-24b-v4.1', name: 'Cydonia 24B v4.1', contextLength: 131072 },
  { id: 'moonshotai/kimi-k2-0905', name: 'Kimi K2', contextLength: 262144 },
  { id: 'google/gemini-2.5-flash-preview-09-2025', name: 'Gemini 2.5 Flash', contextLength: 1048576 },
  { id: 'google/gemini-2.5-flash-image-preview', name: 'Gemini 2.5 Flash Image Preview', contextLength: 1048576 },
  { id: 'x-ai/grok-4-fast', name: 'Grok-4 Fast', contextLength: 2000000 },
  { id: 'z-ai/glm-4.6', name: 'GLM-4.6', contextLength: 202752 },
]

function formatContextLength(length: number): string {
  if (length >= 1000000) {
    return `${(length / 1000000).toFixed(1)}M`
  } else if (length >= 1000) {
    return `${Math.round(length / 1000)}K`
  }
  return length.toString()
}

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (modelId: string) => {
    onModelChange(modelId)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="glass-light border border-neutral-300/60 dark:border-neutral-600/50 rounded-xl px-4 py-2.5 text-base font-medium text-neutral-700 dark:text-neutral-300 hover:border-brand-600 dark:hover:border-brand-600/60 hover:bg-white/80 dark:hover:bg-neutral-800/60 focus:outline-none focus:ring-2 focus:ring-brand-600/40 focus:border-transparent transition-all duration-200 cursor-pointer shadow-elev-1 hover:shadow-elev-2 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5 min-w-[200px]"
        aria-label="Select AI model"
      >
        {/* AI Icon */}
        <svg className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>

        {/* Model Name */}
        <span className="flex-1 text-left truncate">{currentModel.name}</span>

        {/* Dropdown Icon */}
        <svg
          className={`w-4 h-4 text-neutral-500 dark:text-neutral-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-elev-3 overflow-hidden z-50 animate-fade-in-up">
          <div className="max-h-96 overflow-y-auto">
            {MODELS.map((model) => {
              const isSelected = model.id === selectedModel
              return (
                <button
                  type="button"
                  key={model.id}
                  onClick={() => handleSelect(model.id)}
                  className={`w-full px-4 py-3 text-left transition-all duration-200 flex items-start gap-3 ${isSelected
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border-l-4 border-brand-600'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-l-4 border-transparent'
                    }`}
                >
                  {/* Check Icon for selected */}
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                    {isSelected && (
                      <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Model Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{model.name}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {formatContextLength(model.contextLength)} context
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

