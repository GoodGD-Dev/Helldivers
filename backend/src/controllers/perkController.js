const Perk = require('../models/Perk');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

// 📋 Listar todos os perks
const getAllPerks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, name } = req.query;
    const skip = (page - 1) * limit;

    const filters = {};
    if (name) filters.name = { $regex: name, $options: 'i' };

    const perks = await Perk.find(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Perk.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: perks,
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

// 🔍 Buscar perk por ID
const getPerkById = async (req, res, next) => {
  try {
    const perk = await Perk.findById(req.params.id);

    if (!perk) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: ERROR_MESSAGES.NOT_FOUND }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: perk
    });
  } catch (error) {
    next(error);
  }
};

// ➕ Criar novo perk
const createPerk = async (req, res, next) => {
  try {
    const perk = new Perk(req.body);
    await perk.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      data: perk
    });
  } catch (error) {
    next(error);
  }
};

// ✏️ Atualizar perk
const updatePerk = async (req, res, next) => {
  try {
    const perk = await Perk.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!perk) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: ERROR_MESSAGES.NOT_FOUND }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      data: perk
    });
  } catch (error) {
    next(error);
  }
};

// 🗑️ Deletar perk
const deletePerk = async (req, res, next) => {
  try {
    const perk = await Perk.findByIdAndDelete(req.params.id);

    if (!perk) {
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
  getAllPerks,
  getPerkById,
  createPerk,
  updatePerk,
  deletePerk
};