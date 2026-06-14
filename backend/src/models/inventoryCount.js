"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class InventoryCount extends Model {
    static associate(models) {
      InventoryCount.belongsTo(models.User, {
        foreignKey: "userId",
        as: "userData",
      });
      InventoryCount.hasMany(models.InventoryCountDetail, {
        foreignKey: "countId",
        as: "details",
      });
    }
  }
  InventoryCount.init(
    {
      countDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "InventoryCount",
      tableName: "InventoryCounts",
    }
  );
  return InventoryCount;
};
