import React, { useState } from 'react'

interface ImageWithPlaceholderProps {
  src?: string
  alt: string
  className?: string
  fallbackIcon?: string
  fallbackText?: string
  fallbackGradient?: string
  onError?: (error: React.SyntheticEvent<HTMLImageElement>) => void
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void
}

const ImageWithPlaceholder: React.FC<ImageWithPlaceholderProps> = ({
  src,
  alt,
  className = 'w-full h-32 object-cover rounded-md',
  fallbackIcon = '🖼️',
  fallbackText = 'No Image Available',
  fallbackGradient = 'from-gray-200 to-gray-300',
  onError,
  onLoad
}) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true)
    setIsLoading(false)
    if (onError) {
      onError(e)
    }
  }

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false)
    if (onLoad) {
      onLoad(e)
    }
  }

  // If no src provided or error occurred, show placeholder
  if (!src || hasError) {
    return (
      <div
        className={`bg-gradient-to-br ${fallbackGradient} ${className} flex items-center justify-center`}
      >
        <div className="text-center text-gray-600">
          <div className="text-2xl mb-2">{fallbackIcon}</div>
          <div className="text-xs">{fallbackText}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div
          className={`bg-gradient-to-br ${fallbackGradient} ${className} flex items-center justify-center absolute inset-0`}
        >
          <div className="text-center text-gray-600">
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-xs">Loading...</div>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  )
}

export default ImageWithPlaceholder
