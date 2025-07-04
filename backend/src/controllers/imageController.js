const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

// === MAPEAMENTO DE MODELKEY CORRETO ===
const MODEL_KEY_MAPPING = {
  'primary-weapons': 'primary-weapons',
  'secondary-weapons': 'secondary-weapons',
  'throwables': 'throwables',
  'stratagems': 'stratagems',
  'armors': 'armors',
  'passive-armors': 'passive-armors',
  'perks': 'perks'
};

// === DEFINIR CAMINHO CORRETO PARA UPLOADS ===
// CORREÇÃO: Subir um nível da pasta src para a raiz do projeto
const UPLOADS_ROOT = path.join(__dirname, '../../uploads');

// === FUNÇÃO PARA NORMALIZAR MODELKEY ===
function normalizeModelKey(modelKey) {
  if (!modelKey || modelKey === 'general') {
    console.warn(`⚠️ ModelKey inválido: "${modelKey}", usando 'general'`);
    return 'general';
  }

  const normalized = MODEL_KEY_MAPPING[modelKey] || modelKey;
  console.log(`🔄 ModelKey normalizado: "${modelKey}" -> "${normalized}"`);
  return normalized;
}

// === CONFIGURAR MULTER PARA UPLOAD DE IMAGENS ===
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    console.log('📁 Multer destination: Usando pasta temporária');

    const tempPath = path.join(UPLOADS_ROOT, 'temp');
    console.log(`📁 Caminho temporário: ${tempPath}`);

    try {
      await fs.mkdir(tempPath, { recursive: true });
      console.log(`✅ Pasta temporária criada/verificada: ${tempPath}`);
      cb(null, tempPath);
    } catch (error) {
      console.error(`❌ Erro ao criar pasta temporária: ${error.message}`);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + extension;
    console.log(`📝 Nome do arquivo gerado: ${filename}`);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  // Verificar se é uma imagem
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// === UPLOAD DE IMAGEM (VERSÃO CORRIGIDA FINAL) ===
const uploadImage = async (req, res, next) => {
  try {
    const uploadHandler = upload.single('image');

    uploadHandler(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
              success: false,
              error: { message: 'Arquivo muito grande. Máximo 5MB.' }
            });
          }
        }

        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: { message: err.message || 'Erro no upload do arquivo' }
        });
      }

      if (!req.file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: { message: 'Nenhum arquivo enviado' }
        });
      }

      // Normalizar modelKey
      const rawModelKey = req.body.modelKey || 'general';
      const modelKey = normalizeModelKey(rawModelKey);

      console.log(`📁 Movendo arquivo para pasta: ${modelKey}`);
      console.log(`📄 Arquivo temporário: ${req.file.path}`);

      // Criar pasta de destino no local correto
      const destinationPath = path.join(UPLOADS_ROOT, modelKey);
      console.log(`📁 Pasta de destino: ${destinationPath}`);

      await fs.mkdir(destinationPath, { recursive: true });

      // Novo caminho do arquivo
      const newFileName = req.file.filename;
      const newFilePath = path.join(destinationPath, newFileName);

      try {
        // Mover arquivo da pasta temp para a pasta correta
        await fs.rename(req.file.path, newFilePath);
        console.log(`✅ Arquivo movido para: ${newFilePath}`);
      } catch (moveError) {
        console.error(`❌ Erro ao mover arquivo: ${moveError.message}`);
        // Tentar copiar e depois deletar
        try {
          await fs.copyFile(req.file.path, newFilePath);
          await fs.unlink(req.file.path);
          console.log(`✅ Arquivo copiado e original removido: ${newFilePath}`);
        } catch (copyError) {
          console.error(`❌ Erro ao copiar arquivo: ${copyError.message}`);
          throw copyError;
        }
      }

      // 🔥 CORREÇÃO CRÍTICA: SEMPRE retornar URL no mesmo formato
      const imageUrl = `/uploads/${modelKey}/${newFileName}`;

      // 🔥 IMPORTANTE: Limpar URL para garantir consistência
      const cleanedImageUrl = cleanImageUrl(imageUrl);

      console.log(`🔍 DEBUG UPLOAD - modelKey: "${modelKey}"`);
      console.log(`🔍 DEBUG UPLOAD - fileName: "${newFileName}"`);
      console.log(`🔍 DEBUG UPLOAD - rawURL: "${imageUrl}"`);
      console.log(`🔍 DEBUG UPLOAD - cleanURL: "${cleanedImageUrl}"`);
      console.log(`✅ Upload realizado com sucesso: ${cleanedImageUrl}`);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Imagem enviada com sucesso',
        data: {
          // 🔥 SEMPRE usar a URL limpa e consistente
          imageUrl: cleanedImageUrl,
          filename: newFileName,
          originalName: req.file.originalname,
          size: req.file.size,
          modelKey: modelKey,
          // Debug info (remover em produção)
          debug: {
            rawUrl: imageUrl,
            cleanUrl: cleanedImageUrl,
            uploadsRoot: UPLOADS_ROOT,
            destinationPath: destinationPath
          }
        }
      });
    });

  } catch (error) {
    console.error('❌ Erro geral no upload:', error);
    next(error);
  }
};

// === FUNÇÃO AUXILIAR PARA BUSCAR ARQUIVO ===
async function findImageFile(imagePath) {
  const possiblePaths = [
    // Caminho original (específico do modelo)
    path.join(UPLOADS_ROOT, imagePath),
    // Caminho em 'general' (fallback)
    path.join(UPLOADS_ROOT, 'general', path.basename(imagePath)),
    // Caminho direto na pasta uploads (caso muito antigo)
    path.join(UPLOADS_ROOT, path.basename(imagePath))
  ];

  console.log(`🔍 Procurando arquivo em ${possiblePaths.length} locais possíveis:`);

  for (const fullPath of possiblePaths) {
    console.log(`   - Verificando: ${fullPath}`);
    try {
      await fs.access(fullPath);
      console.log(`   ✅ Arquivo encontrado: ${fullPath}`);
      return fullPath;
    } catch (error) {
      console.log(`   ❌ Não encontrado: ${fullPath}`);
    }
  }

  console.log(`❌ Arquivo não encontrado em nenhum local`);
  return null;
}

// === DELETAR IMAGEM  ===
const deleteImage = async (req, res, next) => {
  try {
    console.log('🗑️ deleteImage Controller: Iniciando exclusão');
    console.log('📄 deleteImage Controller: Body recebido:', req.body);

    const { imageUrl } = req.body;

    if (!imageUrl) {
      console.log('❌ deleteImage Controller: URL da imagem não fornecida');
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: { message: 'URL da imagem é obrigatória' }
      });
    }

    console.log(`🔍 deleteImage Controller: Processando URL: ${imageUrl}`);

    // 🔥 CORREÇÃO: Limpar URL antes de processar
    const cleanedImageUrl = cleanImageUrl(imageUrl);
    console.log(`🔍 deleteImage Controller: URL limpa: ${cleanedImageUrl}`);

    // Verificar se é uma URL do nosso sistema
    if (!cleanedImageUrl.includes('/uploads/')) {
      console.log('🔗 deleteImage Controller: URL externa detectada, rejeitando');
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: { message: 'Só é possível deletar imagens do sistema de uploads' }
      });
    }

    // Extrair caminho do arquivo da URL
    let imagePath = cleanedImageUrl.replace('/uploads/', '');

    // Remover qualquer duplicação restante
    if (imagePath.startsWith('uploads/')) {
      imagePath = imagePath.replace('uploads/', '');
    }

    console.log(`📁 deleteImage Controller: Caminho extraído: ${imagePath}`);

    // Buscar arquivo em vários locais possíveis
    const foundPath = await findImageFile(imagePath);

    if (foundPath) {
      console.log(`✅ deleteImage Controller: Arquivo localizado em: ${foundPath}`);

      try {
        await fs.unlink(foundPath);
        console.log(`🗑️ deleteImage Controller: Imagem deletada com sucesso: ${foundPath}`);

        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: 'Imagem deletada com sucesso',
          data: {
            deletedPath: foundPath,
            originalUrl: imageUrl,
            cleanedUrl: cleanedImageUrl,
            actualLocation: foundPath
          }
        });
      } catch (deleteError) {
        console.error(`❌ deleteImage Controller: Erro ao deletar arquivo: ${deleteError.message}`);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: {
            message: 'Erro ao deletar arquivo físico',
            details: deleteError.message
          }
        });
      }
    } else {
      console.warn(`⚠️ deleteImage Controller: Arquivo não encontrado em nenhum local`);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Imagem não encontrada (pode já ter sido deletada)',
        data: {
          searchedPath: imagePath,
          originalUrl: imageUrl,
          cleanedUrl: cleanedImageUrl,
          note: 'Arquivo não existia no sistema'
        }
      });
    }

  } catch (error) {
    console.error('❌ deleteImage Controller: Erro geral:', error);
    next(error);
  }
};

// === LISTAR IMAGENS DE UM MODELO  ===
const getModelImages = async (req, res, next) => {
  try {
    const { modelKey } = req.params;
    const normalizedModelKey = normalizeModelKey(modelKey);

    console.log(`📋 Listando imagens para modelo: ${modelKey} -> ${normalizedModelKey}`);

    const uploadPath = path.join(UPLOADS_ROOT, normalizedModelKey);

    try {
      const files = await fs.readdir(uploadPath);
      const images = files
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map(file => {
          // 🔥 CORREÇÃO: Sempre criar URL no mesmo formato
          const rawUrl = `/uploads/${normalizedModelKey}/${file}`;

          return {
            filename: file,
            url: cleanUrl, // 🔥 SEMPRE usar URL limpa
            path: path.join(uploadPath, file),
            // Debug info
            debug: {
              rawUrl: rawUrl,
            }
          };
        });

      console.log(`✅ Encontradas ${images.length} imagens para ${normalizedModelKey}`);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: images,
        modelKey: normalizedModelKey
      });
    } catch (dirError) {
      console.log(`📁 Diretório não existe: ${uploadPath}`);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: [],
        modelKey: normalizedModelKey,
        note: 'Diretório do modelo não existe ainda'
      });
    }

  } catch (error) {
    console.error('❌ Erro ao listar imagens:', error);
    next(error);
  }
};

// === FUNÇÃO DE MIGRAÇÃO PARA REORGANIZAR IMAGENS ANTIGAS ===
const migrateImages = async (req, res, next) => {
  try {
    console.log('🔄 Iniciando migração de imagens...');

    const generalPath = path.join(UPLOADS_ROOT, 'general');
    const results = {
      moved: [],
      errors: [],
      total: 0
    };

    try {
      const files = await fs.readdir(generalPath);
      const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));

      results.total = imageFiles.length;
      console.log(`📊 Encontrados ${imageFiles.length} arquivos de imagem em /general`);

      for (const file of imageFiles) {
        try {
          const sourcePath = path.join(generalPath, file);
          const stats = await fs.stat(sourcePath);

          // Tentar determinar o modelo baseado no nome do arquivo
          let targetModelKey = 'general';

          // Lógica para determinar modelo baseado no nome
          if (file.includes('primary') || file.includes('rifle') || file.includes('assault')) {
            targetModelKey = 'primary-weapons';
          } else if (file.includes('secondary') || file.includes('pistol') || file.includes('sidearm')) {
            targetModelKey = 'secondary-weapons';
          } else if (file.includes('grenade') || file.includes('throwable')) {
            targetModelKey = 'throwables';
          } else if (file.includes('stratagem')) {
            targetModelKey = 'stratagems';
          } else if (file.includes('armor')) {
            targetModelKey = 'armors';
          } else if (file.includes('passive')) {
            targetModelKey = 'passive-armors';
          } else if (file.includes('perk')) {
            targetModelKey = 'perks';
          }

          if (targetModelKey !== 'general') {
            const targetPath = path.join(UPLOADS_ROOT, targetModelKey);
            await fs.mkdir(targetPath, { recursive: true });

            const targetFilePath = path.join(targetPath, file);
            await fs.rename(sourcePath, targetFilePath);

            results.moved.push({
              file: file,
              from: 'general',
              to: targetModelKey,
              url: cleanImageUrl(`/uploads/${targetModelKey}/${file}`)
            });

            console.log(`✅ Migrado: ${file} -> ${targetModelKey}`);
          }
        } catch (error) {
          results.errors.push({
            file: file,
            error: error.message
          });
          console.error(`❌ Erro ao migrar ${file}:`, error.message);
        }
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Migração concluída',
        data: results
      });

    } catch (dirError) {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Pasta /general não existe, nada para migrar',
        data: { moved: [], errors: [], total: 0 }
      });
    }

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    next(error);
  }
};

// === FUNÇÃO PARA LIMPAR PASTAS INCORRETAS ===
const cleanupIncorrectDirectories = async (req, res, next) => {
  try {
    console.log('🧹 Iniciando limpeza de diretórios incorretos...');

    const incorrectPaths = [
      path.join(__dirname, '../../../uploads'), // Dois níveis acima
      path.join(__dirname, '../uploads'),       // Um nível acima (src/uploads)
      path.join(__dirname, 'uploads')           // Dentro de src/
    ];

    const results = {
      cleaned: [],
      errors: [],
      totalRemoved: 0,
      filesMoved: []
    };

    for (const incorrectPath of incorrectPaths) {
      try {
        console.log(`🔍 Verificando pasta incorreta: ${incorrectPath}`);

        // Verificar se existe
        await fs.access(incorrectPath);

        // Se existe, listar conteúdo
        const files = await fs.readdir(incorrectPath);
        console.log(`📂 Encontrados ${files.length} itens em ${incorrectPath}`);

        if (files.length > 0) {
          // Mover arquivos para o local correto se possível
          for (const file of files) {
            const sourcePath = path.join(incorrectPath, file);
            const stats = await fs.stat(sourcePath);

            if (stats.isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
              const targetPath = path.join(UPLOADS_ROOT, 'general', file);

              try {
                // Garantir que a pasta de destino existe
                await fs.mkdir(path.join(UPLOADS_ROOT, 'general'), { recursive: true });

                // Mover arquivo
                await fs.rename(sourcePath, targetPath);
                results.totalRemoved++;
                results.filesMoved.push({
                  file: file,
                  from: incorrectPath,
                  to: targetPath,
                  url: cleanImageUrl(`/uploads/general/${file}`)
                });
                console.log(`✅ Movido: ${file} -> ${targetPath}`);
              } catch (moveError) {
                console.error(`❌ Erro ao mover ${file}:`, moveError.message);
                results.errors.push(`Erro ao mover ${file}: ${moveError.message}`);
              }
            }
          }
        }

        // Tentar remover diretório vazio
        try {
          const remainingFiles = await fs.readdir(incorrectPath);
          if (remainingFiles.length === 0) {
            await fs.rmdir(incorrectPath);
            results.cleaned.push(incorrectPath);
            console.log(`🗑️ Diretório removido: ${incorrectPath}`);
          }
        } catch (rmError) {
          console.warn(`⚠️ Não foi possível remover ${incorrectPath}:`, rmError.message);
        }

      } catch (accessError) {
        console.log(`✅ Pasta não existe (ok): ${incorrectPath}`);
      }
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Limpeza de diretórios concluída',
      data: results,
      currentUploadsPath: UPLOADS_ROOT
    });

  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
    next(error);
  }
};


module.exports = {
  uploadImage,
  deleteImage,
  getModelImages,
  migrateImages,
  cleanupIncorrectDirectories,
  upload
};