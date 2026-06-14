"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class InventoryCountDetail extends Model {
    static associate(models) {
      InventoryCountDetail.belongsTo(models.InventoryCount, {
        foreignKey: "countId",
        as: "inventoryCountData",
      });
      InventoryCountDetail.belongsTo(models.Stock, {
        foreignKey: "productId",
        as: "StockProductData",
      });
    }
  }
  InventoryCountDetail.init(
    {
      countId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      systemQty: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      actualQty: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      discrepancy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      batchNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "InventoryCountDetail",
      tableName: "InventoryCountDetails",
    }
  );
  return InventoryCountDetail;
};
