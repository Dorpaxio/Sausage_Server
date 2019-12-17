const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

const User = require('../user/User');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const config = require("../config/config");

const tokenActions = require('./tokenActions');
const db = require('../services/db');

router.post('/register', (req, res) => {
    // if(typeof req.body.password == 'undefined'){
    //     return res.status(403).send({auth:false, message:'missing parameters'});
    // }
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

    User.register({
        pseudo: req.body.pseudo,
        mail: req.body.mail,
        password: hashedPassword,
        address: req.body.address,
        city: req.body.city,
        postal: req.body.postal,
    }, (user) => {
        res.status(200).send({auth: true, token: tokenActions.createToken(user.pseudo)});
    });

});

router.post('/login', (req,res) => {
    User.login({
        pseudo: req.body.pseudo,
        password: req.body.password,
    }, user => {
        res.status(200).send({auth: true, token: tokenActions.createToken(user.pseudo)});
    }, err => {
        res.status(404).send({auth: false, message: 'Pseudo ou Mot de passe incorrect.'});
    });
});

router.get('/me', tokenActions.verifyToken, (req, res) => {

    User.getByPseudo(req.pseudo, (err, user) => {
        if (err) return res.status(500).send("Un problème est survenu.");

        if (!user) return res.status(404).send('Aucun utilisateur n\'a été trouvé !');

        res.status(200).send(user);
    });

});

router.patch('/token', tokenActions.verifyToken, (req, res) => {
   res.status(200).send({refresh: true, token: tokenActions.createToken(req.pseudo)});
});

router.delete('/me', tokenActions.verifyToken, (req, res) => {
   db.deleteUser(req.pseudo,
       result => {
            return res.status(201).send({ok:true, message:'Le compte a bien été supprimé'});
       }, error => {
            return res.status(500).send({ok:false, message:'Un problème est survenu.'});
       });
});

module.exports = router;
