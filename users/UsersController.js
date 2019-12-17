const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const User = require('../user/User');

const tokenActions = require('../auth/tokenActions');

router.get('/', (req, res) => {
   User.getUsers((err, users) => {
    if(err) return res.status(500).send("Un problème est survenu.");
    
    return res.status(200).send(users);
   });
});

const upload = require('../services/file-upload');
const singleUpload = upload.single('fichier');

router.post('/profilePicture', tokenActions.verifyToken, singleUpload, (req, res) => {
    if(req.file)
        return res.json({'imageUrl': req.file.location});
    else
        return res.status(422).send({errors: [{title: "Erreur d'envoie", details: err.message}] });

});

router.get('/permissions/:perm', tokenActions.verifyToken, (req, res) => {
   new User(req.pseudo).hasPermission(req.params.perm, (has) => {
        if(has)
            return res.status(200).send(true);
        else
            return res.status(403).send(false);
   }) ;
});

module.exports = router;
