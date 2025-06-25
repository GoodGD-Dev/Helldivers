// 🌱 Script para popular o banco de dados com dados de exemplo
require('dotenv').config();
const connectDatabase = require('../config/database');

// Importar modelos
const PrimaryWeapon = require('../models/PrimaryWeapon');
const SecondaryWeapon = require('../models/SecondaryWeapon');
const Throwable = require('../models/Throwable');
const Stratagem = require('../models/Stratagem');
const PassiveArmor = require('../models/PassiveArmor');
const Armor = require('../models/Armor');
const Perk = require('../models/Perk');

// 🔫 Dados de exemplo para Armas Primárias
const primaryWeaponsData = [
  {
    name: "Liberator",
    type: "Assault Rifle",
    damage: 60,
    fireRate: 640,
    magazineSize: 45,
    reloadTime: 2.8,
    description: "Rifle de assalto padrão das Super Earth Armed Forces. Versátil e confiável."
  },
  {
    name: "Defender",
    type: "SMG",
    damage: 45,
    fireRate: 800,
    magazineSize: 45,
    reloadTime: 2.2,
    description: "Submetralhadora compacta ideal para combate próximo e mobilidade."
  },
  {
    name: "Diligence",
    type: "DMR",
    damage: 112,
    fireRate: 300,
    magazineSize: 10,
    reloadTime: 3.0,
    description: "Rifle semiautomático de precisão para engajamentos de média distância."
  }
];

// 🔫 Dados de exemplo para Armas Secundárias
const secondaryWeaponsData = [
  {
    name: "P-19 Redeemer",
    type: "Pistol",
    damage: 50,
    magazineSize: 15,
    reloadTime: 1.5,
    description: "Pistola padrão confiável para situações de emergência."
  },
  {
    name: "P-113 Verdict",
    type: "Revolver",
    damage: 150,
    magazineSize: 6,
    reloadTime: 2.8,
    description: "Revólver de alto calibre com poder de parada devastador."
  }
];

// 💣 Dados de exemplo para Throwables
const throwablesData = [
  {
    name: "G-12 High Explosive",
    type: "Frag Grenade",
    damage: 300,
    blastRadius: 6,
    description: "Granada de fragmentação padrão para eliminação de grupos inimigos."
  },
  {
    name: "G-16 Impact",
    type: "Incendiary",
    damage: 200,
    blastRadius: 8,
    description: "Granada incendiária que cria área de dano contínuo por fogo."
  }
];

// 📡 Dados de exemplo para Stratagemas
const stratagemsData = [
  {
    name: "Orbital Precision Strike",
    category: "Offensive",
    cooldown: 90,
    uses: 3,
    description: "Ataque orbital preciso que elimina alvos únicos com extrema precisão."
  },
  {
    name: "Reinforcements",
    category: "Supply",
    cooldown: 120,
    uses: 5,
    description: "Chama reforços para reviver aliados caídos."
  },
  {
    name: "Shield Generator Relay",
    category: "Defensive",
    cooldown: 180,
    uses: 2,
    description: "Cria uma barreira de energia que protege uma área."
  }
];

// 🛡️ Dados de exemplo para Passivas de Armadura
const passiveArmorsData = [
  {
    name: "Engineering Kit",
    effect: "+50% build speed",
    description: "Aumenta a velocidade de construção de estruturas defensivas."
  },
  {
    name: "Med-Kit",
    effect: "+2 stims",
    description: "Carrega stims médicos adicionais para cura rápida."
  },
  {
    name: "Extra Padding",
    effect: "+25% explosive resistance",
    description: "Reduz o dano recebido de explosivos."
  }
];

// 🛡️ Dados de exemplo para Armaduras
const armorsData = [
  {
    name: "SC-30 Trailblazer",
    type: "Light",
    armorRating: 100,
    speed: 85,
    staminaRegen: 80,
    description: "Armadura leve focada em mobilidade para reconhecimento rápido."
  },
  {
    name: "B-01 Tactical",
    type: "Medium",
    armorRating: 200,
    speed: 65,
    staminaRegen: 60,
    description: "Armadura equilibrada entre proteção e mobilidade."
  },
  {
    name: "FS-55 Devastator",
    type: "Heavy",
    armorRating: 350,
    speed: 45,
    staminaRegen: 40,
    description: "Armadura pesada com máxima proteção para operações de alto risco."
  }
];

// 🎯 Dados de exemplo para Perks
const perksData = [
  {
    name: "Quick Reload",
    effect: "+15% reload speed",
    description: "Reduz o tempo de recarga de todas as armas."
  },
  {
    name: "Fortified",
    effect: "+25% damage resistance",
    description: "Aumenta a resistência a danos de todas as fontes."
  },
  {
    name: "Hellpod Optimizations",
    effect: "-25% stratagem cooldown",
    description: "Reduz o tempo de recarga de todos os stratagemas."
  }
];

// 🚀 Função principal de seeding
const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    await connectDatabase();

    // Limpar dados existentes
    console.log('🗑️ Limpando dados existentes...');
    await Promise.all([
      PrimaryWeapon.deleteMany({}),
      SecondaryWeapon.deleteMany({}),
      Throwable.deleteMany({}),
      Stratagem.deleteMany({}),
      PassiveArmor.deleteMany({}),
      Armor.deleteMany({}),
      Perk.deleteMany({})
    ]);

    // Inserir dados de exemplo
    console.log('📦 Inserindo dados de exemplo...');

    // Inserir passivas primeiro (para referência nas armaduras)
    const passives = await PassiveArmor.insertMany(passiveArmorsData);
    console.log(`✅ ${passives.length} passivas de armadura inseridas`);

    // Atualizar dados de armadura com referências às passivas
    const armorsWithPassives = armorsData.map((armor, index) => ({
      ...armor,
      passive: passives[index]?._id || null
    }));

    // Inserir todos os outros dados
    const [primaryWeapons, secondaryWeapons, throwables, stratagems, armors, perks] = await Promise.all([
      PrimaryWeapon.insertMany(primaryWeaponsData),
      SecondaryWeapon.insertMany(secondaryWeaponsData),
      Throwable.insertMany(throwablesData),
      Stratagem.insertMany(stratagemsData),
      Armor.insertMany(armorsWithPassives),
      Perk.insertMany(perksData)
    ]);

    console.log('✅ Dados inseridos com sucesso:');
    console.log(`   🔫 Armas Primárias: ${primaryWeapons.length}`);
    console.log(`   🔫 Armas Secundárias: ${secondaryWeapons.length}`);
    console.log(`   💣 Throwables: ${throwables.length}`);
    console.log(`   📡 Stratagemas: ${stratagems.length}`);
    console.log(`   🛡️ Armaduras: ${armors.length}`);
    console.log(`   🛡️ Passivas: ${passives.length}`);
    console.log(`   🎯 Perks: ${perks.length}`);

    console.log('🎉 Seed do banco de dados concluído com sucesso!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  }
};

// Executar se for chamado diretamente
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;