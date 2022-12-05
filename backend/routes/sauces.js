const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config');

const auth = require('../middleware/auth');

const saucesCtrl = require('../controllers/sauces');

// CREER NOUVEL OBJET

router.post('/', auth, multer, saucesCtrl.createSauce);

// AFFICHER TOUS LES OBJETS

router.get('/', auth, saucesCtrl.getAllSauces);

// AFFICHER UN OBJET

router.get('/:userId', auth, saucesCtrl.getOneSauce);

// MODIFIER UN OBJET
  
router.put('/:userId', auth, multer, saucesCtrl.modifySauce);

// SUPPRIMER UN OBJET

router.delete('/:userId', auth, saucesCtrl.deleteSauce);

module.exports = router;