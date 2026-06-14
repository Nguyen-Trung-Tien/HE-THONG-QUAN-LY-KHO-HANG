const express = require("express");
const router = express.Router();
const locationController = require("../controller/locationController");

router.get("/", locationController.getAll);
router.post("/generate", locationController.generate);
router.put("/:id/assign", locationController.assign);

module.exports = router;
