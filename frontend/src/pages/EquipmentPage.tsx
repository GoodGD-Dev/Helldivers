import React, { useState } from 'react'
import { useThrowables, useStratagems } from '../core/hooks/useApi'
import {
  Card,
  LoadingSpinner,
  ErrorMessage,
  SearchBar,
  Pagination,
  StatBadge,
  ImageWithPlaceholder
} from '../shared/ui/components'

const EquipmentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'throwables' | 'stratagems'>(
    'throwables'
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 12

  const {
    data: throwablesData,
    isLoading: throwablesLoading,
    error: throwablesError
  } = useThrowables({
    page: currentPage,
    limit,
    name: searchTerm || undefined
  })

  const {
    data: stratagemsData,
    isLoading: stratagemsLoading,
    error: stratagemsError
  } = useStratagems({
    page: currentPage,
    limit,
    name: searchTerm || undefined
  })

  const isLoading = throwablesLoading || stratagemsLoading
  const error = throwablesError || stratagemsError
  const currentData =
    activeTab === 'throwables' ? throwablesData : stratagemsData

  const renderThrowableCard = (throwable: any) => (
    <Card key={throwable._id} className="p-4" hover>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {throwable.name || 'Unknown'}
        </h3>

        {throwable.description && (
          <p className="text-sm text-gray-600">{throwable.description}</p>
        )}

        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-500 mb-1">Efeito:</p>
          <p className="text-sm text-gray-700 font-medium">
            {throwable.effect || throwable.efeito || 'No effect'}
          </p>
        </div>
        <div className="mt-3">
          <ImageWithPlaceholder
            src={throwable.imageUrl || throwable.image} // ← USAR imageUrl primeiro
            alt={throwable.name || 'Passive'}
            className="w-full h-32 object-cover rounded-md"
            fallbackIcon="✨"
            fallbackText="No Passive Image"
            fallbackGradient="from-purple-200 to-purple-300"
          />
        </div>
      </div>
    </Card>
  )

  const renderStratagemCard = (stratagem: any) => (
    <Card key={stratagem._id} className="p-4" hover>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {stratagem.name || 'Unknown'}
        </h3>

        {stratagem.description && (
          <p className="text-sm text-gray-600">{stratagem.description}</p>
        )}

        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-500 mb-1">Efeito:</p>
          <p className="text-sm text-gray-700 font-medium">
            {stratagem.effect || stratagem.efeito || 'No effect'}
          </p>
        </div>
        <div className="mt-3">
          <ImageWithPlaceholder
            src={stratagem.imageUrl || stratagem.image} // ← USAR imageUrl primeiro
            alt={stratagem.name || 'Passive'}
            className="w-full h-32 object-cover rounded-md"
            fallbackIcon="✨"
            fallbackText="No Passive Image"
            fallbackGradient="from-purple-200 to-purple-300"
          />
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Equipment & Stratagems
        </h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('throwables')
              setCurrentPage(1)
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'throwables'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Throwables
          </button>
          <button
            onClick={() => {
              setActiveTab('stratagems')
              setCurrentPage(1)
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stratagems'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Stratagems
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
        placeholder={`Search ${activeTab}...`}
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
          message="Failed to load equipment. Please try again."
          onRetry={() => window.location.reload()}
        />
      )}

      {currentData?.success && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentData.data.map((item: any) =>
              activeTab === 'throwables'
                ? renderThrowableCard(item)
                : renderStratagemCard(item)
            )}
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
            No {activeTab} found matching your search.
          </p>
        </div>
      )}
    </div>
  )
}

export default EquipmentPage
