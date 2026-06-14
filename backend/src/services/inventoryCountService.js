const db = require("../models/index");

const getAllInventoryCounts = async ({ page, limit, search }) => {
  const offset = (page - 1) * limit;
  const where = {};

  if (search) {
    const { Op } = require("sequelize");
    where[Op.or] = [
      { note: { [Op.like]: `%${search}%` } },
      { status: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await db.InventoryCount.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      { model: db.User, as: "userData", attributes: ["id", "firstName", "lastName", "email"] },
      {
        model: db.InventoryCountDetail,
        as: "details",
        include: [{ model: db.Stock, as: "StockProductData" }],
      },
    ],
    distinct: true,
    order: [["countDate", "DESC"], ["id", "DESC"]],
  });

  return {
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    counts: rows,
  };
};

const getInventoryCountById = async (id) => {
  const countRecord = await db.InventoryCount.findByPk(id, {
    include: [
      { model: db.User, as: "userData", attributes: ["id", "firstName", "lastName", "email"] },
      {
        model: db.InventoryCountDetail,
        as: "details",
        include: [{ model: db.Stock, as: "StockProductData" }],
      },
    ],
  });
  if (!countRecord) throw new Error("Inventory count sheet not found");
  return countRecord;
};

const createInventoryCount = async (data) => {
  const { details, ...countData } = data;
  const t = await db.sequelize.transaction();

  try {
    const countRecord = await db.InventoryCount.create(countData, { transaction: t });

    if (details && details.length > 0) {
      for (const d of details) {
        let systemQty = 0;

        // Fetch system quantity
        if (d.batchNumber) {
          const batch = await db.StockBatch.findOne({
            where: { productId: d.productId, batchNumber: d.batchNumber },
            transaction: t,
          });
          systemQty = batch ? batch.quantity : 0;
        } else {
          const stock = await db.Stock.findByPk(d.productId, { transaction: t });
          systemQty = stock ? stock.stock : 0;
        }

        const discrepancy = Number(d.actualQty) - systemQty;

        await db.InventoryCountDetail.create({
          countId: countRecord.id,
          productId: Number(d.productId),
          systemQty: systemQty,
          actualQty: Number(d.actualQty),
          discrepancy: discrepancy,
          reason: d.reason || "Kiểm kê định kỳ",
          batchNumber: d.batchNumber || null,
        }, { transaction: t });
      }
    }

    await t.commit();
    return await getInventoryCountById(countRecord.id);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const approveInventoryCount = async (id) => {
  const t = await db.sequelize.transaction();

  try {
    const countRecord = await db.InventoryCount.findByPk(id, {
      include: [{ model: db.InventoryCountDetail, as: "details" }],
      transaction: t,
    });

    if (!countRecord) throw new Error("Inventory count sheet not found");
    if (countRecord.status !== "pending") throw new Error("This count sheet is already processed");

    for (const detail of countRecord.details) {
      const stock = await db.Stock.findByPk(detail.productId, { transaction: t });
      if (!stock) throw new Error(`Stock item with ID ${detail.productId} not found`);

      const oldQuantity = stock.stock;
      let diff = 0;

      if (detail.batchNumber) {
        const [batch, created] = await db.StockBatch.findOrCreate({
          where: { productId: detail.productId, batchNumber: detail.batchNumber },
          defaults: {
            quantity: 0,
            expiryDate: null,
            purchasePrice: Number(stock.price) || 0,
          },
          transaction: t,
        });

        diff = Number(detail.actualQty) - batch.quantity;

        // Update batch quantity
        await batch.update({ quantity: Number(detail.actualQty) }, { transaction: t });
        
        // Update general stock
        await stock.update({ stock: stock.stock + diff }, { transaction: t });
      } else {
        diff = Number(detail.actualQty) - stock.stock;
        
        // Update general stock
        await stock.update({ stock: Number(detail.actualQty) }, { transaction: t });
      }

      // Record adjustment log
      if (diff !== 0) {
        await db.InventoryLog.create({
          stockId: stock.id,
          userId: countRecord.userId,
          change_type: "ADJUSTMENT",
          quantity: diff,
          qtyBefore: oldQuantity,
          qtyAfter: oldQuantity + diff,
          note: `Điều chỉnh kiểm kê từ phiếu #${countRecord.id} (${diff > 0 ? '+' : ''}${diff})`,
        }, { transaction: t });
      }
    }

    // Update count sheet status
    await countRecord.update({ status: "approved" }, { transaction: t });

    await t.commit();
    return await getInventoryCountById(id);
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const cancelInventoryCount = async (id) => {
  const countRecord = await db.InventoryCount.findByPk(id);
  if (!countRecord) throw new Error("Inventory count sheet not found");
  if (countRecord.status !== "pending") throw new Error("This count sheet is already processed");

  await countRecord.update({ status: "cancelled" });
  return await getInventoryCountById(id);
};

module.exports = {
  getAllInventoryCounts,
  getInventoryCountById,
  createInventoryCount,
  approveInventoryCount,
  cancelInventoryCount,
};
