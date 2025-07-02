const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage, getModelImages, migrateImages } = require('../controllers/imageController');

// === MIDDLEWARE DE LOGGING PARA DEBUG ===
router.use((req, res, next) => {
  console.log(`🖼️ [IMAGE ROUTE] ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📄 [IMAGE ROUTE] Body:`, req.body);
  }
  if (req.params && Object.keys(req.params).length > 0) {
    console.log(`📄 [IMAGE ROUTE] Params:`, req.params);
  }
  next();
});

// === ROTAS PRINCIPAIS ===

// 📤 Upload de imagem
router.post('/upload-image', (req, res, next) => {
  console.log('📡 Recebida requisição de upload de imagem');
  console.log('📋 ModelKey no body:', req.body.modelKey);
  uploadImage(req, res, next);
});

// 🗑️ Deletar imagem
router.delete('/delete-image', (req, res, next) => {
  console.log('📡 Recebida requisição de exclusão de imagem');
  console.log('📋 URL para deletar:', req.body.imageUrl);
  deleteImage(req, res, next);
});

// 📋 Listar imagens de um modelo
router.get('/images/:modelKey', (req, res, next) => {
  console.log('📡 Recebida requisição de listagem de imagens para:', req.params.modelKey);
  getModelImages(req, res, next);
});

// === ROTAS DE MANUTENÇÃO E DEBUG ===

// 🔄 Migrar imagens antigas (da pasta general para pastas específicas)
router.post('/migrate-images', (req, res, next) => {
  console.log('📡 Recebida requisição de migração de imagens');
  migrateImages(req, res, next);
});

// 🔍 Debug - Verificar estrutura de pastas
router.get('/debug/folder-structure', async (req, res, next) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');

    const uploadsPath = path.join(__dirname, '../../uploads');
    const structure = {};

    try {
      const folders = await fs.readdir(uploadsPath);

      for (const folder of folders) {
        const folderPath = path.join(uploadsPath, folder);
        const stats = await fs.stat(folderPath);

        if (stats.isDirectory()) {
          try {
            const files = await fs.readdir(folderPath);
            const imageFiles = files.filter(file =>
              /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
            );

            structure[folder] = {
              totalFiles: files.length,
              imageFiles: imageFiles.length,
              images: imageFiles.slice(0, 5), // Primeiras 5 para exemplo
              hasMore: imageFiles.length > 5
            };
          } catch (error) {
            structure[folder] = { error: 'Não foi possível ler conteúdo' };
          }
        }
      }

      res.json({
        success: true,
        message: 'Estrutura de pastas de upload',
        data: {
          uploadsPath,
          structure,
          summary: {
            totalFolders: Object.keys(structure).length,
            totalImages: Object.values(structure).reduce((sum, folder) =>
              sum + (folder.imageFiles || 0), 0
            )
          }
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao ler estrutura de pastas',
          details: error.message,
          uploadsPath
        }
      });
    }

  } catch (error) {
    next(error);
  }
});

// 🔍 Debug - Encontrar imagem específica
router.get('/debug/find-image/:filename', async (req, res, next) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    const { filename } = req.params;

    const uploadsPath = path.join(__dirname, '../../uploads');
    const locations = [];

    // Função recursiva para buscar arquivo
    async function searchInDirectory(dirPath, relativePath = '') {
      try {
        const items = await fs.readdir(dirPath);

        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const stats = await fs.stat(itemPath);

          if (stats.isDirectory()) {
            await searchInDirectory(itemPath, path.join(relativePath, item));
          } else if (item === filename) {
            locations.push({
              fullPath: itemPath,
              relativePath: path.join(relativePath, item),
              url: `/uploads/${relativePath}/${item}`.replace(/\\/g, '/'),
              size: stats.size,
              modified: stats.mtime
            });
          }
        }
      } catch (error) {
        console.warn(`Erro ao buscar em ${dirPath}:`, error.message);
      }
    }

    await searchInDirectory(uploadsPath);

    res.json({
      success: true,
      message: `Busca por arquivo: ${filename}`,
      data: {
        filename,
        found: locations.length > 0,
        locations,
        searchedIn: uploadsPath
      }
    });

  } catch (error) {
    next(error);
  }
});

// === ROTA DE HEALTH CHECK ===
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Image service operacional',
    timestamp: new Date().toISOString(),
    endpoints: {
      upload: 'POST /upload-image',
      delete: 'DELETE /delete-image',
      list: 'GET /images/:modelKey',
      migrate: 'POST /migrate-images',
      debug: {
        structure: 'GET /debug/folder-structure',
        find: 'GET /debug/find-image/:filename'
      }
    }
  });
});

module.exports = router;