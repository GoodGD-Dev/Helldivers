import { useQueries } from '@tanstack/react-query'
import { ApiService } from '../services/api'

export const useOverviewStats = () => {
  const queries = useQueries({
    queries: [
      {
        queryKey: ['stats', 'primary-weapons'],
        queryFn: () => ApiService.getPrimaryWeapons({ limit: 100 }),
        staleTime: 10 * 60 * 1000 // 10 minutes
      },
      {
        queryKey: ['stats', 'secondary-weapons'],
        queryFn: () => ApiService.getSecondaryWeapons({ limit: 100 }),
        staleTime: 10 * 60 * 1000
      },
      {
        queryKey: ['stats', 'stratagems'],
        queryFn: () => ApiService.getStratagems({ limit: 100 }),
        staleTime: 10 * 60 * 1000
      },
      {
        queryKey: ['stats', 'armors'],
        queryFn: () => ApiService.getArmors({ limit: 100 }),
        staleTime: 10 * 60 * 1000
      },
      {
        queryKey: ['stats', 'perks'],
        queryFn: () => ApiService.getPerks({ limit: 100 }),
        staleTime: 10 * 60 * 1000
      }
    ]
  })

  const [primaryWeapons, secondaryWeapons, stratagems, armors, perks] = queries

  const isLoading = queries.some((query) => query.isLoading)
  const hasError = queries.some((query) => query.error)

  const stats = {
    weapons:
      (primaryWeapons.data?.success ? primaryWeapons.data.data.length : 0) +
      (secondaryWeapons.data?.success ? secondaryWeapons.data.data.length : 0),
    stratagems: stratagems.data?.success ? stratagems.data.data.length : 0,
    armors: armors.data?.success ? armors.data.data.length : 0,
    perks: perks.data?.success ? perks.data.data.length : 0
  }

  return {
    stats,
    isLoading,
    hasError
  }
}
