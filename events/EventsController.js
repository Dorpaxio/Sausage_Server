const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

const tokenActions = require('../auth/tokenActions');

const db = require('../services/db');

const User = require('../user/User');

router.get('/', async (req, res) => {
    db.getEvents(req.query.page,
        result => {
            db.getNbPages(result2 =>{
                const obj = {
                    totalPages: Math.ceil(result2[0][0].nb),
                    events: result[0]
                }
                return res.status(200).send(obj);
            }, error2 =>{
                return err.status(500).send({ok:false});
            })
        },
        err => {
            return err.status(500).send({ok:false,message: 'Un problème est survenu.'});
        }
    )
});

router.post('/', tokenActions.verifyToken, async (req, res) => {
    const user = new User(req.pseudo);

    user.hasPermission('create_event', can => {
        if (!can) return res.status(403).send({authorized: false, message: 'Vous ne pouvez pas créer d\'évévenement.'});
        req.body.event.createur = req.pseudo;
        db.addEvent(req.body.event, result =>{
            return res.status(201).send({ok:true,message: 'Evenement créé.'});
        },
        error => {
            return res.status(500).send({ok:false,message: error.sqlMessage});
        });
    })
});

function editEvent(event, res, err) {
    db.setEvent(event, result => {
        return typeof res === 'function' && res(result);
    }, error => {
        return typeof err === 'function' && err(error);
    });
}

router.patch('/:id', tokenActions.verifyToken, async (req, res) => {
    db.getEvent(req.params.id,
        event => {
            new User(req.pseudo).hasPermission('edit_any_event', can => {
                if (can || req.pseudo === event.createur) {
                    editEvent(req.body.event,
                        res => {
                            res.status(201).send({ok: true, event: res});
                        }, err => {
                            res.status(500).send({ok: false, message: 'Une erreur est survenu.'});
                        });
                } else {
                    res.status(403).send({ok: false, message: 'Permission non-accordée.'});
                }
            })
        }, error => {
            if (error.message === '404') {
                res.status(404).send({ok: false, message: 'Aucun événement n\'a été trouvé à cet id.'});
            } else {
                res.status(500).send({ok: false, message: 'Une erreur est survenu.'});
            }
        });
});

router.get('/subscriptions/', tokenActions.verifyToken, async (req, res) => {
    if(req.query.detail === 'oui') {
        db.getSubscribedEvents(req.pseudo,
            result => {
                return res.status(200).send(result);
            }, error => {
                return res.status(500).send({ok: false, message: 'Une erreur est survenu.'});
            }
        );
    } else {
        db.getSubscriptions(req.pseudo,
            result => {
                return res.status(200).send(result);
            }, error => {
                return res.status(500).send({ok: false, message: 'Une erreur est survenu.'});
            });
    }
});



// id = event id
router.post('/subscriptions/', tokenActions.verifyToken, async (req, res) => {
    db.getSubscriptions(req.pseudo, result => {
        if(!result.some(sub => sub.event_id === req.body.id)) {
            db.subuser(req.pseudo, req.body.id,
                result => {
                    if(result[0].OK === 0){
                        return res.status(403).send({ok: false,message:'Cet événement a atteint son effectif maximum.'});
                    } else if(result[0].OK === 2){
                        return res.status(403).send({ok: false,message:'Cet événement est déja terminé.'})
                    } else if (result[0].OK === 1){
                        return res.status(201).send({ok: true});
                    }
                }, error => {
                    return res.status(500).send({ok: false, message:'Un problème est survenu.'});
                }
            );
        } else return res.status(402).send({ok: false, message:'Une inscription existe déjà.'});
    }, error => {
        return res.status(500).send({ok: false, message:'Un problème est survenu.'});
    });
});

router.post('/subscription/', tokenActions.verifyToken, async (req,res) => {
    object = {
        id: req.body.id,
        pseudo: req.pseudo,
        note: req.body.note
    }
    db.updateNote(object, result => {
        return res.status(201).send({ok:true});
    }, error => {
        return res.status(403).send({ok:false,message: error.sqlMessage});
    })
})

router.delete('/subscriptions/:id', tokenActions.verifyToken, async (req, res) => {
    db.deleteSubscription(req.pseudo,req.params.id,result =>{
        return res.status(201).send({ok:true});
    }, error => {
        return res.status(403).send({ok:false});
    })
});

router.delete('/:id', tokenActions.verifyToken, async (req,res) => {
    db.deleteEvent(req.params.id, result => {
        return res.status(200).send({ok:true});
    }, error => {
        return res.status(403).send({ok:false});
    })
})

module.exports = router;
