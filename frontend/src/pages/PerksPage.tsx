import React, { useState } from 'react'
import { usePerks } from '../core/hooks/useApi'
import {
  Card,
  LoadingSpinner,
  ErrorMessage,
  SearchBar,
  Pagination
} from '../shared/ui/components'

const PerksPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 12

  const {
    data: perksData,
    isLoading,
    error
  } = usePerks({
    page: currentPage,
    limit,
    name: searchTerm || undefined
  })

  const renderPerkCard = (perk: any) => (
    <Card key={perk._id} className="p-4" hover>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {perk.name || 'Unknown'}
        </h3>

        {perk.description && (
          <p className="text-sm text-gray-600">{perk.description}</p>
        )}

        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-500 mb-1">Efeito:</p>
          <p className="text-sm text-gray-700 font-medium">
            {perk.effect || perk.efeito || 'No effect'}
          </p>
        </div>

        {perk.image && (
          <div className="mt-3">
            <img
              src={perk.image}
              alt={perk.name || 'Perk'}
              className="w-full h-32 object-cover rounded-md bg-gray-100"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>
        )}
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Perks & Abilities</h1>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={searchTerm}
        onChange={(value) => {
          setSearchTerm(value)
          setCurrentPage(1)
        }}
        placeholder="Search perks..."
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
          message="Failed to load perks. Please try again."
          onRetry={() => window.location.reload()}
        />
      )}

      {perksData?.success && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {perksData.data.map(renderPerkCard)}
          </div>

          {perksData.pagination && (
            <Pagination
              currentPage={currentPage}
              totalPages={perksData.pagination.totalPages}
              onPageChange={setCurrentPage}
              className="mt-8"
            />
          )}
        </>
      )}

      {perksData?.success && perksData.data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No perks found matching your search.</p>
        </div>
      )}
    </div>
  )
}

export default PerksPage
