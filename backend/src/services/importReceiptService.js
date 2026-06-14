const db = require("../models");

const getAllImportReceipts = async ({ page, limit, search }) => {
  const offset = (page - 1) * limit;
  const where = {};

  if (search) {
    const { Op } = require("sequelize");
    where[Op.or] = [
      { note: { [Op.like]: `%${search}%` } },
      // Thêm search theo supplier name hoặc user email nếu cần, 
      // nhưng Sequelize require include association for that.
    ];
  }

  const { count, rows } = await db.ImportReceipts.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      { model: db.User, as: "userData" },
      { model: db.Suppliers, as: "supplierData" },
      {
        model: db.ImportDetails,
        as: "importDetailData",
        include: [{ model: db.Stock, as: "StockProductData" }],
      },
    ],
    distinct: true, // Tránh đếm sai khi include 1-n
    order: [["import_date", "DESC"], ["id", "DESC"]],
  });

  return {
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    receipts: rows,
  };
};

const getImportReceiptById = async (id) => {
  const receipt = await db.ImportReceipts.findByPk(id, {
    include: [
      { model: db.Suppliers, as: "supplierData" },
      { model: db.User, as: "userData" },
      {
        model: db.ImportDetails,
        as: "importDetailData",
        include: [{ model: db.Stock, as: "StockProductData" }],
      },
    ],
  });
  if (!receipt) throw new Error(`Import receipt with ID ${id} not found`);
  return receipt;
};

const createImportReceipt = async (data) => {
  const { details, ...receiptData } = data;
  const t = await db.sequelize.transaction();
  try {
    const receipt = await db.ImportReceipts.create(receiptData, { transaction: t });

    if (details?.length) {
      const detailData = details.map((item) => ({
        importId: receipt.id,
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        price: String(item.price),
        batchNumber: item.batchNumber || null,
        expiryDate: item.expiryDate || null,
      }));
      await db.ImportDetails.bulkCreate(detailData, { transaction: t });

      // Tăng stock cho từng sản phẩm và ghi log, đồng thời cập nhật StockBatch
      for (const item of details) {
        const stock = await db.Stock.findByPk(item.productId, { transaction: t });
        if (stock) {
          const oldQuantity = stock.stock;
          await stock.increment("stock", { by: Number(item.quantity), transaction: t });
          
          await db.InventoryLog.create({
            stockId: stock.id,
            userId: receiptData.userId || null,
            change_type: "IMPORT",
            quantity: Number(item.quantity),
            qtyBefore: oldQuantity,
            qtyAfter: oldQuantity + Number(item.quantity),
            note: `Nhập hàng từ phiếu #${receipt.id}`,
          }, { transaction: t });

          if (item.batchNumber) {
            const [batch, created] = await db.StockBatch.findOrCreate({
              where: { productId: item.productId, batchNumber: item.batchNumber },
              defaults: {
                quantity: 0,
                expiryDate: item.expiryDate || null,
                purchasePrice: Number(item.price) || 0,
              },
              transaction: t,
            });
            await batch.increment("quantity", { by: Number(item.quantity), transaction: t });
            if (!created) {
              await batch.update({
                expiryDate: item.expiryDate || batch.expiryDate,
                purchasePrice: Number(item.price) || batch.purchasePrice,
              }, { transaction: t });
            }
          }
        }
      }
    }

    await t.commit();
    return await getImportReceiptById(receipt.id);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const updateImportReceipt = async (id, data) => {
  const { details, ...receiptData } = data;
  const t = await db.sequelize.transaction();
  try {
    // 1. Cập nhật thông tin chung của phiếu nhập
    await db.ImportReceipts.update(receiptData, {
      where: { id },
      transaction: t,
    });

    if (details) {
      // 2. Lấy thông tin chi tiết cũ để hoàn tác số lượng tồn kho chung và số lượng theo lô
      const oldDetails = await db.ImportDetails.findAll({
        where: { importId: id },
        transaction: t,
      });

      for (const oldItem of oldDetails) {
        const stock = await db.Stock.findByPk(oldItem.productId, { transaction: t });
        if (stock) {
          // Trừ bớt số lượng cũ đã nhập
          await stock.decrement("stock", { by: Number(oldItem.quantity), transaction: t });
        }
        if (oldItem.batchNumber) {
          const batch = await db.StockBatch.findOne({
            where: { productId: oldItem.productId, batchNumber: oldItem.batchNumber },
            transaction: t,
          });
          if (batch) {
            await batch.decrement("quantity", { by: Number(oldItem.quantity), transaction: t });
          }
        }
      }

      // 3. Xóa chi tiết cũ
      await db.ImportDetails.destroy({
        where: { importId: id },
        transaction: t,
      });

      // 4. Tạo chi tiết mới và cập nhật tồn kho mới + lô mới
      const detailData = details.map((item) => ({ 
        importId: id, 
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        price: String(item.price),
        batchNumber: item.batchNumber || null,
        expiryDate: item.expiryDate || null,
      }));
      
      await db.ImportDetails.bulkCreate(detailData, { transaction: t });

      for (const newItem of details) {
        const stock = await db.Stock.findByPk(newItem.productId, { transaction: t });
        if (stock) {
          // Cộng thêm số lượng mới nhập
          await stock.increment("stock", { by: Number(newItem.quantity), transaction: t });
        }
        if (newItem.batchNumber) {
          const [batch, created] = await db.StockBatch.findOrCreate({
            where: { productId: newItem.productId, batchNumber: newItem.batchNumber },
            defaults: {
              quantity: 0,
              expiryDate: newItem.expiryDate || null,
              purchasePrice: Number(newItem.price) || 0,
            },
            transaction: t,
          });
          await batch.increment("quantity", { by: Number(newItem.quantity), transaction: t });
          if (!created) {
            await batch.update({
              expiryDate: newItem.expiryDate || batch.expiryDate,
              purchasePrice: Number(newItem.price) || batch.purchasePrice,
            }, { transaction: t });
          }
        }
      }
    }

    await t.commit();
    return await getImportReceiptById(id);
  } catch (err) {
    await t.rollback();
    console.error("Update Import Receipt Error:", err);
    throw err;
  }
};

const deleteImportReceipt = async (id) => {
  const t = await db.sequelize.transaction();
  try {
    const oldDetails = await db.ImportDetails.findAll({
      where: { importId: id },
      transaction: t,
    });

    for (const oldItem of oldDetails) {
      const stock = await db.Stock.findByPk(oldItem.productId, { transaction: t });
      if (stock) {
        await stock.decrement("stock", { by: Number(oldItem.quantity), transaction: t });
      }
      if (oldItem.batchNumber) {
        const batch = await db.StockBatch.findOne({
          where: { productId: oldItem.productId, batchNumber: oldItem.batchNumber },
          transaction: t,
        });
        if (batch) {
          await batch.decrement("quantity", { by: Number(oldItem.quantity), transaction: t });
        }
      }
    }

    await db.ImportDetails.destroy({ where: { importId: id }, transaction: t });
    await db.ImportReceipts.destroy({ where: { id }, transaction: t });
    await t.commit();
    return { message: "Deleted successfully" };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

module.exports = {
  getAllImportReceipts,
  getImportReceiptById,
  createImportReceipt,
  updateImportReceipt,
  deleteImportReceipt,
};
