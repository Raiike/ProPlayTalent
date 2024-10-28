const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Schéma du manager
const adminSchema= new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Le nom d'utilisateur est requis"],
    },
    password: {
        type: String,
        required: [true, "Le mot de passe est requis"],
    },
    role: {
        type: String,
        default: "admin", // Ajouter un rôle par défaut pour distinguer le manager
    },
});

// Hashage du mot de passe avant de le sauvegarder
adminSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

const adminModel = mongoose.model('admins', adminSchema);

module.exports = adminModel;
