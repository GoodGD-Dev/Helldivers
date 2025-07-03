import React, { useState } from 'react'
import { usePrimaryWeapons, useSecondaryWeapons } from '../core/hooks/useApi'
import {
  Card,
  LoadingSpinner,
  ErrorMessage,
  SearchBar,
  Pagination,
  StatBadge
} from '../shared/ui/components'
import ImageWithPlaceholder from '../shared/ui/components/ImageWithPlaceholder'

const WeaponsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'primary' | 'secondary'>('primary')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 12

  const {
    data: primaryData,
    isLoading: primaryLoading,
    error: primaryError
  } = usePrimaryWeapons({
    page: currentPage,
    limit,
    name: searchTerm || undefined
  })

  const {
    data: secondaryData,
    isLoading: secondaryLoading,
    error: secondaryError
  } = useSecondaryWeapons({
    page: currentPage,
    limit,
    name: searchTerm || undefined
  })

  const isLoading = primaryLoading || secondaryLoading
  const error = primaryError || secondaryError
  const currentData = activeTab === 'primary' ? primaryData : secondaryData

  const renderWeaponCard = (weapon: any) => {
    return (
      <Card key={weapon._id} className="p-4" hover>
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900">
              {weapon.name || 'Unknown'}
            </h3>
            <span className="text-sm text-gray-500 capitalize">
              {weapon.type || 'Unknown'}
            </span>
          </div>

          {weapon.description && (
            <p className="text-sm text-gray-600">{weapon.description}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <StatBadge
              label="Damage"
              value={Number(weapon.damage) || 0}
              color="red"
            />
            <StatBadge
              label="RPM"
              value={Number(weapon.fireRate) || 0}
              color="yellow"
            />
            <StatBadge
              label="Magazine"
              value={Number(weapon.magazineSize) || 0}
              color="blue"
            />
            <StatBadge
              label="Reload"
              value={`${Number(weapon.reloadTime) || 0}s`}
              color="green"
            />
          </div>

          {/* Usar ImageWithPlaceholder e imageUrl processada */}
          <div className="mt-3">
            <ImageWithPlaceholder
              src={weapon.imageUrl || weapon.image}
              alt={weapon.name || 'Weapon'}
              className="w-full h-32 object-cover rounded-md"
              fallbackIcon="🔫"
              fallbackText="No Weapon Image"
              fallbackGradient="from-red-200 to-red-300"
            />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Weapons Arsenal</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('primary')
              setCurrentPage(1)
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'primary'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Primary Weapons
          </button>
          <button
            onClick={() => {
              setActiveTab('secondary')
              setCurrentPage(1)
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'secondary'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Secondary Weapons
          </button>
        </nav>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={searchTerm}
        onChange={(value) => {
          setSearchTerm(value)
          setCurrentPage(1)
        }}
        placeholder="Search weapons..."
        className="max-w-md"
      />

      {/* Content */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <ErrorMessage
          message="Failed to load weapons. Please try again."
          onRetry={() => window.location.reload()}
        />
      )}

      {currentData?.success && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentData.data.map(renderWeaponCard)}
          </div>

          {currentData.pagination && (
            <Pagination
              currentPage={currentPage}
              totalPages={currentData.pagination.totalPages}
              onPageChange={setCurrentPage}
              className="mt-8"
            />
          )}
        </>
      )}

      {currentData?.success && currentData.data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No weapons found matching your search.
          </p>
        </div>
      )}
    </div>
  )
}

export default WeaponsPage
