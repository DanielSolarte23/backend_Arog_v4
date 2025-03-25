const express = require('express');
const router = express.Router();
const planPagoController = require('../controllers/planesController');

// Rutas para el CRUD de PlanPago
router.post('/', planPagoController.createPlanPago);
router.get('/', planPagoController.getAllPlanPagos);
router.get('/:id', planPagoController.getPlanPagoById);
router.put('/:id', planPagoController.updatePlanPago);
router.delete('/:id', planPagoController.deletePlanPago);

module.exports = router;