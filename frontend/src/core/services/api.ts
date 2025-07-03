import axios from 'axios'
import {
  ApiResponse,
  QueryParams,
  PrimaryWeapon,
  SecondaryWeapon,
  Throwable,
  Stratagem,
  Armor,
  PassiveArmor,
  Perk
} from '../types/api'

// Configuração para desenvolvimento local vs produção
const isDev = import.meta.env.DEV
const showLogs = import.meta.env.VITE_SHOW_LOGS === 'true'
const apiBaseUrl = isDev
  ? 'http://localhost:3000' // URL direta em desenvolvimento
  : import.meta.env.VITE_API_BASE_URL || 'https://helldivers.onrender.com'

// === FUNÇÕES DE LOG CONDICIONAIS ===

// Log básico - só se VITE_SHOW_LOGS=true
const devLog = (...args: any[]) => {
  if (showLogs) {
  }
}

// Log de grupo - só se VITE_SHOW_LOGS=true
const devLogGroup = (title: string, callback: () => void) => {
  if (showLogs) {
    console.group(title)
    callback()
    console.groupEnd()
  }
}

// Log de erro - sempre ativo (importante para debug em produção)
const errorLog = (...args: any[]) => {
  console.error(...args)
}

// Log de warning - sempre ativo
const warnLog = (...args: any[]) => {
  console.warn(...args)
}

// === CONFIGURAÇÃO INICIAL COM LOGS CONDICIONAIS ===

devLogGroup('🔧 API Configuration', () => {
  devLog('Environment:', {
    isDev,
    showLogs,
    mode: import.meta.env.MODE,
    apiBaseUrl,
    envVars: {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_API_TIMEOUT: import.meta.env.VITE_API_TIMEOUT,
      VITE_SHOW_LOGS: import.meta.env.VITE_SHOW_LOGS
    }
  })
})

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for logging (apenas em dev)
api.interceptors.request.use(
  (config) => {
    if (showLogs) {
      const fullUrl = `${config.baseURL}${config.url}`
      devLog(`🚀 Making ${config.method?.toUpperCase()} request to:`, fullUrl)

      if (config.params) {
        devLog('📋 Request params:', config.params)
      }
    }

    return config
  },
  (error) => {
    errorLog('❌ Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Logs de sucesso apenas se VITE_SHOW_LOGS=true
    if (showLogs) {
      devLog(`✅ Response from ${response.config.url}:`, {
        status: response.status,
        dataLength: Array.isArray(response.data?.data)
          ? response.data.data.length
          : 'N/A'
      })

      // Log da primeira imagem para debug (apenas se logs ativos)
      if (
        response.data?.data &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        const firstItem = response.data.data[0]
        if (firstItem.image) {
          devLog('📸 First item image path:', firstItem.image)
        }
      }
    }

    return response
  },
  (error) => {
    // Erros sempre logados, mas com mais detalhes se logs ativos
    if (showLogs) {
      devLogGroup('❌ API Error', () => {
        errorLog('Error details:', {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data
        })
      })
    } else {
      // Sem logs ativos, erro mais simples
      errorLog('❌ API Error:', error.message, error.response?.status)
    }

    return Promise.reject(error)
  }
)

export class ApiService {
  // Generic GET method
  static async get<T>(
    endpoint: string,
    params?: QueryParams
  ): Promise<ApiResponse<T>> {
    const response = await api.get(endpoint, { params })
    return response.data
  }

  // Generic POST method
  static async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const response = await api.post(endpoint, data)
    return response.data
  }

  // Generic PUT method
  static async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const response = await api.put(endpoint, data)
    return response.data
  }

  // Generic DELETE method
  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await api.delete(endpoint)
    return response.data
  }

  // Weapons
  static getPrimaryWeapons(
    params?: QueryParams
  ): Promise<ApiResponse<PrimaryWeapon[]>> {
    return this.get<PrimaryWeapon[]>('/api/primary-weapons', params)
  }

  static getPrimaryWeaponById(id: string): Promise<ApiResponse<PrimaryWeapon>> {
    return this.get<PrimaryWeapon>(`/api/primary-weapons/${id}`)
  }

  static getPrimaryWeaponStats(): Promise<ApiResponse<any>> {
    return this.get<any>('/api/primary-weapons/stats')
  }

  static getSecondaryWeapons(
    params?: QueryParams
  ): Promise<ApiResponse<SecondaryWeapon[]>> {
    return this.get<SecondaryWeapon[]>('/api/secondary-weapons', params)
  }

  static getSecondaryWeaponById(
    id: string
  ): Promise<ApiResponse<SecondaryWeapon>> {
    return this.get<SecondaryWeapon>(`/api/secondary-weapons/${id}`)
  }

  // Equipment
  static getThrowables(
    params?: QueryParams
  ): Promise<ApiResponse<Throwable[]>> {
    return this.get<Throwable[]>('/api/throwables', params)
  }

  static getThrowableById(id: string): Promise<ApiResponse<Throwable>> {
    return this.get<Throwable>(`/api/throwables/${id}`)
  }

  static getStratagems(
    params?: QueryParams
  ): Promise<ApiResponse<Stratagem[]>> {
    return this.get<Stratagem[]>('/api/stratagems', params)
  }

  static getStratagemById(id: string): Promise<ApiResponse<Stratagem>> {
    return this.get<Stratagem>(`/api/stratagems/${id}`)
  }

  // Armor
  static getArmors(params?: QueryParams): Promise<ApiResponse<Armor[]>> {
    return this.get<Armor[]>('/api/armors', params)
  }

  static getArmorById(id: string): Promise<ApiResponse<Armor>> {
    return this.get<Armor>(`/api/armors/${id}`)
  }

  static getPassiveArmors(
    params?: QueryParams
  ): Promise<ApiResponse<PassiveArmor[]>> {
    return this.get<PassiveArmor[]>('/api/passive-armors', params)
  }

  static getPassiveArmorById(id: string): Promise<ApiResponse<PassiveArmor>> {
    return this.get<PassiveArmor>(`/api/passive-armors/${id}`)
  }

  // Perks
  static getPerks(params?: QueryParams): Promise<ApiResponse<Perk[]>> {
    return this.get<Perk[]>('/api/perks', params)
  }

  static getPerkById(id: string): Promise<ApiResponse<Perk>> {
    return this.get<Perk>(`/api/perks/${id}`)
  }

  // Método para testar conectividade
  static async testConnection(): Promise<boolean> {
    try {
      devLog('🧪 Testing API connection...')
      const response = await api.get('/api/health')
      devLog('✅ API connection successful:', response.data)
      return true
    } catch (error) {
      errorLog('❌ API connection failed:', error)
      return false
    }
  }

  // Método para testar acesso a imagens
  static async testImageAccess(imagePath: string): Promise<boolean> {
    try {
      const fullUrl = `${apiBaseUrl}${imagePath}`
      devLog('🖼️ Testing image access:', fullUrl)

      const response = await fetch(fullUrl, { method: 'HEAD' })
      const success = response.ok

      devLog(
        `📸 Image test result: ${success ? '✅' : '❌'} (${response.status})`
      )
      return success
    } catch (error) {
      errorLog('❌ Image access test failed:', error)
      return false
    }
  }

  // Método para alternar debug em runtime (útil para desenvolvimento)
  static enableDebugLogs(): void {
    if (isDev) {
      // @ts-ignore
      window.__API_DEBUG__ = true
    }
  }

  static disableDebugLogs(): void {
    if (isDev) {
      // @ts-ignore
      window.__API_DEBUG__ = false
    }
  }
}

export default ApiService
