const db = require("../models");

module.exports = {
  getAllStocks: async (req, res) => {
    try {
      const stocks = await db.Stock.findAll({
        where: {
          deleted: false,
        },
        include: [
          { model: db.Suppliers, as: "supplier", attributes: ["id", "name"] }
        ],
        order: [["createdAt", "DESC"]],
      });

      const baseUrl = `${req.protocol}://${req.get('host')}`;

      const allProducts = stocks.map((p) => {
        const product = p.toJSON();
        return {
          ...product,
          image: product.image ? `${baseUrl}${product.image}` : null,
          status: product.stock > 0 ? "Còn hàng" : "Hết hàng",
          supplierName: product.supplier?.name || "Chưa có NCC"
        };
      });

      return res.json(allProducts);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Lỗi server",
        error: err.message,
      });
    }
  },
  getStockById: async (req, res) => {
    try {
      const stockRecord = await db.Stock.findByPk(req.params.id, {
        include: [
          { model: db.Suppliers, as: "supplier", attributes: ["id", "name"] },
          { model: db.StockBatch, as: "batches", attributes: ["id", "batchNumber", "quantity", "expiryDate"] }
        ],
      });
      if (!stockRecord)
        return res.status(404).json({
          message: "Không tìm thấy stock",
        });
      return res.json(stockRecord);
    } catch (err) {
      return res.status(500).json({
        message: "Lỗi server",
        error: err.message,
      });
    }
  },

  updateStock: async (req, res) => {
    try {
      const { stock, warehouseAddress, supplierId } = req.body;
      const stockRecord = await db.Stock.findByPk(req.params.id);
      if (!stockRecord)
        return res.status(404).json({
          message: "Không tìm thấy stock",
        });

      await stockRecord.update({
        stock,
        warehouseAddress,
        supplierId
      });
      return res.json({
        message: "Cập nhật stock thành công",
        data: stockRecord,
      });
    } catch (err) {
      return res.status(500).json({
        message: "Lỗi server",
        error: err.message,
      });
    }
  },

  deleteStock: async (req, res) => {
    try {
      const stockRecord = await db.Stock.findByPk(req.params.id);
      if (!stockRecord)
        return res.status(404).json({
          message: "Không tìm thấy stock",
        });

      await stockRecord.destroy();
      return res.json({
        message: "Đã xoá stock",
      });
    } catch (err) {
      return res.status(500).json({
        message: "Lỗi server",
        error: err.message,
      });
    }
  },

  getLowOrOutOfStock: async (req, res) => {
    try {
      const threshold = parseInt(req.query.threshold) || 10;

      const stocks = await db.Stock.findAll({
        where: {
          deleted: false,
          stock: {
            [db.Sequelize.Op.lt]: threshold,
          },
        },
        include: [
          { model: db.Suppliers, as: "supplier", attributes: ["id", "name"] }
        ],
        order: [["stock", "ASC"]],
      });

      return res.json(stocks.map(s => {
        const item = s.toJSON();
        return {
          ...item,
          supplierName: item.supplier?.name || "Chưa có NCC"
        }
      }));
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Lỗi server",
        error: err.message,
      });
    }
  },

  getExpiryAlerts: async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 30;
      const today = new Date();
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + days);

      const expiringBatches = await db.StockBatch.findAll({
        where: {
          quantity: {
            [db.Sequelize.Op.gt]: 0,
          },
          expiryDate: {
            [db.Sequelize.Op.lte]: targetDate,
            [db.Sequelize.Op.gte]: today,
          },
        },
        include: [
          {
            model: db.Stock,
            as: "product",
            attributes: ["id", "name", "image", "unit"],
          },
        ],
        order: [["expiryDate", "ASC"]],
      });

      const expiredBatches = await db.StockBatch.findAll({
        where: {
          quantity: {
            [db.Sequelize.Op.gt]: 0,
          },
          expiryDate: {
            [db.Sequelize.Op.lt]: today,
          },
        },
        include: [
          {
            model: db.Stock,
            as: "product",
            attributes: ["id", "name", "image", "unit"],
          },
        ],
        order: [["expiryDate", "DESC"]],
      });

      return res.json({
        expiring: expiringBatches,
        expired: expiredBatches,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Lỗi server",
        error: err.message,
      });
    }
  },
  getReorderSuggestions: async (req, res) => {
    try {
      const stocks = await db.Stock.findAll({
        where: {
          deleted: false,
          stock: {
            [db.Sequelize.Op.lte]: db.Sequelize.col("minStock"),
          },
        },
        include: [
          { model: db.Suppliers, as: "supplier", attributes: ["id", "name"] }
        ],
        order: [["name", "ASC"]],
      });

      const baseUrl = `${req.protocol}://${req.get('host')}`;

      const suggestions = stocks.map((p) => {
        const product = p.toJSON();
        const suggestedQty = (product.minStock * 3) - product.stock;
        return {
          ...product,
          image: product.image ? `${baseUrl}${product.image}` : null,
          suggestedQty: suggestedQty > 0 ? suggestedQty : 10,
        };
      });

      return res.json(suggestions);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Lỗi server",
        error: err.message,
      });
    }
  },
  createReorderReceipt: async (req, res) => {
    const { supplierId, items } = req.body;
    if (!supplierId || !items || !items.length) {
      return res.status(400).json({ message: "Thiếu thông tin nhà cung cấp hoặc sản phẩm" });
    }

    const t = await db.sequelize.transaction();
    try {
      const receipt = await db.ImportReceipts.create({
        supplierId: Number(supplierId),
        userId: req.user?.id || 1,
        import_date: new Date(),
        note: `Đề xuất nhập hàng tự động cho các sản phẩm dưới ngưỡng an toàn`,
      }, { transaction: t });

      const detailData = items.map((item) => ({
        importId: receipt.id,
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        price: String(item.price || "0"),
        batchNumber: item.batchNumber || `AUTO-${Date.now()}`,
        expiryDate: item.expiryDate || null,
      }));

      await db.ImportDetails.bulkCreate(detailData, { transaction: t });

      for (const item of items) {
        const stock = await db.Stock.findByPk(item.productId, { transaction: t });
        if (stock) {
          const oldQuantity = stock.stock;
          await stock.increment("stock", { by: Number(item.quantity), transaction: t });
          
          await db.InventoryLog.create({
            stockId: stock.id,
            userId: req.user?.id || 1,
            change_type: "IMPORT",
            quantity: Number(item.quantity),
            qtyBefore: oldQuantity,
            qtyAfter: oldQuantity + Number(item.quantity),
            note: `Nhập hàng từ phiếu gợi ý tự động #${receipt.id}`,
          }, { transaction: t });

          const batchNumber = item.batchNumber || `AUTO-${Date.now()}`;
          const [batch, created] = await db.StockBatch.findOrCreate({
            where: { productId: item.productId, batchNumber },
            defaults: {
              quantity: 0,
              expiryDate: item.expiryDate || null,
              purchasePrice: Number(item.price) || 0,
            },
            transaction: t,
          });
          await batch.increment("quantity", { by: Number(item.quantity), transaction: t });
        }
      }

      await t.commit();
      return res.status(201).json({ success: true, receiptId: receipt.id });
    } catch (err) {
      await t.rollback();
      console.error(err);
      return res.status(500).json({ message: "Lỗi tạo phiếu nhập tự động", error: err.message });
    }
  },
};
