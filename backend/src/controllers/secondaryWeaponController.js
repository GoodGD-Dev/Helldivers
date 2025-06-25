// 🔫 Controller para Armas Secundárias
const SecondaryWeapon = require('../models/SecondaryWeapon');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

// 📋 Listar todas as armas secundárias
const getAllSecondaryWeapons = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, name } = req.query;
    const skip = (page - 1) * limit;

    const filters = {};
    if (type) filters.type = { $regex: type, $options: 'i' };
    if (name) filters.name = { $regex: name, $options: 'i' };

    const weapons = await SecondaryWeapon.find(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await SecondaryWeapon.countDocuments(filters);
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

// 🔍 Buscar arma secundária por ID
const getSecondaryWeaponById = async (req, res, next) => {
  try {
    const weapon = await SecondaryWeapon.findById(req.params.id);

    if (!weapon) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: ERROR_MESSAGES.NOT_FOUND }
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

// ➕ Criar nova arma secundária
const createSecondaryWeapon = async (req, res, next) => {
  try {
    const weapon = new SecondaryWeapon(req.body);
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

// ✏️ Atualizar arma secundária
const updateSecondaryWeapon = async (req, res, next) => {
  try {
    const weapon = await SecondaryWeapon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!weapon) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: ERROR_MESSAGES.NOT_FOUND }
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

// 🗑️ Deletar arma secundária
const deleteSecondaryWeapon = async (req, res, next) => {
  try {
    const weapon = await SecondaryWeapon.findByIdAndDelete(req.params.id);

    if (!weapon) {
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
  getAllSecondaryWeapons,
  getSecondaryWeaponById,
  createSecondaryWeapon,
  updateSecondaryWeapon,
  deleteSecondaryWeapon
};