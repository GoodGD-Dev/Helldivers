import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hover = false
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-md overflow-hidden'
  const hoverClasses = hover
    ? 'hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200'
    : ''
  const clickableClasses = onClick ? 'cursor-pointer' : ''

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Card
