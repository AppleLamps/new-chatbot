import SkeletonLoader from './SkeletonLoader'

interface FollowUpSuggestionsProps {
  suggestions: string[]
  onSuggestionClick: (suggestion: string) => void
  isLoading?: boolean
}

export default function FollowUpSuggestions({
  suggestions,
  onSuggestionClick,
  isLoading = false
}: FollowUpSuggestionsProps) {
  if (suggestions.length === 0 && !isLoading) return null

  return (
    <div className="mt-3">
      {isLoading ? (
        <div className="space-y-2">
          <SkeletonLoader variant="suggestion" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="chip max-w-xs truncate"
              title={suggestion}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
