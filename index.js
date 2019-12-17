const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const https = require('https');
const fs = require('fs');

const db = require('./services/db');

const app = express();

app.use(helmet());
app.use(bodyParser.json());

const whitelist = ['https://sausage-events.charlesdesgenetez.fr']
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

app.use(morgan('combined'));
app.use(cookieParser());

const AuthController = require('./auth/AuthController');
const UsersController = require('./users/UsersController');
const EventsController = require('./events/EventsController');
app.use('/auth', AuthController);
app.use('/users', UsersController);
app.use('/events', EventsController);

app.listen(3000, () => {
    db.connect();
    console.log("Serveur ouvert sur le port 3000");
});

const options = {
    key: fs.readFileSync("./ssl/privkey.pem"),
    cert: fs.readFileSync('./ssl/fullchain.pem'),
}

https.createServer(options, app).listen(3001);
