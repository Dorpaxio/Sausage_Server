const db = require('../services/db');
const bcrypt = require('bcrypt');

module.exports = class User {

    constructor(pseudo) {
        this.pseudo = pseudo;
    }

    getPseudo() {
        return this.pseudo;
    }

    getPermissions(cb) {
        db.getPermissions(this.pseudo, perms => {
            typeof cb === 'function' && cb(perms);
        });
    }

    hasPermission(perm, cb) {
        this.getPermissions(perms => {
           return typeof cb === 'function' && cb(perms.includes(perm));
        });
    }

    static register({pseudo, mail, password, address, city, postal}, success) {

        db.addUser({
            pseudo: pseudo,
            mail: mail,
            password: password,
            address: address,
            city: city,
            postal: postal
        }, (err, res) => {

            if(err) throw err;

            typeof success === 'function' && success(new User(pseudo));
        })
    }

    static login({pseudo, password}, success, error) {

        this.getByPseudo(pseudo, (err, user) => {
           if(!user) {
               error(err);
               return;
           }

           if(user) {
               db.getUserAndPass(pseudo, (err, res) => {
                  bcrypt.compare(password, res.password, (err, res) => {
                    if(res) {
                        success(user);
                    } else {
                        error(err);
                    }
                  });
               });
           }
        });
    }

    static getByPseudo(pseudo, callback) {
        db.getUser(pseudo, (err, user) => {
            callback(err, user);
        })
    }

    static getUsers(callback) {
        db.getUsers((err, users) => {
            callback(err, users);
        });
    }

}
