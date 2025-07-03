import { useQuery } from '@tanstack/react-query'
import { ApiService } from '../services/api'
import {
  QueryParams,
  ApiResponse,
  PrimaryWeapon,
  SecondaryWeapon,
  Throwable,
  Stratagem,
  Armor,
  PassiveArmor,
  Perk
} from '../types/api'
import {
  processWeapon,
  processThrowable,
  processStratagem,
  processArmor,
  processPassiveArmor,
  processPerk,
  processDataList
} from '../utils/dataUtils'

// Primary Weapons
export const usePrimaryWeapons = (params?: QueryParams) => {
  return useQuery<ApiResponse<PrimaryWeapon[]>>({
    queryKey: ['primary-weapons', params],
    queryFn: async () => {
      const response = await ApiService.getPrimaryWeapons(params)
      if (response.success) {
        // Processar os dados para adicionar imageUrl
        response.data = processDataList(response.data, processWeapon)
      }
      return response
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export const usePrimaryWeapon = (id: string) => {
  return useQuery<ApiResponse<PrimaryWeapon>>({
    queryKey: ['primary-weapon', id],
    queryFn: async () => {
      const response = await ApiService.getPrimaryWeaponById(id)
      if (response.success) {
        response.data = processWeapon(response.data)
      }
      return response
    },
    enabled: !!id
  })
}

// Secondary Weapons
export const useSecondaryWeapons = (params?: QueryParams) => {
  return useQuery<ApiResponse<SecondaryWeapon[]>>({
    queryKey: ['secondary-weapons', params],
    queryFn: async () => {
      const response = await ApiService.getSecondaryWeapons(params)
      if (response.success) {
        response.data = processDataList(response.data, processWeapon)
      }
      return response
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000
  })
}

export const useSecondaryWeapon = (id: string) => {
  return useQuery<ApiResponse<SecondaryWeapon>>({
    queryKey: ['secondary-weapon', id],
    queryFn: async () => {
      const response = await ApiService.getSecondaryWeaponById(id)
      if (response.success) {
        response.data = processWeapon(response.data)
      }
      return response
    },
    enabled: !!id
  })
}

// Throwables
export const useThrowables = (params?: QueryParams) => {
  return useQuery<ApiResponse<Throwable[]>>({
    queryKey: ['throwables', params],
    queryFn: async () => {
      const response = await ApiService.getThrowables(params)
      if (response.success) {
        response.data = processDataList(response.data, processThrowable)
      }
      return response
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000
  })
}

export const useThrowable = (id: string) => {
  return useQuery<ApiResponse<Throwable>>({
    queryKey: ['throwable', id],
    queryFn: async () => {
      const response = await ApiService.getThrowableById(id)
      if (response.success) {
        response.data = processThrowable(response.data)
      }
      return response
    },
    enabled: !!id
  })
}

// Stratagems
export const useStratagems = (params?: QueryParams) => {
  return useQuery<ApiResponse<Stratagem[]>>({
    queryKey: ['stratagems', params],
    queryFn: async () => {
      const response = await ApiService.getStratagems(params)
      if (response.success) {
        response.data = processDataList(response.data, processStratagem)
      }
      return response
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000
  })
}

export const useStratagem = (id: string) => {
  return useQuery<ApiResponse<Stratagem>>({
    queryKey: ['stratagem', id],
    queryFn: async () => {
      const response = await ApiService.getStratagemById(id)
      if (response.success) {
        response.data = processStratagem(response.data)
      }
      return response
    },
    enabled: !!id
  })
}

// Armors
export const useArmors = (params?: QueryParams) => {
  return useQuery<ApiResponse<Armor[]>>({
    queryKey: ['armors', params],
    queryFn: async () => {
      const response = await ApiService.getArmors(params)
      if (response.success) {
        response.data = processDataList(response.data, processArmor)
      }
      return response
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000
  })
}

export const useArmor = (id: string) => {
  return useQuery<ApiResponse<Armor>>({
    queryKey: ['armor', id],
    queryFn: async () => {
      const response = await ApiService.getArmorById(id)
      if (response.success) {
        response.data = processArmor(response.data)
      }
      return response
    },
    enabled: !!id
  })
}

// Passive Armors
export const usePassiveArmors = (params?: QueryParams) => {
  return useQuery<ApiResponse<PassiveArmor[]>>({
    queryKey: ['passive-armors', params],
    queryFn: async () => {
      const response = await ApiService.getPassiveArmors(params)
      if (response.success) {
        response.data = processDataList(response.data, processPassiveArmor)
      }
      return response
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000
  })
}

export const usePassiveArmor = (id: string) => {
  return useQuery<ApiResponse<PassiveArmor>>({
    queryKey: ['passive-armor', id],
    queryFn: async () => {
      const response = await ApiService.getPassiveArmorById(id)
      if (response.success) {
        response.data = processPassiveArmor(response.data)
      }
      return response
    },
    enabled: !!id
  })
}

// Perks
export const usePerks = (params?: QueryParams) => {
  return useQuery<ApiResponse<Perk[]>>({
    queryKey: ['perks', params],
    queryFn: async () => {
      const response = await ApiService.getPerks(params)
      if (response.success) {
        response.data = processDataList(response.data, processPerk)
      }
      return response
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000
  })
}

export const usePerk = (id: string) => {
  return useQuery<ApiResponse<Perk>>({
    queryKey: ['perk', id],
    queryFn: async () => {
      const response = await ApiService.getPerkById(id)
      if (response.success) {
        response.data = processPerk(response.data)
      }
      return response
    },
    enabled: !!id
  })
}
