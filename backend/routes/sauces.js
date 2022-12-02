const express = require('express');
const { cp } = require('fs');
const router = express.Router();
const multer = require('../middleware/multer-config');

const auth = require('../middleware/auth');

const saucesCtrl = require('../controllers/sauces');

// CREER NOUVEL OBJET

router.post('/', auth, multer, saucesCtrl.createThing);

// AFFICHER TOUS LES OBJETS

router.get('/', auth, saucesCtrl.getAllThings);

// AFFICHER UN OBJET

router.get('/:userId', auth, saucesCtrl.getOneThing);

// MODIFIER UN OBJET
  
router.put('/:userId', auth, multer, saucesCtrl.modifyThing);

// SUPPRIMER UN OBJET

router.delete('/:userId', auth, saucesCtrl.deleteThing);

module.exports = router;