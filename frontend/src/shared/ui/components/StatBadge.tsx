import React from 'react'

interface StatBadgeProps {
  label: string
  value: string | number
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray'
  className?: string
}

const StatBadge: React.FC<StatBadgeProps> = ({
  label,
  value,
  color = 'gray',
  className = ''
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800'
  }

  return (
    <div
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]} ${className}`}
    >
      <span className="font-semibold">{label}:</span>
      <span className="ml-1">{value}</span>
    </div>
  )
}

export default StatBadge
