// Importation package Mongoose pour connexion MongoDB
const mongoose = require('mongoose');
// Bloque la possibilité à l'user de faire plusieurs comptes avec même mail
const uniqueValidator = require('mongoose-unique-validator');
// Définition schéma d'objet utilisateur
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);