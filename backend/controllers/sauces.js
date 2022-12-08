const Sauce = require('../models/sauce');
const fs = require('fs');


// CREER NOUVEL OBJET

exports.createSauce = (req, res, next) => {
    console.log(req.body)
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
      ...sauceObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // Image appelée via son URL
  });

  sauce.save()
  .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};

// MODIFIER OBJET

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'}); // Empêche la suppression d'une sauce par un user qui ne serait pas "l'auteur"
          } else {
              Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

// SUPPRIMER OBJET 

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
      .then(sauce => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({message: 'Non-autorisé'});
          } else {
              const filename = sauce.imageUrl.split('/images/')[1]; // Utilisation de .split()[1] pour supprimer les images
              fs.unlink(`images/${filename}`, () => { // Suppression fichier avec unlink
                  sauce.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

// AFFICHER OBJET

exports.getOneSauce = (req, res, next) => { // Appelle une sauce avec "Request", "Result" et "Next" (prochain controller)
    Sauce.findOne({ _id: req.params.id }) // Trouve une sauce par rapport à son id
      .then(sauce => res.status(200).json(sauce)) // Réponse réussite
      .catch(error => res.status(404).json({ error })); // Réponse échec
  };

// AFFICHER TOUS LES OBJETS 

exports.getAllSauces = (req, res, next) => { // Appelle toutes les sauces avec "Request", "Result" et "Next" (prochain controller)
    Sauce.find() // Trouve toutes les sauces dans la BDD
      .then(sauces => res.status(200).json(sauces)) // Réponse réussite
      .catch(error => res.status(400).json({ error })); // Réponse échec
  }

// LIKER / DISLIKER UNE SAUCE 

exports.createLike = (req, res) => {
    // Récupère une sauce
    Sauce.findOne({
        _id: req.params.id
    })
    .then( sauce => {
        // l'utilisateur n'aime pas
        if (req.body.like == -1) {
            sauce.dislikes++; // ajoute un dislike
            sauce.usersDisliked.push(req.body.userId); // ajout du username et dislike dans le tableau
            sauce.save();
        }
        // l'utilisateur aime
        if (req.body.like == 1) {
            sauce.likes++; // ajoute un like
            sauce.usersLiked.push(req.body.userId); // ajout du username et like dans le tableau
            sauce.save();
        }
        // l'utilisateur se trompe / fait un misclick 
        if (req.body.like == 0) {
            // ajoute conditions pour attribuer suppression du like à l'id
            if (sauce.usersLiked.indexOf(req.body.userId) != 1) {
                sauce.likes--; // le like s'annule
                sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId), 1); // Suppression du like par rapport à son id
            } else {
            // conditions dislike
            sauce.dislikes--; // le dislike s'annule
            sauce.usersDisliked.splice(sauce.usersLiked.indexOf(req.body.userId), 1); // Suppression du dislike par rapport à son id
            }
            sauce.save();
        }

        // réponse réussite 
        res.status(200).json({message: 'Votre like/dislike a bien été pris en compte !'})
    })
    // réponse échec
    .catch(error => {
        res.status(500).json({error})
    });
}