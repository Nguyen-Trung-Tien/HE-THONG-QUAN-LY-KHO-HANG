"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ExportDetails extends Model {
    static associate(models) {
      ExportDetails.belongsTo(models.ExportReceipts, {
        foreignKey: "exportId",
        as: "exportReceiptData",
      });
      ExportDetails.belongsTo(models.Stock, {
        foreignKey: "productId",
        as: "StockProductData",
      });
    }
  }
  ExportDetails.init(
    {
      exportId: DataTypes.INTEGER,
      productId: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      batchNumber: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ExportDetails",
    }
  );
  return ExportDetails;
};
