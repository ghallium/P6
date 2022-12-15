//pour créer un routeur on a besoin d'express -> importation express
const express = require('express');
//création d'un routeur avec la méthode router()
const router = express.Router();
//import de la middleware
const auth = require('../middleware/auth');
//import multer
const multer = require('../middleware/multer-config');
//import du model
const sauceCtrl = require('../controllers/sauces');

router.get('/', auth, sauceCtrl.getAllSauces);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.post('/', auth, multer, sauceCtrl.createSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.likeSauce);

module.exports = router;