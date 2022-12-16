const Sauce = require('../models/sauces');
const fs = require('fs');

//création de la sauce
exports.createSauce = (req, res, next) => {
    //parse de l'objet car l'objet qui est envoyé dans la requête est sous forme de chaine de caractère
    const sauceObject = JSON.parse(req.body.sauce);
    //supression du champs id car l'id va être généré automatiquement par la base de donnée
    delete sauceObject._id;
    //suppression du champ userId qui correspond à la personne qui a créer l'objet car on ne fait pas confiance au client
    //on utilise le userId qui vient du token d'authentification -> sur que c'est valide
    delete sauceObject._userId;
    //création de l'objet
    const sauce = new Sauce({
       ...sauceObject,
       userId: req.auth.userId,
       likes: 0,
       dislikes: 0,
       //génère l'URL de l'image
       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    //enregistrement de l'objet
    sauce.save()
    .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
};

//modification de la sauce
exports.modifySauce = (req, res, next) => {
    //extraction de l'objet dans le corps de la requête
    //le format de la requête n'est le même selon si l'utilisateur fournit un fichier ou non
    //lorsqu'il y a un fichier de transmis, l'objet est sous forme d'une chaine de caractère
    //pour savoir si la requête à un fichier transmis il suffit de vérifier si un champs file est présent dans l'objet requête
    //req.file ? (? = if) permet de vérifier si un champs file est présent dans l'objet
    const sauceObject = req.file ? {
        //s'il y a un champs file, on récupère l'objet en parsant la chaine de caractère
        ...JSON.parse(req.body.sauce),
        //création de l'URL de l'image
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        //':' = else
    } : { ...req.body };
    //suppression de l'userId de la requête
    //pour éviter que quelqu'un crée un objet à son nom puis le modifie pour le reassigner à quelqu'un d'autre
    delete sauceObject._userId;
    //on cherche dans la base de donnée l'objet pour vérifier que se soit bien l'utilisateur à qui appartient cet objet qui cherche à le modifier
    Sauce.findOne({_id: req.params.id})
        //en cas de succès on récupère l'objet (sauce)
        .then((sauce) => {
            //vérification : si le champs userId de la base de donnée (sauce.userId) est different (!=) l'userId qui vient du token (req.auth.userId)
            //si cette condition est vrai alors quelqu'un essaye de modifier quelque chose qui ne lui appartient pas
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                //MAJ de l'enregistement, '_id: req.params.id' indique quel filtre est à mettre à jour et avec quel objet ('...sauceObject, _id: req.params.id'-> id vient des paramètres de l'URL)
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

//supression sauce si la sauce appartient à la personne qui souhaite la supprimer
exports.deleteSauce = (req, res, next) => {
    //récupération de l'objet en base de donnée
    Sauce.findOne({ _id: req.params.id})
       .then(sauce => {
            //vérification que le userId en base de donnée correspond au userId de la requête
           if (sauce.userId != req.auth.userId) {
               res.status(401).json({message: 'Not authorized'});
           } else {
                //récupération du nom de fichier grâce à un split autour du répertoire image
               const filename = sauce.imageUrl.split('/images/')[1];
               //utilisation de la méthode unlink pour supprimer
               fs.unlink(`images/${filename}`, () => {
                    //supprime l'enregistrement dans la base de donnée avec l'objet "_id: req.params.id" qui sert de filtre ou sélecteur
                   Sauce.deleteOne({_id: req.params.id})
                       .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                       .catch(error => res.status(401).json({ error }));
               });
           }
       })
       .catch( error => {
           res.status(500).json({ error });
       });
};

//récupère une sauce
exports.getOneSauce = (req, res, next) => {
    //on a accès au segment dynamique par req.params.id
    //findOne permet de trouver un objet à l'inverse find permet de trouver tout les objets
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({ error }));
};

//récupère la liste de toutes les sauces
exports.getAllSauces = (req, res, next) => {
    //méthode find mise à disposition par le modèle, qui retourne une promise (donc .then et .catch)
    Sauce.find()
    //récupère le tableau de toute les sauces dans la base
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

// Ajout de like ou dislike
exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const likeType = req.body.like;
            const userId = req.body.userId;
            switch (likeType) {
                // Like
                case 1:
                    if (!sauce.usersLiked.includes(userId)) {
                        sauce.usersLiked.push(userId);
                        ++sauce.likes;
                    }
                    break;
                // Annulation
                case 0:
                    if (sauce.usersDisliked.includes(userId)) {
                        sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(userId), 1);
                        --sauce.dislikes;
                    } else if (sauce.usersLiked.includes(userId)) {
                        sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1);
                        --sauce.likes;
                    }
                    break;
                // Dislike
                case -1:
                    if (!sauce.usersDisliked.includes(userId)) {
                        sauce.usersDisliked.push(userId);
                        ++sauce.dislikes;
                    }
                    break;
                default:
                    res.status(401).json({ message: "La valeur de like est fausse" })
                    break;
            }
            sauce.save()
                .then(() => { res.status(200).json({message: 'Avis enregistré !'})})
                .catch(error => { res.status(400).json( { error })})
        })
        .catch(error => res.status(404).json({ error }));
};