const locationService = require("../services/locationService");

const getAll = async (req, res) => {
  try {
    const data = await locationService.getAllLocations();
    res.status(200).json({ success: true, locations: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const generate = async (req, res) => {
  try {
    const result = await locationService.generateDefaultLocations();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const assign = async (req, res) => {
  try {
    const { productId } = req.body;
    const locationId = req.params.id;
    const result = await locationService.assignProductToLocation(locationId, productId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getAll,
  generate,
  assign,
};
