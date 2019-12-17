const mysql = require('mysql');
const config = require('../config/config');

class DataBase {

    constructor(host, user, pass) {
        this.connexion = mysql.createConnection({
            host: config.db_host,
            user: config.db_user,
            password: config.db_password,
            database: config.db_database
        });
    }

    connect() {
        this.connexion.connect((err) => {
            if (err) throw err;
            console.log("Connecté à la BDD.");
        })
    }

    getUsers(callback) {
        this.connexion.query("SELECT pseudo FROM users;", (err, result, fields) => {
            if (err) throw err;

            typeof callback === 'function' && callback(err, result);
        });
    }

    addUser(user, callback) {
        this.connexion.query("CALL create_user(?,?,?,?,?,?,0)", [user.pseudo, user.password, user.mail, user.address, user.city, user.postal], (err, result, fields) => {
            typeof callback === 'function' && callback(err, result);
        });
    }

    getUser(pseudo, callback) {
        this.connexion.query('SELECT pseudo, mail, address, city, postal FROM users WHERE pseudo = ?', [pseudo], (err, result, fields) => {
            typeof callback === 'function' && callback(err, result[0]);
        });
    }

    getUserAndPass(pseudo, callback) {
        this.connexion.query('SELECT pseudo, password FROM users WHERE pseudo = ?', [pseudo], (err, result, fields) => {
            typeof callback === 'function' && callback(err, result[0]);
        });
    }
    addEvent(event, result, error){
        this.connexion.query("CALL create_event(?,?,?,?,?,?,?,?,?,?,?)", [event.GPS_N, event.GPS_E, event.address, event.city, event.codepostal,
            event.title,event.description, event.effectifmin, event.effectifmax, event.date,
            event.createur], (err, res, fields) => {
            if (err) return typeof error === 'function' && error(err);
            if (res) return typeof result === 'function' && result(res);
        });
    }

    getThemes(event_id){
        return new Promise((resolve,reject) =>{
            this.connexion.query('CALL getThemes(?)',[event_id], (err, res, fields) => {
                if(err) return reject(err);
                if(res){
                    let tab = res[0].map(themes => {
                        return themes.theme;
                    });
                    
                    return resolve(tab);
                }
            })
        })
    }

    getEvents (page, result, error) {
        this.connexion.query('CALL getEventsWithFull(?);',[page], (err, res, fields) => {
            if (err)
                return typeof error === 'function' && error(err);

            if (res){
                const results = res[0].map(element => {
                    return this.getThemes(element.id).then(resultat => {
                        element['themes'] = resultat;
                    });
                })
                Promise.all(results).then((completed) => {
                    return typeof result === 'function' && result(res);
                })
            }
        });
    }


    getEvent(id, result, error) {
        this.connexion.query('SELECT * FROM events WHERE id = ? LIMIT 1', [id], (err, res, fields) => {
            if (err)
                return typeof error === 'function' && error(err);

            if (res) {
                if (res.empty())
                    return typeof error === 'function' && error(new Error('404'));
                else
                    return typeof result === 'function' && result(res[0]);
            }

        });
    }

    setEvent(event, result, error) {
        this.connexion.query('UPDATE events SET GPS_N = ? , ' +
            'GPS_E = ? , ' +
            'adresse = ? , ' +
            'ville = ? , ' +
            'codepostal = ? , ' +
            'titre = ? , ' +
            'description = ? , ' +
            'effectifmin = ? , effectifmax = ? , ' +
            'date = ? , ' +
            'theme = ? , ' +
            'createur = ? WHERE id = ?',
            [event.latitude, event.longitude, event.adresse, event.ville, event.codepostal,
            event.titre, event.description, event.effectifmin, event.effectifmax, event.date,
            event.theme, event.createur, event.id], (err, res, fields) => {
                if (err) return typeof error === 'function' && error(err);

                if (res) return typeof result === 'function' && result(res);
            });
    }

    // select id, permissions from groups where id not in (select @pv:=id from groups join (select @pv:=2)tmp where parent_id=@pv)
    //SELECT group_id FROM users WHERE pseudo = ? LIMIT 1;
    getPermissions(pseudo, result, error) {
        this.connexion.query('SELECT check_perm(?) AS group_id',
            [pseudo],
            (err, res, fields) => {
                if (err)
                    return typeof error === 'function' && error(err);

                if (res) {
                    if (!res[0]) return typeof error === 'function' && error(new Error("Aucune personne trouvée ??"));

                    this.connexion.query('SELECT id, permissions FROM groups WHERE id NOT IN (SELECT @pv:=id FROM groups JOIN (SELECT @pv:= ? )tmp WHERE parent_id=@pv)',
                        [res[0].group_id], (erreur, resultat, champs) => {
                            if (erreur)
                                return typeof error === 'function' && error(erreur);

                            if (resultat) {
                                let perms = [];
                                resultat.forEach((row) => {
                                    perms = perms.concat(row.permissions.split(','));
                                });

                                return typeof result === 'function' && result(perms);
                            }
                        });
                }
            });
    }

    getSubscriptions(pseudo, result, error) {
        this.connexion.query('SELECT id FROM subscriptions WHERE pseudo = ?',
            [pseudo], (err, res, fields) => {
                if (err) return typeof error === 'function' && error(err);

                if (res) return typeof result === 'function' && result(res);
            }
        );
    }

    getSubscribedEvents(pseudo, result, error) {
        this.connexion.query('CALL getSubscriptions(?)', [pseudo], (err, res, fields) => {
            if(err) return typeof error === 'function' && error(err);

            if(res) return typeof result === 'function' && result(res[0]);
        })
    }

    isEventFull(event_id, result, error){
        this.connexion.query('SELECT isEventFull(?) AS OK',[event_id], (err,res,field) =>{
            if (err) return typeof error === 'function' && error(err);
            if (res) return typeof result === 'function' && result(res);
        })
    }

    subscribe(pseudo, eventId, result, error) {
        this.connexion.query('INSERT INTO subscriptions (pseudo, event_id) VALUES ( ? , ? )',
            [pseudo, eventId], (err, res, field) => {
                if (err) return typeof error === 'function' && error(err);

                if (res) return typeof result === 'function' && result(res);
            });
    }

    subuser(pseudo, eventId, result, error){
        this.connexion.query('SELECT subscribeUser(?,?) AS OK',[pseudo,eventId], (err, res, fields) => {
            if (err) return typeof error === 'function' && error(err);

            if(res) return typeof result === 'function' && result(res);
        });
    }

    checkPerm(pseudo, result, error){
        this.connexion.query('SELECT check_perm(?) AS perm', [pseudo], (err,res,fields) =>{
            if(err) return typeof error === 'function' && error(err);
            if(res) return typeof result === 'function' && result(res);
        });
    }

    deleteUser(pseudo, result, error){
        this.connexion.query('CALL deleteUser(?)', [pseudo], (err,res,fields) =>{
            if(err) return typeof error === 'function' && error(err);
            if(res) return typeof result === 'function' && result(res);
        });
    }

    deleteSubscription(pseudo,id,result,error){
        this.connexion.query('CALL deleteSubscription(?,?)',[pseudo,id], (err,res,fields) =>{
            if(err) return typeof error === 'function' && error(err);
            if(res) return typeof result === 'function' && result(res);
        });
    }

    getNbPages(result,error){
        this.connexion.query('CALL nbPages',(err,res,fields)=>{
            if(err) return typeof error === 'function' && error(err);
            if(res) return typeof result === 'function' && result(res);
        });
    }

    updateNote(object, result, error){
        this.connexion.query('CALL updateNote(?,?,?)',[object.id,object.pseudo,object.note], (err,res,fields) => {
            if(err) return typeof error === 'function' && error(err);
            if(res) return typeof result === 'function' && result(res);
        })
    }
    deleteEvent(id, result, error){
        this.connexion.query('CALL deleteEvent(?)', [id], (err,res,fields) => {
            if(err) return typeof error === 'function' && error(err);
            if(res) return typeof result === 'function' && result(res);
        })
    }
    search(query, result, error){
        this.connexion.query('CALL recherche(?)', [query], (err,res,fields) => {
            if(err) return typeof error === 'function' && error(err);
            if(res) return typeof result === 'function' && result(res);
        })
    }
}

module.exports = new DataBase();
