const inventoryCountService = require("../services/inventoryCountService");

const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const result = await inventoryCountService.getAllInventoryCounts({
      page,
      limit,
      search,
    });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const record = await inventoryCountService.getInventoryCountById(req.params.id);
    res.status(200).json({ success: true, data: record });
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({ success: false, error: err.message });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const record = await inventoryCountService.createInventoryCount(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const approve = async (req, res) => {
  try {
    const record = await inventoryCountService.approveInventoryCount(req.params.id);
    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const cancel = async (req, res) => {
  try {
    const record = await inventoryCountService.cancelInventoryCount(req.params.id);
    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getAll, getById, create, approve, cancel };
