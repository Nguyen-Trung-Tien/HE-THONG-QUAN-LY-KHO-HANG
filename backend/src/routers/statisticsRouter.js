const express = require('express');
const router = express.Router();
const statisticsController = require('../controller/statisticsController');
const { verifyToken, checkRole } = require('../middleware/middleware');

router.use(verifyToken);
router.use(checkRole(['admin', 'dev', 'accountant']));

router.get('/abc-analysis', statisticsController.getAbcAnalysis);
router.get('/revenue', statisticsController.getTotalRevenue);
router.get('/general', statisticsController.getGeneralStats);
router.get('/revenue-by-period', statisticsController.getRevenueByPeriod);
router.get('/top-products', statisticsController.getTopSellingProducts);
router.get('/order-status-stats', statisticsController.getOrderStatusStats);
router.get('/deadstock', statisticsController.getDeadstockReport);
router.get('/all-orders', statisticsController.getAllOrders);
router.get('/all-stock', statisticsController.getAllStock);
router.get('/all-customers', statisticsController.getAllCustomers);
router.get('/inventory-structure', statisticsController.getInventoryStructure);
module.exports = router;