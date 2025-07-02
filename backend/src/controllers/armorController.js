const Armor = require('../models/Armor');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

// 📋 Listar todas as armaduras
const getAllArmors = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      name,
      passiveName,
      passiveEffect,
      minArmorRating,
      maxArmorRating,
      minSpeed,
      maxSpeed
    } = req.query;

    // Se há filtros de passiva, usar aggregation pipeline
    if (passiveName || passiveEffect) {
      const pipeline = [
        // Lookup para fazer join com PassiveArmor
        {
          $lookup: {
            from: 'passivearmors',
            localField: 'passive',
            foreignField: '_id',
            as: 'passive'
          }
        },
        // Unwind para transformar array em objeto
        {
          $unwind: {
            path: '$passive',
            preserveNullAndEmptyArrays: true
          }
        }
      ];

      // Construir filtros
      const matchStage = {};
      if (type) matchStage.type = { $regex: type, $options: 'i' };
      if (name) matchStage.name = { $regex: name, $options: 'i' };
      if (passiveName) matchStage['passive.name'] = { $regex: passiveName, $options: 'i' };
      if (passiveEffect) matchStage['passive.effect'] = { $regex: passiveEffect, $options: 'i' };

      // Filtros numéricos
      if (minArmorRating) matchStage.armorRating = { $gte: parseInt(minArmorRating) };
      if (maxArmorRating) {
        matchStage.armorRating = matchStage.armorRating || {};
        matchStage.armorRating.$lte = parseInt(maxArmorRating);
      }
      if (minSpeed) matchStage.speed = { $gte: parseInt(minSpeed) };
      if (maxSpeed) {
        matchStage.speed = matchStage.speed || {};
        matchStage.speed.$lte = parseInt(maxSpeed);
      }

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      // Adicionar campos virtuais
      pipeline.push({
        $addFields: {
          mobilityRating: {
            $switch: {
              branches: [
                { case: { $gte: [{ $avg: ['$speed', '$staminaRegen'] }, 80] }, then: 'Excelente' },
                { case: { $gte: [{ $avg: ['$speed', '$staminaRegen'] }, 60] }, then: 'Boa' },
                { case: { $gte: [{ $avg: ['$speed', '$staminaRegen'] }, 40] }, then: 'Média' },
                { case: { $gte: [{ $avg: ['$speed', '$staminaRegen'] }, 20] }, then: 'Baixa' }
              ],
              default: 'Muito Baixa'
            }
          },
          protectionRating: {
            $switch: {
              branches: [
                { case: { $gte: ['$armorRating', 400] }, then: 'Máxima' },
                { case: { $gte: ['$armorRating', 300] }, then: 'Alta' },
                { case: { $gte: ['$armorRating', 200] }, then: 'Média' },
                { case: { $gte: ['$armorRating', 100] }, then: 'Baixa' }
              ],
              default: 'Mínima'
            }
          }
        }
      });

      // Contar total antes da paginação
      const totalPipeline = [...pipeline, { $count: 'total' }];
      const totalResult = await Armor.aggregate(totalPipeline);
      const total = totalResult.length > 0 ? totalResult[0].total : 0;

      // Aplicar ordenação e paginação
      pipeline.push(
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * parseInt(limit) },
        { $limit: parseInt(limit) }
      );

      const armors = await Armor.aggregate(pipeline);
      const totalPages = Math.ceil(total / limit);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: armors,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    }

    // Caso padrão: sem filtros de passiva
    const filters = {};
    if (type) filters.type = { $regex: type, $options: 'i' };
    if (name) filters.name = { $regex: name, $options: 'i' };

    // Filtros numéricos
    if (minArmorRating) filters.armorRating = { $gte: parseInt(minArmorRating) };
    if (maxArmorRating) {
      filters.armorRating = filters.armorRating || {};
      filters.armorRating.$lte = parseInt(maxArmorRating);
    }
    if (minSpeed) filters.speed = { $gte: parseInt(minSpeed) };
    if (maxSpeed) {
      filters.speed = filters.speed || {};
      filters.speed.$lte = parseInt(maxSpeed);
    }

    const skip = (page - 1) * limit;
    const armors = await Armor.find(filters)
      .populate('passive')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Armor.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: armors,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    next(error);
  }
};

// 🔍 Buscar armadura por ID
const getArmorById = async (req, res, next) => {
  try {
    const armor = await Armor.findById(req.params.id).populate('passive');

    if (!armor) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: ERROR_MESSAGES.NOT_FOUND }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: armor
    });
  } catch (error) {
    next(error);
  }
};

// ➕ Criar nova armadura
const createArmor = async (req, res, next) => {
  try {
    const armor = new Armor(req.body);
    await armor.save();
    await armor.populate('passive');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      data: armor
    });
  } catch (error) {
    next(error);
  }
};

// ✏️ Atualizar armadura
const updateArmor = async (req, res, next) => {
  try {
    const armor = await Armor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('passive');

    if (!armor) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: ERROR_MESSAGES.NOT_FOUND }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      data: armor
    });
  } catch (error) {
    next(error);
  }
};

// 🗑️ Deletar armadura
const deleteArmor = async (req, res, next) => {
  try {
    const armor = await Armor.findByIdAndDelete(req.params.id);

    if (!armor) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: ERROR_MESSAGES.NOT_FOUND }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.DELETED,
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};

// 📊 Estatísticas das armaduras
const getArmorStats = async (req, res, next) => {
  try {
    const stats = await Armor.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgArmorRating: { $avg: '$armorRating' },
          maxArmorRating: { $max: '$armorRating' },
          minArmorRating: { $min: '$armorRating' },
          avgSpeed: { $avg: '$speed' },
          avgStaminaRegen: { $avg: '$staminaRegen' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalArmors = await Armor.countDocuments();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        totalArmors,
        byType: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllArmors,
  getArmorById,
  createArmor,
  updateArmor,
  deleteArmor,
  getArmorStats
};