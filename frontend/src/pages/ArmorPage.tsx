import React, { useState } from 'react'
import { useArmors, usePassiveArmors } from '../core/hooks/useApi'
import {
  Card,
  LoadingSpinner,
  ErrorMessage,
  SearchBar,
  Pagination,
  StatBadge
} from '../shared/ui/components'
import ImageWithPlaceholder from '../shared/ui/components/ImageWithPlaceholder' // ← IMPORTAR COMPONENTE

const ArmorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'armors' | 'passives'>('armors')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 12

  const {
    data: armorsData,
    isLoading: armorsLoading,
    error: armorsError
  } = useArmors({
    page: currentPage,
    limit,
    name: searchTerm || undefined
  })

  const {
    data: passivesData,
    isLoading: passivesLoading,
    error: passivesError
  } = usePassiveArmors({
    page: currentPage,
    limit,
    name: searchTerm || undefined
  })

  const isLoading = armorsLoading || passivesLoading
  const error = armorsError || passivesError
  const currentData = activeTab === 'armors' ? armorsData : passivesData

  // Função para encontrar a passiva pelo ID
  const findPassiveById = (passiveId: string) => {
    if (!passivesData?.success) return null

    return passivesData.data.find((passive: any) => {
      const id = passive._id || passive.id
      return id === passiveId
    })
  }

  const renderArmorCard = (armor: any) => {
    // Busca a passiva correspondente
    let passiveInfo = null
    if (armor.passive) {
      const passiveId =
        typeof armor.passive === 'string'
          ? armor.passive
          : armor.passive.$oid || armor.passive._id
      passiveInfo = findPassiveById(passiveId)
    }

    return (
      <Card key={armor._id} className="p-4" hover>
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900">
              {armor.name || 'Unknown'}
            </h3>
            <span className="text-sm text-gray-500 capitalize">
              {armor.type || 'Unknown'}
            </span>
          </div>

          {armor.description && (
            <p className="text-sm text-gray-600">{armor.description}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <StatBadge
              label="Armor Rating"
              value={Number(armor.armorRating) || 0}
              color="blue"
            />
            <StatBadge
              label="Speed"
              value={Number(armor.speed) || 0}
              color="green"
            />
            <StatBadge
              label="Stamina Regen"
              value={Number(armor.staminaRegen) || 0}
              color="yellow"
            />
          </div>

          {armor.passive && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Passive Ability:</p>
              {passiveInfo ? (
                <div className="bg-purple-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-purple-900 mb-1">
                    {passiveInfo.name}
                  </p>
                  <p className="text-xs text-purple-700">
                    {passiveInfo.effect || passiveInfo.efeito || 'No effect'}
                  </p>
                </div>
              ) : (
                <div className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                  ✨ Has passive ability
                </div>
              )}
            </div>
          )}

          {/* CORREÇÃO: Usar ImageWithPlaceholder e imageUrl processada */}
          <div className="mt-3">
            <ImageWithPlaceholder
              src={armor.imageUrl || armor.image} // ← USAR imageUrl primeiro
              alt={armor.name || 'Armor'}
              className="w-full h-32 object-cover rounded-md"
              fallbackIcon="🛡️"
              fallbackText="No Armor Image"
              fallbackGradient="from-blue-200 to-blue-300"
            />
          </div>
        </div>
      </Card>
    )
  }

  const renderPassiveCard = (passive: any) => {
    return (
      <Card key={passive._id} className="p-4" hover>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {passive.name || 'Unknown'}
          </h3>

          {passive.description && (
            <p className="text-sm text-gray-600">{passive.description}</p>
          )}

          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-500 mb-1">Efeito:</p>
            <p className="text-sm text-gray-700 font-medium">
              {passive.effect || passive.efeito || 'No effect'}
            </p>
          </div>
          <div className="mt-3">
            <ImageWithPlaceholder
              src={passive.imageUrl || passive.image} // ← USAR imageUrl primeiro
              alt={passive.name || 'Passive'}
              className="w-full h-32 object-cover rounded-md"
              fallbackIcon="✨"
              fallbackText="No Passive Image"
              fallbackGradient="from-purple-200 to-purple-300"
            />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Armor & Protection</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('armors')
              setCurrentPage(1)
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'armors'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Armor Sets
          </button>
          <button
            onClick={() => {
              setActiveTab('passives')
              setCurrentPage(1)
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'passives'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Passive Abilities
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
          message="Failed to load armor data. Please try again."
          onRetry={() => window.location.reload()}
        />
      )}

      {currentData?.success && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentData.data.map((item: any) =>
              activeTab === 'armors'
                ? renderArmorCard(item)
                : renderPassiveCard(item)
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

export default ArmorPage
