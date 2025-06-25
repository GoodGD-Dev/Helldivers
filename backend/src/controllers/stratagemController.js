const Stratagem = require('../models/Stratagem');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

// 📋 Listar todos os stratagemas
const getAllStratagems = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, name } = req.query;
    const skip = (page - 1) * limit;

    const filters = {};
    if (category) filters.category = { $regex: category, $options: 'i' };
    if (name) filters.name = { $regex: name, $options: 'i' };

    const stratagems = await Stratagem.find(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Stratagem.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stratagems,
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

// 🔍 Buscar stratagem por ID
const getStratagemById = async (req, res, next) => {
  try {
    const stratagem = await Stratagem.findById(req.params.id);

    if (!stratagem) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: ERROR_MESSAGES.NOT_FOUND }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stratagem
    });
  } catch (error) {
    next(error);
  }
};

// ➕ Criar novo stratagem
const createStratagem = async (req, res, next) => {
  try {
    const stratagem = new Stratagem(req.body);
    await stratagem.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      data: stratagem
    });
  } catch (error) {
    next(error);
  }
};

// ✏️ Atualizar stratagem
const updateStratagem = async (req, res, next) => {
  try {
    const stratagem = await Stratagem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!stratagem) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: ERROR_MESSAGES.NOT_FOUND }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      data: stratagem
    });
  } catch (error) {
    next(error);
  }
};

// 🗑️ Deletar stratagem
const deleteStratagem = async (req, res, next) => {
  try {
    const stratagem = await Stratagem.findByIdAndDelete(req.params.id);

    if (!stratagem) {
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

// 📊 Estatísticas dos stratagemas
const getStratagemStats = async (req, res, next) => {
  try {
    const stats = await Stratagem.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgCooldown: { $avg: '$cooldown' },
          maxCooldown: { $max: '$cooldown' },
          minCooldown: { $min: '$cooldown' },
          avgUses: { $avg: '$uses' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalStratagems = await Stratagem.countDocuments();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        totalStratagems,
        byCategory: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStratagems,
  getStratagemById,
  createStratagem,
  updateStratagem,
  deleteStratagem,
  getStratagemStats
};