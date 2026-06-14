const db = require("../models/index");

const getAllLocations = async () => {
  return await db.Location.findAll({
    include: [
      {
        model: db.Stock,
        as: "stocks",
        where: { deleted: false },
        required: false,
      },
    ],
    order: [
      ["aisle", "ASC"],
      ["rack", "ASC"],
      ["shelf", "ASC"],
      ["bin", "ASC"],
    ],
  });
};

const generateDefaultLocations = async () => {
  const aisles = ["A", "B", "C", "D"];
  const racks = ["1", "2", "3", "4"];
  const shelves = ["1", "2", "3"];
  const bins = ["1", "2"];
  const defaultCapacity = 500;

  // Check if we already have locations
  const existingCount = await db.Location.count();
  if (existingCount > 0) {
    return { success: false, message: `Hệ thống đã có sẵn ${existingCount} vị trí, không cần sinh thêm.` };
  }

  const locationsToCreate = [];

  for (const aisle of aisles) {
    for (const rack of racks) {
      for (const shelf of shelves) {
        for (const bin of bins) {
          locationsToCreate.push({
            aisle,
            rack,
            shelf,
            bin,
            capacity: defaultCapacity,
          });
        }
      }
    }
  }

  await db.Location.bulkCreate(locationsToCreate);
  return { success: true, count: locationsToCreate.length };
};

const assignProductToLocation = async (locationId, productId) => {
  const t = await db.sequelize.transaction();

  try {
    // If productId is provided, verify it exists and set its locationId
    if (productId) {
      const stock = await db.Stock.findByPk(productId, { transaction: t });
      if (!stock) throw new Error("Không tìm thấy sản phẩm trong kho");

      // Set the location
      await stock.update({ locationId: locationId }, { transaction: t });
    } else {
      // If no productId, we want to clear location for any stock currently assigned to this locationId
      await db.Stock.update(
        { locationId: null },
        { where: { locationId: locationId }, transaction: t }
      );
    }

    await t.commit();
    return { success: true };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

module.exports = {
  getAllLocations,
  generateDefaultLocations,
  assignProductToLocation,
};
