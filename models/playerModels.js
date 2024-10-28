const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Assurez-vous d'importer bcrypt
require('dotenv').config();

// Schéma du joueur
const playerSchema = new mongoose.Schema({
    photo: {
        type: String,
    },
    email: {
        type: String,
    },
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    age: {
        type: Number,
    },
    earnings: {
        type: Number,
    },
    username: {
        type: String,
    },
    gameCategory: {
        type: String,
    },
    password: {
        type: String,
    },
    phonenumber: {
        type: String, // Changez en String pour mieux gérer les numéros
    },
    nationality: {
        type: String,
    },
    role: {
        type: String,
        default: "player", // Ajouter un rôle par défaut pour distinguer le manager
    },
});

// Hashage du mot de passe avant de le sauvegarder
playerSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = bcrypt.hashSync(this.password, parseInt(process.env.SALT));
    }
});

const playerModel = mongoose.model('players', playerSchema);

module.exports = playerModel;
