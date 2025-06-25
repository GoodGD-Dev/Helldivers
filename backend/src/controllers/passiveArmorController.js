const PassiveArmor = require('../models/PassiveArmor');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

// 📋 Listar todas as passivas de armadura
const getAllPassiveArmors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, name } = req.query;
    const skip = (page - 1) * limit;

    const filters = {};
    if (name) filters.name = { $regex: name, $options: 'i' };

    const passiveArmors = await PassiveArmor.find(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await PassiveArmor.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: passiveArmors,
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

// 🔍 Buscar passiva de armadura por ID
const getPassiveArmorById = async (req, res, next) => {
  try {
    const passiveArmor = await PassiveArmor.findById(req.params.id);

    if (!passiveArmor) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: ERROR_MESSAGES.NOT_FOUND }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: passiveArmor
    });
  } catch (error) {
    next(error);
  }
};

// ➕ Criar nova passiva de armadura
const createPassiveArmor = async (req, res, next) => {
  try {
    const passiveArmor = new PassiveArmor(req.body);
    await passiveArmor.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      data: passiveArmor
    });
  } catch (error) {
    next(error);
  }
};

// ✏️ Atualizar passiva de armadura
const updatePassiveArmor = async (req, res, next) => {
  try {
    const passiveArmor = await PassiveArmor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!passiveArmor) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: ERROR_MESSAGES.NOT_FOUND }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      data: passiveArmor
    });
  } catch (error) {
    next(error);
  }
};

// 🗑️ Deletar passiva de armadura
const deletePassiveArmor = async (req, res, next) => {
  try {
    const passiveArmor = await PassiveArmor.findByIdAndDelete(req.params.id);

    if (!passiveArmor) {
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

module.exports = {
  getAllPassiveArmors,
  getPassiveArmorById,
  createPassiveArmor,
  updatePassiveArmor,
  deletePassiveArmor
};