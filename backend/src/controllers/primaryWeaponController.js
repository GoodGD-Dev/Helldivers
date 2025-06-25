// 🔫 Controller para Armas Primárias
const PrimaryWeapon = require('../models/PrimaryWeapon');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

// 📋 Listar todas as armas primárias
const getAllPrimaryWeapons = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, name } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const filters = {};
    if (type) filters.type = { $regex: type, $options: 'i' };
    if (name) filters.name = { $regex: name, $options: 'i' };

    // Buscar com paginação
    const weapons = await PrimaryWeapon.find(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await PrimaryWeapon.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: weapons,
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

// 🔍 Buscar arma primária por ID
const getPrimaryWeaponById = async (req, res, next) => {
  try {
    const weapon = await PrimaryWeapon.findById(req.params.id);

    if (!weapon) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.NOT_FOUND
        }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: weapon
    });
  } catch (error) {
    next(error);
  }
};

// ➕ Criar nova arma primária
const createPrimaryWeapon = async (req, res, next) => {
  try {
    const weapon = new PrimaryWeapon(req.body);
    await weapon.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      data: weapon
    });
  } catch (error) {
    next(error);
  }
};

// ✏️ Atualizar arma primária
const updatePrimaryWeapon = async (req, res, next) => {
  try {
    const weapon = await PrimaryWeapon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!weapon) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.NOT_FOUND
        }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      data: weapon
    });
  } catch (error) {
    next(error);
  }
};

// 🗑️ Deletar arma primária
const deletePrimaryWeapon = async (req, res, next) => {
  try {
    const weapon = await PrimaryWeapon.findByIdAndDelete(req.params.id);

    if (!weapon) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.NOT_FOUND
        }
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

// 📊 Estatísticas das armas primárias
const getPrimaryWeaponStats = async (req, res, next) => {
  try {
    const stats = await PrimaryWeapon.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgDamage: { $avg: '$damage' },
          maxDamage: { $max: '$damage' },
          minDamage: { $min: '$damage' },
          avgFireRate: { $avg: '$fireRate' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalWeapons = await PrimaryWeapon.countDocuments();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        totalWeapons,
        byType: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPrimaryWeapons,
  getPrimaryWeaponById,
  createPrimaryWeapon,
  updatePrimaryWeapon,
  deletePrimaryWeapon,
  getPrimaryWeaponStats
};