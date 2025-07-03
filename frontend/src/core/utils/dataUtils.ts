import {
  PrimaryWeapon,
  SecondaryWeapon,
  Throwable,
  Stratagem,
  Armor,
  PassiveArmor,
  Perk
} from '../types/api'

// Base URL para imagens com debug
const getImageUrl = (imagePath?: string): string | undefined => {
  if (!imagePath) {
    return undefined
  }

  // Se já é uma URL completa, retorna como está
  if (imagePath.startsWith('http')) {
    return imagePath
  }

  let finalUrl: string

  // Em desenvolvimento, usa proxy ou URL completa
  if (import.meta.env.DEV) {
    // Primeiro tenta usar o proxy
    finalUrl = imagePath
  } else {
    // Em produção, usa URL completa
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/'
    finalUrl = `${baseUrl}${imagePath}`
  }

  return finalUrl
}

// Função para testar se a URL da imagem é acessível
const testImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const isAccessible = response.ok
    return isAccessible
  } catch (error) {
    return false
  }
}

// Processa dados de armas com debug extensivo
export const processWeapon = (weapon: any): PrimaryWeapon | SecondaryWeapon => {
  const imageUrl = getImageUrl(weapon.image)

  const processed = {
    ...weapon,
    imageUrl,
    damage: Number(weapon.damage) || 0,
    fireRate: Number(weapon.fireRate) || 0,
    magazineSize: Number(weapon.magazineSize) || 0,
    reloadTime: Number(weapon.reloadTime) || 0
  }

  return processed
}

// Processa dados de throwables (explosivos)
export const processThrowable = (throwable: any): Throwable => {
  const processed = {
    ...throwable,
    imageUrl: getImageUrl(throwable.image),
    damage: Number(throwable.damage || throwable.dano) || 0,
    raio: Number(throwable.raio) || 0,
    blastRadius: Number(throwable.raio) || 0,
    tipo: throwable.tipo || throwable.type || 'Unknown'
  }

  return processed
}

// Processa dados de stratagems (estratagemas)
export const processStratagem = (stratagem: any): Stratagem => {
  const processed = {
    ...stratagem,
    imageUrl: getImageUrl(stratagem.image),
    cooldown: Number(stratagem.cooldown) || 0,
    usos: Number(stratagem.usos) || 0,
    uses: Number(stratagem.usos) || 0,
    categoria: stratagem.categoria || stratagem.category || 'Unknown',
    category: stratagem.categoria || stratagem.category || 'Unknown'
  }

  return processed
}

// Processa dados de armor (armaduras)
export const processArmor = (armor: any): Armor => {
  const processed = {
    ...armor,
    imageUrl: getImageUrl(armor.image),
    protecao: Number(armor.protecao) || 0,
    armorRating: Number(armor.protecao) || 0,
    velocidade: Number(armor.velocidade) || 0,
    speed: Number(armor.velocidade) || 0,
    estamina: Number(armor.estamina) || 0,
    staminaRegen: Number(armor.estamina) || 0,
    tipo: armor.tipo || armor.type || 'Unknown',
    type: armor.tipo || armor.type || 'Unknown',
    passiva: armor.passiva || armor.passive,
    passive: armor.passiva || armor.passive
  }

  return processed
}

// Processa dados de passive armor (passivas de armadura)
export const processPassiveArmor = (passiveArmor: any): PassiveArmor => {
  const processed = {
    ...passiveArmor,
    imageUrl: getImageUrl(passiveArmor.image),
    efeito: passiveArmor.efeito || passiveArmor.effect || 'No effect',
    effect: passiveArmor.efeito || passiveArmor.effect || 'No effect'
  }

  return processed
}

// Processa dados de perks
export const processPerk = (perk: any): Perk => {
  const processed = {
    ...perk,
    imageUrl: getImageUrl(perk.image),
    efeito: perk.efeito || perk.effect || 'No effect',
    effect: perk.efeito || perk.effect || 'No effect'
  }

  return processed
}

// Processa lista de dados
export const processDataList = <T>(
  data: any[],
  processor: (item: any) => T
): T[] => {
  if (!Array.isArray(data)) {
    console.warn('❌ Data is not an array:', data)
    console.groupEnd()
    return []
  }

  const processed = data.map(processor)

  return processed
}

// Debug: Log da estrutura dos dados
export const logDataStructure = (data: any, label: string) => {
  if (Array.isArray(data) && data.length > 0) {
  }

  console.groupEnd()
}

// Função para debugar configuração atual
export const debugImageConfig = () => {
  // Testa algumas URLs de exemplo
  const testPaths = [
    '/uploads/primary-weapons/image-1751570855844-76037329.png',
    '/uploads/test.jpg'
  ]

  testPaths.forEach((path) => {})

  console.groupEnd()
}

// Chama o debug automaticamente
debugImageConfig()
