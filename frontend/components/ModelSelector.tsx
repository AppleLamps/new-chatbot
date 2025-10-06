'use client'

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
  { id: 'anthropic/claude-3-haiku:beta', name: 'Claude 3 Haiku (beta)', contextLength: 200000 },
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
  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0]

  return (
    <div className="relative group">
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 dark:text-gray-300 hover:border-brand-600 dark:hover:border-brand-600/60 focus:outline-none focus:ring-2 focus:ring-brand-600/40 focus:border-transparent transition-all duration-200 cursor-pointer"
        title={`${currentModel.name} - ${formatContextLength(currentModel.contextLength)} context`}
      >
        {MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name} ({formatContextLength(model.contextLength)})
          </option>
        ))}
      </select>

      {/* Custom dropdown icon */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Tooltip with full model details */}
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg">
        <div className="font-semibold mb-1">{currentModel.name}</div>
        <div className="text-gray-300 dark:text-gray-400">
          Context: {currentModel.contextLength.toLocaleString()} tokens
        </div>
        <div className="text-gray-400 dark:text-gray-500 text-[10px] mt-1">
          {currentModel.id}
        </div>
        {/* Arrow */}
        <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
      </div>
    </div>
  )
}

