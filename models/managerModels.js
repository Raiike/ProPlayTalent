const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Schéma du manager
const managerSchema = new mongoose.Schema({
    photo: {
        type: String,
        required: [true, "La photo est requise"],
    },
    email: {
        type: String,
        required: [true, "L'email est requis"],
    },
    firstname: {
        type: String,
        required: [true, "Le prénom est requis"],
    },
    lastname: {
        type: String,
        required: [true, "Le nom de famille est requis"],
    },
    age: {
        type: Number,
        required: [true, "L'âge est requis"],
    },
    username: {
        type: String,
        required: [true, "Le nom d'utilisateur est requis"],
    },
    gameCategory: {
        type: String,
        required: [true, "La catégorie de jeu est requise"],
    },
    teamName: {
        type: String,
        required: [true, "Le nom de l'équipe est requis"],
    },
    password: {
        type: String,
        required: [true, "Le mot de passe est requis"],
    },
    phonenumber: {
        type: String,
        required: [true, "Le numéro de téléphone est requis"],
    },
    nationality: {
        type: String,
        required: [true, "La nationalité est requise"],
    },
    role: {
        type: String,
        default: "manager", // Ajouter un rôle par défaut pour distinguer le manager
    },
});

// Hashage du mot de passe avant de le sauvegarder
managerSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

const managerModel = mongoose.model('managers', managerSchema);

module.exports = managerModel;
