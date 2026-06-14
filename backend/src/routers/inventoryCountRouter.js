const express = require("express");
const router = express.Router();
const inventoryCountController = require("../controller/inventoryCountController");
const { verifyToken, checkRole } = require("../middleware/middleware");

router.get("/", verifyToken, inventoryCountController.getAll);
router.get("/:id", verifyToken, inventoryCountController.getById);
router.post("/create", verifyToken, checkRole(["admin", "dev", "keeper"]), inventoryCountController.create);
router.put("/:id/approve", verifyToken, checkRole(["admin", "dev"]), inventoryCountController.approve);
router.put("/:id/cancel", verifyToken, checkRole(["admin", "dev", "keeper"]), inventoryCountController.cancel);

module.exports = router;
