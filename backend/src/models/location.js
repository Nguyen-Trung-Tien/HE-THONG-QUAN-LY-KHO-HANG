"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    static associate(models) {
      Location.hasMany(models.Stock, {
        foreignKey: "locationId",
        as: "stocks",
      });
    }
  }
  Location.init(
    {
      aisle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rack: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shelf: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bin: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 500,
      },
    },
    {
      sequelize,
      modelName: "Location",
      tableName: "Locations",
    }
  );
  return Location;
};
