import React from 'react'

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'filled' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  size = 'md',
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  const baseClasses =
    'w-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500'

  const variantClasses = {
    default: 'border border-gray-300 bg-white focus:border-yellow-500',
    filled: 'border-0 bg-gray-100 focus:bg-white focus:ring-1',
    outlined: 'border-2 border-gray-300 bg-transparent focus:border-yellow-500'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg'
  }

  const iconPadding = {
    sm: leftIcon ? 'pl-9' : rightIcon ? 'pr-9' : '',
    md: leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '',
    lg: leftIcon ? 'pl-12' : rightIcon ? 'pr-12' : ''
  }

  const errorClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : ''

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">{leftIcon}</div>
          </div>
        )}

        <input
          id={inputId}
          className={`
            ${baseClasses}
            ${variantClasses[variant]}
            ${sizeClasses[size]}
            ${iconPadding[size]}
            ${errorClasses}
            ${props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
            rounded-md
            ${className}
          `}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">{rightIcon}</div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}

export default Input
