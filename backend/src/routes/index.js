// 🌐 Arquivo principal de rotas
const express = require('express');
const router = express.Router();

// Importar rotas específicas
const primaryWeaponsRoutes = require('./primaryWeapons');
const secondaryWeaponsRoutes = require('./secondaryWeapons');
const throwablesRoutes = require('./throwables');
const stratagemsRoutes = require('./stratagems');
const armorsRoutes = require('./armors');
const passiveArmorsRoutes = require('./passiveArmors');
const perksRoutes = require('./perks');

// 🔫 Rotas de armas
router.use('/primary-weapons', primaryWeaponsRoutes);
router.use('/secondary-weapons', secondaryWeaponsRoutes);

// 💣 Rotas de equipamentos
router.use('/throwables', throwablesRoutes);
router.use('/stratagems', stratagemsRoutes);

// 🛡️ Rotas de armaduras
router.use('/armors', armorsRoutes);
router.use('/passive-armors', passiveArmorsRoutes);

// 🎯 Rotas de perks
router.use('/perks', perksRoutes);

// 📚 Documentação da API
router.get('/docs', (req, res) => {
  res.json({
    title: '🎮 Helldivers 2 API Documentation',
    version: '1.0.0',
    description: 'API completa para equipamentos e dados do Helldivers 2',
    endpoints: {
      weapons: {
        primary: {
          base: '/api/primary-weapons',
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          endpoints: [
            'GET /api/primary-weapons - Listar todas (com paginação)',
            'GET /api/primary-weapons/stats - Estatísticas',
            'GET /api/primary-weapons/:id - Buscar por ID',
            'POST /api/primary-weapons - Criar nova',
            'PUT /api/primary-weapons/:id - Atualizar',
            'DELETE /api/primary-weapons/:id - Deletar'
          ]
        },
        secondary: {
          base: '/api/secondary-weapons',
          methods: ['GET', 'POST', 'PUT', 'DELETE']
        }
      },
      equipment: {
        throwables: {
          base: '/api/throwables',
          methods: ['GET', 'POST', 'PUT', 'DELETE']
        },
        stratagems: {
          base: '/api/stratagems',
          methods: ['GET', 'POST', 'PUT', 'DELETE']
        }
      },
      armor: {
        armors: {
          base: '/api/armors',
          methods: ['GET', 'POST', 'PUT', 'DELETE']
        },
        passives: {
          base: '/api/passive-armors',
          methods: ['GET', 'POST', 'PUT', 'DELETE']
        }
      },
      perks: {
        base: '/api/perks',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      }
    },
    queryParameters: {
      pagination: {
        page: 'Número da página (padrão: 1)',
        limit: 'Items por página (padrão: 10, máx: 100)'
      },
      filters: {
        name: 'Filtrar por nome (busca parcial)',
        type: 'Filtrar por tipo'
      }
    },
    responseFormat: {
      success: {
        success: true,
        data: '...',
        pagination: '... (quando aplicável)'
      },
      error: {
        success: false,
        error: {
          message: 'Mensagem de erro',
          details: '... (detalhes quando disponível)'
        },
        timestamp: 'ISO timestamp',
        path: 'Endpoint que gerou o erro',
        method: 'HTTP method'
      }
    }
  });
});

module.exports = router;