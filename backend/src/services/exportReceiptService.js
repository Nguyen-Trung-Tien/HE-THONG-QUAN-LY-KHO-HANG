const db = require("../models/index");

const getAllExportReceipts = async ({ page, limit, search }) => {
  const offset = (page - 1) * limit;
  const where = {};

  if (search) {
    const { Op } = require("sequelize");
    where[Op.or] = [
      { reason: { [Op.like]: `%${search}%` } },
      { note: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await db.ExportReceipts.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      { model: db.User, as: "userData" },
      {
        model: db.ExportDetails,
        as: "exportDetailData",
        include: [{ model: db.Stock, as: "StockProductData" }],
      },
    ],
    distinct: true,
    order: [["export_date", "DESC"], ["id", "DESC"]],
  });

  return {
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    receipts: rows,
  };
};

const getExportReceiptById = async (id) => {
  const receipt = await db.ExportReceipts.findByPk(id, {
    include: [
      { model: db.User, as: "userData" },
      {
        model: db.ExportDetails,
        as: "exportDetailData",
        include: [{ model: db.Stock, as: "StockProductData" }],
      },
    ],
  });
  if (!receipt) throw new Error("Export receipt not found");
  return receipt;
};

const createExportReceipt = async (data) => {
  const { exportDetailData, ...receiptData } = data;
  const t = await db.sequelize.transaction();

  try {
    const receipt = await db.ExportReceipts.create(receiptData, { transaction: t });

    if (exportDetailData && exportDetailData.length > 0) {
      for (const d of exportDetailData) {
        const stock = await db.Stock.findByPk(d.productId, { transaction: t });
        if (!stock) throw new Error(`Stock with ID ${d.productId} not found`);
        if (stock.stock < d.quantity) throw new Error(`Insufficient stock for product ${stock.name}`);

        const oldQuantity = stock.stock;
        await stock.decrement("stock", { by: d.quantity, transaction: t });

        // FIFO/FEFO Batch Allocation
        let remainingQty = Number(d.quantity);
        const sortedBatches = await db.StockBatch.findAll({
          where: { productId: d.productId, quantity: { [db.Op?.gt || db.Sequelize.Op.gt]: 0 } },
          order: [
            [db.sequelize.literal('CASE WHEN expiryDate IS NULL THEN 1 ELSE 0 END'), 'ASC'],
            ['expiryDate', 'ASC'],
            ['id', 'ASC']
          ],
          transaction: t
        });

        const totalAvailableInBatches = sortedBatches.reduce((sum, b) => sum + b.quantity, 0);
        if (totalAvailableInBatches < remainingQty) {
          throw new Error(`Không đủ hàng tồn trong các lô cho sản phẩm ${stock.name} (Yêu cầu: ${remainingQty}, Hiện có trong các lô: ${totalAvailableInBatches})`);
        }

        for (const batch of sortedBatches) {
          if (remainingQty <= 0) break;

          const deductQty = Math.min(batch.quantity, remainingQty);
          await batch.decrement("quantity", { by: deductQty, transaction: t });

          await db.ExportDetails.create({
            exportId: receipt.id,
            productId: d.productId,
            quantity: deductQty,
            batchNumber: batch.batchNumber,
          }, { transaction: t });

          remainingQty -= deductQty;
        }

        // Fallback check
        if (remainingQty > 0) {
          await db.ExportDetails.create({
            exportId: receipt.id,
            productId: d.productId,
            quantity: remainingQty,
            batchNumber: null,
          }, { transaction: t });
        }

        await db.InventoryLog.create({
          stockId: stock.id,
          userId: receiptData.userId || null,
          change_type: "EXPORT",
          quantity: -d.quantity,
          qtyBefore: oldQuantity,
          qtyAfter: oldQuantity - d.quantity,
          note: `Xuất hàng từ phiếu #${receipt.id}`,
        }, { transaction: t });
      }
    }

    await t.commit();
    return await getExportReceiptById(receipt.id);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const updateExportReceipt = async (id, data) => {
  const { exportDetailData, ...receiptData } = data;
  const t = await db.sequelize.transaction();

  try {
    const receipt = await db.ExportReceipts.findByPk(id, { transaction: t });
    if (!receipt) throw new Error("Export receipt not found");

    // 1. Revert old stock levels and batch levels
    const oldDetails = await db.ExportDetails.findAll({
      where: { exportId: id },
      transaction: t,
    });

    for (const oldItem of oldDetails) {
      const stock = await db.Stock.findByPk(oldItem.productId, { transaction: t });
      if (stock) {
        await stock.increment("stock", { by: Number(oldItem.quantity), transaction: t });
      }
      if (oldItem.batchNumber) {
        const batch = await db.StockBatch.findOne({
          where: { productId: oldItem.productId, batchNumber: oldItem.batchNumber },
          transaction: t
        });
        if (batch) {
          await batch.increment("quantity", { by: Number(oldItem.quantity), transaction: t });
        }
      }
    }

    // 2. Update receipt info
    await receipt.update(receiptData, { transaction: t });

    // 3. Replace details and apply new stock levels
    await db.ExportDetails.destroy({ where: { exportId: id }, transaction: t });

    if (exportDetailData && exportDetailData.length > 0) {
      for (const d of exportDetailData) {
        const stock = await db.Stock.findByPk(d.productId, { transaction: t });
        if (!stock) throw new Error(`Stock with ID ${d.productId} not found`);
        
        const oldQuantity = stock.stock;
        if (oldQuantity < d.quantity) throw new Error(`Insufficient stock for product ${stock.name}`);

        await stock.decrement("stock", { by: d.quantity, transaction: t });

        // FIFO/FEFO Batch Allocation
        let remainingQty = Number(d.quantity);
        const sortedBatches = await db.StockBatch.findAll({
          where: { productId: d.productId, quantity: { [db.Op?.gt || db.Sequelize.Op.gt]: 0 } },
          order: [
            [db.sequelize.literal('CASE WHEN expiryDate IS NULL THEN 1 ELSE 0 END'), 'ASC'],
            ['expiryDate', 'ASC'],
            ['id', 'ASC']
          ],
          transaction: t
        });

        const totalAvailableInBatches = sortedBatches.reduce((sum, b) => sum + b.quantity, 0);
        if (totalAvailableInBatches < remainingQty) {
          throw new Error(`Không đủ hàng tồn trong các lô cho sản phẩm ${stock.name} (Yêu cầu: ${remainingQty}, Hiện có trong các lô: ${totalAvailableInBatches})`);
        }

        for (const batch of sortedBatches) {
          if (remainingQty <= 0) break;

          const deductQty = Math.min(batch.quantity, remainingQty);
          await batch.decrement("quantity", { by: deductQty, transaction: t });

          await db.ExportDetails.create({
            exportId: id,
            productId: d.productId,
            quantity: deductQty,
            batchNumber: batch.batchNumber,
          }, { transaction: t });

          remainingQty -= deductQty;
        }

        if (remainingQty > 0) {
          await db.ExportDetails.create({
            exportId: id,
            productId: d.productId,
            quantity: remainingQty,
            batchNumber: null,
          }, { transaction: t });
        }

        await db.InventoryLog.create({
          stockId: stock.id,
          userId: receiptData.userId || null,
          change_type: "EXPORT",
          quantity: -d.quantity,
          qtyBefore: oldQuantity,
          qtyAfter: oldQuantity - d.quantity,
          note: `Cập nhật phiếu xuất #${id}`,
        }, { transaction: t });
      }
    }

    await t.commit();
    return await getExportReceiptById(id);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const deleteExportReceipt = async (id) => {
  const t = await db.sequelize.transaction();
  try {
    const receipt = await db.ExportReceipts.findByPk(id, { transaction: t });
    if (!receipt) throw new Error("Export receipt not found");

    // Revert stock and batches before deleting
    const details = await db.ExportDetails.findAll({
      where: { exportId: id },
      transaction: t,
    });

    for (const item of details) {
      const stock = await db.Stock.findByPk(item.productId, { transaction: t });
      if (stock) {
        await stock.increment("stock", { by: Number(item.quantity), transaction: t });
      }
      if (item.batchNumber) {
        const batch = await db.StockBatch.findOne({
          where: { productId: item.productId, batchNumber: item.batchNumber },
          transaction: t
        });
        if (batch) {
          await batch.increment("quantity", { by: Number(item.quantity), transaction: t });
        }
      }
    }

    await db.ExportDetails.destroy({ where: { exportId: id }, transaction: t });
    await receipt.destroy({ transaction: t });
    
    await t.commit();
    return true;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

module.exports = {
  getAllExportReceipts,
  getExportReceiptById,
  createExportReceipt,
  updateExportReceipt,
  deleteExportReceipt,
};
