"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ImportDetails extends Model {
    static associate(models) {
      ImportDetails.belongsTo(models.ImportReceipts, {
        foreignKey: "importId",
        as: "importReceiptData",
      });

      ImportDetails.belongsTo(models.Stock, {
        foreignKey: "productId",
        as: "StockProductData",
      });
    }
  }

  ImportDetails.init(
    {
      importId: DataTypes.INTEGER,
      productId: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      price: DataTypes.STRING,
      batchNumber: DataTypes.STRING,
      expiryDate: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "ImportDetails",
    }
  );
  return ImportDetails;
};
