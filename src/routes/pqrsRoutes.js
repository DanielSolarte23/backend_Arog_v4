const express = require('express');
const router = express.Router();
const pqrsController = require('../controllers/pqrscontrollers');

router.post('/', pqrsController);
router.get('/', pqrsControllermos);
router.get('/:id', pqrsControllermo);
router.put('/:id', pqrsControlleractua);
router.delete('/:id', pqrsControllereli);
