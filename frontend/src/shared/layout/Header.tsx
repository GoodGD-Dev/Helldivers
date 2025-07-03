import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Menu } from 'lucide-react'

const Header: React.FC = () => {
  return (
    <header className="bg-yellow-500 shadow-lg border-b-4 border-yellow-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-gray-900" />
              <span className="text-xl font-bold text-gray-900">
                Helldivers 2 Arsenal
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/weapons"
              className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Weapons
            </Link>
            <Link
              to="/equipment"
              className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Equipment
            </Link>
            <Link
              to="/armor"
              className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Armor
            </Link>
            <Link
              to="/perks"
              className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Perks
            </Link>
          </nav>

          <div className="md:hidden">
            <Menu className="h-6 w-6 text-gray-900" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
