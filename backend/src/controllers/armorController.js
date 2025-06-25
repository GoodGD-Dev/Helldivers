const Armor = require('../models/Armor');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

// 📋 Listar todas as armaduras
const getAllArmors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, name } = req.query;
    const skip = (page - 1) * limit;

    const filters = {};
    if (type) filters.type = { $regex: type, $options: 'i' };
    if (name) filters.name = { $regex: name, $options: 'i' };

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