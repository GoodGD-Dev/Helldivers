const Throwable = require('../models/Throwable');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

// 📋 Listar todos os throwables
const getAllThrowables = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, name } = req.query;
    const skip = (page - 1) * limit;

    const filters = {};
    if (type) filters.type = { $regex: type, $options: 'i' };
    if (name) filters.name = { $regex: name, $options: 'i' };

    const throwables = await Throwable.find(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Throwable.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: throwables,
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

// 🔍 Buscar throwable por ID
const getThrowableById = async (req, res, next) => {
  try {
    const throwable = await Throwable.findById(req.params.id);

    if (!throwable) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: ERROR_MESSAGES.NOT_FOUND }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: throwable
    });
  } catch (error) {
    next(error);
  }
};

// ➕ Criar novo throwable
const createThrowable = async (req, res, next) => {
  try {
    const throwable = new Throwable(req.body);
    await throwable.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      data: throwable
    });
  } catch (error) {
    next(error);
  }
};

// ✏️ Atualizar throwable
const updateThrowable = async (req, res, next) => {
  try {
    const throwable = await Throwable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!throwable) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: ERROR_MESSAGES.NOT_FOUND }
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      data: throwable
    });
  } catch (error) {
    next(error);
  }
};

// 🗑️ Deletar throwable
const deleteThrowable = async (req, res, next) => {
  try {
    const throwable = await Throwable.findByIdAndDelete(req.params.id);

    if (!throwable) {
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

// 📊 Estatísticas dos throwables
const getThrowableStats = async (req, res, next) => {
  try {
    const stats = await Throwable.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgDamage: { $avg: '$damage' },
          maxDamage: { $max: '$damage' },
          minDamage: { $min: '$damage' },
          avgBlastRadius: { $avg: '$blastRadius' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalThrowables = await Throwable.countDocuments();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        totalThrowables,
        byType: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllThrowables,
  getThrowableById,
  createThrowable,
  updateThrowable,
  deleteThrowable,
  getThrowableStats
};