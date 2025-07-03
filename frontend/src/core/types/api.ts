export interface ApiResponse<T> {
  success: boolean
  data: T
  pagination?: PaginationInfo
}

export interface ApiError {
  success: false
  error: {
    message: string
    details?: string
  }
  timestamp: string
  path: string
  method: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface QueryParams {
  page?: number
  limit?: number
  name?: string
  type?: string
}

// Weapons - campos reais + processados
export interface BaseWeapon {
  _id: string
  name: string
  type: string
  damage: number
  fireRate: number // RPM
  magazineSize: number // Carregador
  reloadTime: number // Recarga
  description?: string
  image?: string
  imageUrl?: string // Campo processado
  createdAt: string
  updatedAt: string
  __v: number
}

export interface PrimaryWeapon extends BaseWeapon {}
export interface SecondaryWeapon extends BaseWeapon {}

// Throwables (Explosivos) - campos reais + processados
export interface Throwable {
  _id: string
  name: string
  description?: string
  image?: string
  imageUrl?: string // Campo processado
  tipo: string // Campo "tipo" em português
  damage: number // Campo "dano"
  raio: number // Campo "raio"
  blastRadius?: number // Alias para raio
  createdAt: string
  updatedAt: string
  __v: number
}

// Stratagems (Estratagemas) - campos reais + processados
export interface Stratagem {
  _id: string
  name: string
  description?: string
  image?: string
  imageUrl?: string // Campo processado
  categoria: string // Campo "categoria"
  category?: string // Alias para categoria
  cooldown: number // Campo "cooldown"
  usos: number // Campo "usos"
  uses?: number // Alias para usos
  createdAt: string
  updatedAt: string
  __v: number
}

// Armor (Armaduras) - campos reais + processados
export interface Armor {
  _id: string
  name: string
  description?: string
  image?: string
  imageUrl?: string // Campo processado
  tipo: string // Campo "tipo"
  type?: string // Alias para tipo
  protecao: number // Campo "protecao"
  armorRating?: number // Alias para protecao
  velocidade: number // Campo "velocidade"
  speed?: number // Alias para velocidade
  estamina: number // Campo "estamina"
  staminaRegen?: number // Alias para estamina
  passiva: string // Campo "passiva"
  passive?: string // Alias para passiva
  createdAt: string
  updatedAt: string
  __v: number
}

// Passive Armor (Passivas de Armadura) - campos reais + processados
export interface PassiveArmor {
  _id: string
  name: string
  description?: string
  image?: string
  imageUrl?: string // Campo processado
  efeito: string // Campo "efeito"
  effect?: string // Alias para efeito
  createdAt: string
  updatedAt: string
  __v: number
}

// Perks - campos reais + processados
export interface Perk {
  _id: string
  name: string
  description?: string
  image?: string
  imageUrl?: string // Campo processado
  efeito: string // Campo "efeito"
  effect?: string // Alias para efeito
  createdAt: string
  updatedAt: string
  __v: number
}
