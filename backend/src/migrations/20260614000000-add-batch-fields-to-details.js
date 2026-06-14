"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add batchNumber and expiryDate to ImportDetails
    await queryInterface.addColumn("ImportDetails", "batchNumber", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("ImportDetails", "expiryDate", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Add batchNumber to ExportDetails
    await queryInterface.addColumn("ExportDetails", "batchNumber", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("ImportDetails", "batchNumber");
    await queryInterface.removeColumn("ImportDetails", "expiryDate");
    await queryInterface.removeColumn("ExportDetails", "batchNumber");
  },
};
