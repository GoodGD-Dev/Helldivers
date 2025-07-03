import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../shared/ui/components'
import { Crosshair, Bomb, Shield, Star, TrendingUp } from 'lucide-react'
import { useOverviewStats } from '../core/hooks/useStats'

const HomePage: React.FC = () => {
  const { stats, isLoading } = useOverviewStats()

  const features = [
    {
      title: 'Weapons Arsenal',
      description:
        'Explore primary and secondary weapons with detailed stats and comparisons',
      icon: Crosshair,
      path: '/weapons',
      color: 'text-red-500'
    },
    {
      title: 'Equipment & Stratagems',
      description:
        'Discover throwables and stratagems to dominate the battlefield',
      icon: Bomb,
      path: '/equipment',
      color: 'text-orange-500'
    },
    {
      title: 'Armor Collection',
      description:
        'Browse armor sets and passive abilities for optimal protection',
      icon: Shield,
      path: '/armor',
      color: 'text-blue-500'
    },
    {
      title: 'Perks & Abilities',
      description:
        'Master special perks and abilities to enhance your Helldiver',
      icon: Star,
      path: '/perks',
      color: 'text-purple-500'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Helldivers 2 Arsenal Database
        </h1>
        <p className="text-xl text-gray-800 mb-6">
          Your complete guide to weapons, equipment, armor, and perks in
          Helldivers 2
        </p>
        <div className="flex justify-center items-center space-x-2 text-gray-700">
          <TrendingUp className="h-5 w-5" />
          <span className="text-sm font-medium">
            Stay updated with the latest gear and stats
          </span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <Link key={feature.title} to={feature.path}>
            <Card hover className="p-6 h-full">
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 ${feature.color}`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Database Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-2">
              {isLoading ? '...' : stats.weapons}
            </div>
            <div className="text-sm text-gray-600">Weapons</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-2">
              {isLoading ? '...' : stats.stratagems}
            </div>
            <div className="text-sm text-gray-600">Stratagems</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-2">
              {isLoading ? '...' : stats.armors}
            </div>
            <div className="text-sm text-gray-600">Armor Sets</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-2">
              {isLoading ? '...' : stats.perks}
            </div>
            <div className="text-sm text-gray-600">Perks</div>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Welcome to the Arsenal Database
        </h2>
        <p className="text-gray-700 leading-relaxed">
          This comprehensive database contains detailed information about all
          weapons, equipment, armor, and perks available in Helldivers 2. Use
          the navigation menu to explore different categories and find the
          perfect loadout for your missions. Each item includes detailed
          statistics, descriptions, and relevant gameplay information to help
          you make informed decisions on the battlefield.
        </p>
      </div>
    </div>
  )
}

export default HomePage
