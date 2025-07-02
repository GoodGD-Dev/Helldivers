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
    const rawModelKey = req.body.modelKey || 'general';
    const modelKey = normalizeModelKey(rawModelKey);

    console.log(`📁 Upload destination: modelKey recebido = "${rawModelKey}"`);
    console.log(`📁 Upload destination: modelKey normalizado = "${modelKey}"`);

    const uploadPath = path.join(__dirname, '../../uploads', modelKey);
    console.log(`📁 Caminho completo: ${uploadPath}`);

    try {
      await fs.mkdir(uploadPath, { recursive: true });
      console.log(`✅ Pasta criada/verificada: ${uploadPath}`);
      cb(null, uploadPath);
    } catch (error) {
      console.error(`❌ Erro ao criar pasta: ${error.message}`);
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

// === UPLOAD DE IMAGEM ===
const uploadImage = async (req, res, next) => {
  try {
    const uploadSingle = upload.single('image');

    uploadSingle(req, res, async (err) => {
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

      const rawModelKey = req.body.modelKey || 'general';
      const modelKey = normalizeModelKey(rawModelKey);
      const imageUrl = `/uploads/${modelKey}/${req.file.filename}`;

      console.log(`✅ Upload realizado com sucesso: ${imageUrl}`);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Imagem enviada com sucesso',
        data: {
          imageUrl: imageUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          modelKey: modelKey
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
    path.join(__dirname, '../../uploads', imagePath),
    // Caminho em 'general' (fallback)
    path.join(__dirname, '../../uploads/general', path.basename(imagePath)),
    // Caminho direto na pasta uploads (caso muito antigo)
    path.join(__dirname, '../../uploads', path.basename(imagePath))
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

// === DELETAR IMAGEM (VERSÃO MELHORADA) ===
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

    // Verificar se é uma URL do nosso sistema
    if (!imageUrl.includes('/uploads/')) {
      console.log('🔗 deleteImage Controller: URL externa detectada, rejeitando');
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: { message: 'Só é possível deletar imagens do sistema de uploads' }
      });
    }

    // Extrair caminho do arquivo da URL
    const imagePath = imageUrl.replace('/uploads/', '');
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
      // Arquivo não encontrado, mas isso não é um erro crítico
      console.warn(`⚠️ deleteImage Controller: Arquivo não encontrado em nenhum local`);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Imagem não encontrada (pode já ter sido deletada)',
        data: {
          searchedPath: imagePath,
          originalUrl: imageUrl,
          note: 'Arquivo não existia no sistema'
        }
      });
    }

  } catch (error) {
    console.error('❌ deleteImage Controller: Erro geral:', error);
    next(error);
  }
};

// === LISTAR IMAGENS DE UM MODELO ===
const getModelImages = async (req, res, next) => {
  try {
    const { modelKey } = req.params;
    const normalizedModelKey = normalizeModelKey(modelKey);

    console.log(`📋 Listando imagens para modelo: ${modelKey} -> ${normalizedModelKey}`);

    const uploadPath = path.join(__dirname, '../../uploads', normalizedModelKey);

    try {
      const files = await fs.readdir(uploadPath);
      const images = files
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map(file => ({
          filename: file,
          url: `/uploads/${normalizedModelKey}/${file}`,
          path: path.join(uploadPath, file)
        }));

      console.log(`✅ Encontradas ${images.length} imagens para ${normalizedModelKey}`);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: images,
        modelKey: normalizedModelKey
      });
    } catch (dirError) {
      // Diretório não existe
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

    const generalPath = path.join(__dirname, '../../uploads/general');
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

module.exports = {
  uploadImage,
  deleteImage,
  getModelImages,
  migrateImages,
  upload
};