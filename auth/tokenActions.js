const jwt = require('jsonwebtoken');
const config = require("../config/config");

const i  = 'SausageEvents WWW',
    s  = 'contact@charlesdesgenetez.fr',
    a  = 'https://charlesdesgenetez.fr';

const signOptions = {
    issuer:  i,
    subject:  s,
    audience:  a,
    expiresIn:  "1w"
};

const verifyOptions = {
    issuer:  i,
    subject:  s,
    audience:  a,
    expiresIn:  "1w"
};

function verifyToken(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send('Action non-autorisée');
    }

    let token = req.headers.authorization.split(' ')[1];
    if (token === 'null') {
        return res.status(401).send('Action non-autorisée');
    }

    try {
        let payload = jwt.verify(token, config.secret, verifyOptions);

        if (!payload) {
            return res.status(401).send('Action non-autorisée');
        }

        req.pseudo = payload.pseudo;
        next();
    } catch (e) {
        return res.status(498).send('Erreur de token');
    }
}

function createToken(pseudo) {
    return jwt.sign({pseudo: pseudo}, config.secret, signOptions);
}

const tokenActions =  {
    verifyToken: verifyToken,
    createToken: createToken,
}


module.exports = tokenActions;
