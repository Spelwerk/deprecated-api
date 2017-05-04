var secrets = require('./config/secret.json'),
    database = require('./config/database.json'),
    superuser = require('./config/superuser.json'),
    mailgun = require('./config/mailgun.json');

module.exports.secrets = secrets;
module.exports.superuser = superuser;
module.exports.mailgun = mailgun;

exports.port = 3003;
exports.salt = 12;
exports.timeoutTTL = 60;
exports.debugMode = true;
exports.noreply = superuser.noreply;

var pool = {
    host: database.host,
    database: database.name,
    user: database.username,
    password: database.password,
    connectionLimit: 100,
    waitForConnections: true,
    queueLimit: 0,
    debug: false,
    wait_timeout: 28800,
    connect_timeout: 10
};

var base = '';

var links = {
    user: {
        verify: {
            new: base + 'outside?d=verify&s=',
            login: base + 'outside?d=login&s=',
            reset: base + 'user/verify/reset/'
        }
    }
};

var defaults = {
    attribute: {
        id: {
            resilience: 1,
            stamina: 2,
            tolerance: 3,

            initiative: 4,
            speed: 5,

            disease: 6,
            sanity: 7,
            trauma: 8,

            ballistic: 9,
            bashing: 10,
            piercing: 11,
            slashing: 12,

            damage: 13,

            honor: 14,
            infamy: 15,

            ammunition: 16,
            money: 17,
            rations: 18,

            experience: 19
        },

        type: {
            body: 1,
            combat: 2,
            wound: 3,
            protection: 4,
            damage: 5,
            reputation: 6,
            consumable: 7,
            experience: 8,
            power: 9
        }
    },

    skill: {
        maximum: 8
    },

    expertise: {
        start: 4,
        increment: 2,
        maximum: 3
    },

    doctrine: {
        maximum: 16
    },

    icon: {
        augmentation: '',
        gift: '',
        imperfection: '',
        milestone: '',

        wound: '',
        woundheal: '',

        disease: '',
        diseaseheal: '',

        sanity: '',
        sanityheal: ''
    }
};

module.exports.pool = pool;
module.exports.base = base;
module.exports.links = links;
module.exports.defaults = defaults;
