const { success, error } = require('./functions');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const morgan = require('morgan');
const config = require('./config.json');
const cors = require('cors'); // Using cors for simpler configuration to consume via React

let members = [
    { id: 1, name: 'PHP', email: 'php@example.com' },
    { id: 2, name: 'JavaScript', email: 'js@example.com' },
    { id: 3, name: 'Java', email: 'java@example.com' }
];

let MembersRouter = express.Router();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // Used to avoid CORS issues when consuming from React

// Access-Control-Allow-Origin (Alternative to cors package, but instructions suggest using it, I'll keep the instruction's way just in case, augmented with cors just to be sure)
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

MembersRouter.route('/:id')
    // Récupère un membre avec son ID
    .get((req, res) => {
        let index = getIndex(req.params.id);
        if (typeof (index) == 'string') {
            res.json(error(index));
        } else {
            res.json(success(members[index]));
        }
    })
    // Modifie un membre avec ID
    .put((req, res) => {
        let index = getIndex(req.params.id);
        if (typeof (index) == 'string') {
            res.json(error(index));
        } else {
            let same = false;
            for (let i = 0; i < members.length; i++) {
                if (req.body.name == members[i].name && req.params.id != members[i].id) {
                    same = true;
                    break;
                }
            }
            if (same) {
                res.json(error('same name'));
            } else {
                members[index].name = req.body.name;
                if (req.body.email) members[index].email = req.body.email; // Also handle email since React parts use it
                res.json(success(true));
            }
        }
    })
    // Supprime un membre avec ID
    .delete((req, res) => {
        let index = getIndex(req.params.id);
        if (typeof (index) == 'string') {
            res.json(error(index));
        } else {
            members.splice(index, 1);
            res.json(success(members));
        }
    });

MembersRouter.route('/')
    // Récupère tous les membres
    .get((req, res) => {
        res.json(success(members));
    })
    // Ajoute un membre avec son nom
    .post((req, res) => {
        if (req.body.name) {
            let sameName = false;
            for (let i = 0; i < members.length; i++) {
                if (members[i].name == req.body.name) {
                    sameName = true;
                    break;
                }
            }
            if (sameName) {
                res.json(error('name already taken'));
            } else {
                let member = {
                    id: createID(),
                    name: req.body.name,
                    email: req.body.email || `${req.body.name}@example.com`
                };
                members.push(member);
                res.json(success(member));
            }
        } else {
            res.json(error('no name value'));
        }
    });

app.use(config.rootAPI + 'members', MembersRouter);

app.listen(config.port, () => console.log('Started on port ' + config.port));

function getIndex(id) {
    for (let i = 0; i < members.length; i++) {
        if (members[i].id == id)
            return i;
    }
    return 'wrong id';
}

function createID() {
    if (members.length === 0) return 1;
    return members[members.length - 1].id + 1;
}
