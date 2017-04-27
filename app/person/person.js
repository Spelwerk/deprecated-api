var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher'),
    tokens = require('./../tokens');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM person ' +
        'LEFT JOIN person_playable ON person_playable.id = person.id ' +
        'LEFT JOIN person_has_species ON (person_has_species.person_id = person.id AND person_has_species.first = 1)';

    // Get

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, query, null, {"nickname": "ASC"});
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE person.id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"person.id": "ASC"});
    });

    router.get(path + '/id/:id/creation', function(req, res) {
        rest.QUERY(pool, req, res, 'SELECT * FROM person_creation WHERE ID = ?', [req.params.id], {"id":"ASC"});
    });

    router.get(path + '/id/:id/short', function(req, res) {
        var call = 'SELECT id,nickname,occupation FROM person WHERE ' +
            'id = ? AND ' +
            'playable = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1], {"id":"DESC"});
    });

    router.get(path + '/popular', function(req, res) {
        var call = 'SELECT id,playable,calculated,nickname,firstname,surname,occupation FROM person WHERE ' +
            'playable = ? AND ' +
            'calculated = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [1, 1]);
    });

    router.get(path + '/deleted', function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, null, {"id": "ASC"});
    });

    // Person

    router.post(path, function(req, res) {
        var person = {},
            insert = {},
            world = {},
            species = {},
            points = {},
            user = {};

        user.token = tokens.decode(req);
        user.valid = tokens.validate(req, user.token);

        user.id = user.valid && user.token.sub.verified
            ? user.token.sub.id
            : null;

        person.secret = hasher(32);

        insert.nickname = req.body.nickname;
        insert.age = req.body.age;
        insert.occupation = req.body.occupation;
        insert.supernatural = req.body.supernatural || 0;
        insert.playable = req.body.playable || 1;

        species.id = req.body.species_id;

        world.id = req.body.world_id;

        async.series([
            function(callback) {
                async.parallel([
                    function (callback) {
                        pool.query(mysql.format('SELECT * FROM world WHERE id = ?', [world.id]), callback);
                    },
                    function (callback) {
                        pool.query(mysql.format('SELECT * FROM species WHERE id = ?', [species.id]), callback);
                    },
                    function (callback) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM species_has_attribute WHERE species_id = ?', [species.id]), callback);
                    },
                    function (callback) {
                        pool.query(mysql.format('SELECT weapon_id FROM species_has_weapon WHERE species_id = ?', [species.id]), callback);
                    }
                ], function (err, results) {
                    world.select = results[0][0][0];

                    species.select = results[1][0][0];
                    species.attribute = results[2][0];
                    species.weapon = results[3][0];

                    points.expertise = 1;
                    points.gift = world.select.max_gift;
                    points.imperfection = world.select.max_imperfection;
                    points.milestone = 1;
                    points.money = 1;
                    points.power = 1;
                    points.relationship = 1;
                    points.skill = 1;
                    points.supernatural = 1;

                    var split = {},
                        max = {};

                    split.expertise = Math.floor(insert.age / (world.select.split_expertise * species.select.multiply_expertise));
                    split.milestone = Math.floor(insert.age / world.select.split_milestone);
                    split.relationship = Math.floor(insert.age / world.select.split_relationship);
                    split.skill = Math.floor(insert.age / (world.select.split_skill * species.select.multiply_skill));
                    split.supernatural = Math.floor(insert.age / world.select.split_supernatural);

                    max.expertise = world.select.max_expertise;
                    max.milestone = world.select.max_milestone;
                    max.relationship = world.select.max_relationship;
                    max.skill = world.select.max_skill;
                    max.supernatural = world.select.max_supernatural;

                    if (split.expertise < max.expertise && split.expertise > 1) {
                        points.expertise = split.expertise;
                    } else if (split.expertise > max.expertise) {
                        points.expertise = max.expertise;
                    }

                    if (split.milestone < max.milestone && split.milestone > 1) {
                        points.milestone = split.milestone;
                    } else if (split.milestone > max.milestone) {
                        points.milestone = max.milestone;
                    }

                    if (split.relationship < max.relationship && split.relationship > 1) {
                        points.relationship = split.relationship;
                    } else if (split.relationship > max.relationship) {
                        points.relationship = max.relationship;
                    }

                    if (split.skill < max.skill && split.skill > 1) {
                        points.skill = split.skill;
                    } else if (split.skill > max.skill) {
                        points.skill = max.skill;
                    }

                    if (split.supernatural < max.supernatural && split.supernatural > 1) {
                        points.supernatural = split.supernatural;
                    } else if (split.supernatural > max.supernatural) {
                        points.supernatural = max.supernatural;
                    }

                    callback(err);
                });
            },
            function(callback) {
                async.parallel([
                    function(callback) {
                        pool.query(mysql.format('INSERT INTO person (secret,playable,nickname,occupation,world_id) VALUES (?,?,?,?,?)',
                            [person.secret, insert.playable, insert.nickname, insert.occupation, world.id]),callback);
                    },
                    function(callback) {
                        // This builds a list of attributes that are either Protected Status, or in the Skill Type. It also adds from Species, but keeps manifestation skill away.
                        pool.query(mysql.format('SELECT ' +
                            'world_has_attribute.attribute_id, ' +
                            'world_has_attribute.default_value AS value ' +
                            'FROM world_has_attribute ' +
                            'LEFT JOIN attribute ON attribute.id = world_has_attribute.attribute_id ' +
                            'WHERE ' +
                            'world_has_attribute.world_id = ? AND ' +

                            '(attribute.protected = 1 OR (attribute.attributetype_id = ? AND ( (attribute.special = 0 AND attribute.species_id IS NULL) OR (attribute.special = 1 AND attribute.species_id = ?) ) ) ) AND ' +

                            'attribute.canon = 1 AND ' +
                            'attribute.deleted IS NULL',
                            [world.id, world.select.skill_attributetype_id, species.id]),callback);
                    }
                ],function(err,results) {
                    person.id = results[0][0].insertId;

                    world.attribute = results[1][0];

                    callback(err);
                });
            },
            function(callback) {
                async.parallel([
                    function(callback) {
                        pool.query(mysql.format('INSERT INTO person_playable (id, supernatural, age) VALUES (?,?,?)',
                            [person.id, insert.supernatural, insert.age]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('INSERT INTO person_has_species (person_id, species_id, first) VALUES (?,?,?)',
                            [person.id, species.id, 1]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('INSERT INTO person_creation (id,point_expertise,point_gift,point_imperfection,' +
                            'point_milestone,point_money,point_power,point_relationship,point_skill,point_supernatural) VALUES (?,?,?,?,?,?,?,?,?,?)',
                            [person.id, points.expertise, points.gift, points.imperfection, points.milestone, points.money, points.power,
                                points.relationship, points.skill, points.supernatural]),callback);
                    },
                    function(callback) {
                        var call = 'INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ';

                        for(var i in world.attribute) {
                            if(species.attribute[0]) {
                                for(var j in species.attribute) {
                                    if(world.attribute[i].attribute_id === species.attribute[j].attribute_id) {
                                        world.attribute[i].value += species.attribute[j].value;
                                        species.attribute[j].updated = true;
                                    }
                                }
                            }

                            call += '(' + person.id + ',' + world.attribute[i].attribute_id + ',' + world.attribute[i].value + '),';
                        }

                        if(species.attribute[0]) {
                            for (var m in species.attribute) {
                                if (species.attribute[m].updated !== true) {
                                    call += '(' + person.id + ',' + species.attribute[m].attribute_id + ',' + species.attribute[m].value + '),';
                                }
                            }
                        }

                        call = call.slice(0, -1);

                        pool.query(call,callback);
                    },
                    function(callback) {
                        if(species.weapon[0] !== undefined) {
                            var call = 'INSERT INTO person_has_weapon (person_id,weapon_id,species) VALUES ';

                            for(var i in species.weapon) {
                                call += '(' + person.id + ',' + species.weapon[i].weapon_id + ',1),';
                            }

                            call = call.slice(0, -1);

                            pool.query(call,callback);
                        } else { callback(); }
                    },
                    function(callback) {
                        if(user.id) {
                            pool.query(mysql.format('INSERT INTO user_has_person (user_id,person_id,owner,secret) VALUES (?,?,?,?)',
                                [user.id,person.id,1,person.secret]),callback);
                        } else { callback(); }
                    }
                ],function(err) {
                    callback(err);
                });
            }
        ],function(err) {
            if(err) {
                console.log(err);
                res.status(500).send(err);
            } else {
                res.status(200).send({id: person.id, secret: person.secret});
            }
        });
    });

    router.put(path + '/id/:id', function(req, res) {
        var person = {},
            insert = {},
            creation = {},
            playable = {},
            description = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.playable = req.body.playable;
        insert.calculated = req.body.calculated;
        insert.popularity = req.body.popularity;
        insert.thumbsup = req.body.thumbsup;
        insert.thumbsdown = req.body.thumbsdown;
        insert.nickname = req.body.nickname;
        insert.occupation = req.body.occupation;

        creation.point_expertise = req.body.point_expertise;
        creation.point_gift = req.body.point_gift;
        creation.point_imperfection = req.body.point_imperfection;
        creation.point_milestone = req.body.point_milestone;
        creation.point_money = req.body.point_money;
        creation.point_power = req.body.point_power;
        creation.point_relationship = req.body.point_relationship;
        creation.point_skill = req.body.point_skill;
        creation.point_supernatural = req.body.point_supernatural;

        playable.cheated = req.body.cheated;
        playable.supernatural = req.body.supernatural;
        playable.age = req.body.age;

        description.firstname = req.body.firstname;
        description.surname = req.body.surname;
        description.gender = req.body.gender;
        description.description = req.body.description;
        description.personality = req.body.personality;
        description.appearance = req.body.appearance;
        description.background = req.body.background;
        description.drive = req.body.drive;
        description.pride = req.body.pride;
        description.problem = req.body.problem;
        description.shame = req.body.shame;
        description.picture_path = req.body.picture_path;

        pool.query(mysql.format('SELECT secret,playable,calculated FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0].secret;
            person.playable = !!result[0].playable;
            person.calculated = !!result[0].calculated;

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else if(!person.auth) {
                res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
            } else {
                async.parallel([
                    function(callback) {
                        var call = 'UPDATE person SET ',
                            values_array = [],
                            query_amount = 0;

                        for (var i in insert) {
                            if(insert[i] !== undefined) {
                                call += i + ' = ?, ';
                                values_array.push(insert[i]);
                                query_amount++;
                            }
                        }

                        if(query_amount > 0) {
                            call = call.slice(0, -2) + ', updated = CURRENT_TIMESTAMP WHERE id = ?';
                            values_array.push(person.id);

                            pool.query(mysql.format(call,values_array),callback);
                        } else {
                            callback();
                        }
                    },
                    function(callback) {
                        if(person.playable && !person.calculated) {
                            var call = 'UPDATE person_creation SET ',
                                values_array = [],
                                query_amount = 0;

                            for (var i in creation) {
                                if(creation[i] !== undefined) {
                                    call += i + ' = ?, ';
                                    values_array.push(creation[i]);
                                    query_amount++;
                                }
                            }

                            if(query_amount > 0) {
                                call = call.slice(0, -2) + ' WHERE id = ?';
                                values_array.push(person.id);

                                pool.query(mysql.format(call,values_array),callback);
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    function(callback) {
                        if(person.playable) {
                            var call = 'UPDATE person_playable SET ',
                                values_array = [],
                                query_amount = 0;

                            for (var i in playable) {
                                if(playable[i] !== undefined) {
                                    call += i + ' = ?, ';
                                    values_array.push(playable[i]);
                                    query_amount++;
                                }
                            }

                            if(query_amount > 0) {
                                call = call.slice(0, -2) + ' WHERE id = ?';
                                values_array.push(person.id);

                                pool.query(mysql.format(call,values_array),callback);
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    function(callback) {
                        var call = 'UPDATE person_description SET ',
                            values_array = [],
                            query_amount = 0;

                        for (var i in playable) {
                            if(description[i] !== undefined) {
                                call += i + ' = ?, ';
                                values_array.push(description[i]);
                                query_amount++;
                            }
                        }

                        if(query_amount > 0) {
                            call = call.slice(0, -2) + ' WHERE id = ?';
                            values_array.push(person.id);

                            pool.query(mysql.format(call,values_array),callback);
                        } else {
                            callback();
                        }
                    }
                ],function(err) {
                    if(err) {
                        console.log(err);
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    router.put(path + '/revive/:id', function(req, res) {
        var user = {},
            person = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        user.token = tokens.decode(req);
        user.valid = tokens.validate(req, user.token);

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send(err);
            } else if(!person.auth || (!person.auth && user.valid && !user.token.sub.admin)) {
                res.status(500).send('Wrong secret, or not administrator.');
            } else {
                pool.query(mysql.format('UPDATE person SET deleted = NULL, updated = CURRENT_TIMESTAMP WHERE id = ',[person.id]),function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    router.delete(path + '/id/:id', function(req, res) {
        var user = {},
            person = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        user.token = tokens.decode(req);
        user.valid = tokens.validate(req, user.token);

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send(err);
            } else if(!person.auth || (!person.auth && user.valid && !user.token.sub.admin)) {
                res.status(500).send('Wrong secret, or not administrator.');
            } else {
                pool.query(mysql.format('UPDATE person SET deleted = CURRENT_TIMESTAMP WHERE id = ',[person.id]),function(err) {
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        res.status(202).send();
                    }
                });
            }
        });
    });

    // Asset

    require('./person_has_asset')(pool, router, table, path);

    // Attribute

    require('./person_has_attribute')(pool, router, table, path);

    // Augmentation

    require('./person_has_augmentation')(pool, router, table, path);

    // Background

    router.put(path + '/id/:id/background', function(req, res) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.background_id;

        async.series([
            function(callback) {
                async.parallel([
                    function(callback) {
                        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM person_has_attribute WHERE person_id = ?',[person.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM background_has_attribute WHERE background_id = ?',[insert.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT background_id FROM person_playable WHERE id = ?',[person.id]),callback);
                    }
                ],function(err,results) {
                    person.auth = !!results[0][0][0];
                    person.attribute = results[1][0];
                    insert.attribute = results[2][0];
                    current.id = results[3][0][0].background_id;

                    callback(err);
                });
            },
            function(callback) {
                if(person.auth) {
                    if(current.id !== undefined) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM background_has_attribute WHERE background_id = ?',[current.id]),function(err,result) {
                            current.attribute = result;

                            callback(err);
                        });
                    } else {
                        callback();
                    }
                } else { callback(); }
            },
            function(callback) {
                if(person.auth && insert.id != current.id) {
                    async.parallel([
                        function(callback) {
                            pool.query(mysql.format('UPDATE person_playable SET background_id = ? WHERE id = ?',[insert.id,person.id]),callback);
                        },
                        function(callback) {
                            rest.personInsertAttribute(pool, person, insert, current, callback);
                        }
                    ],function(err) {
                        callback(err);
                    });
                } else { callback(); }
            }
        ],function(err) {
            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                res.status(200).send();
            }
        });
    });

    // Bionic

    require('./person_has_bionic')(pool, router, table, path);

    // Characteristic

    require('./person_has_characteristic')(pool, router, table, path);

    // Companion

    require('./person_has_companion')(pool, router, table, path);

    // Disease

    require('./person_has_disease')(pool, router, table, path);

    // Expertise

    require('./person_has_expertise')(pool, router, table, path);

    // Gift

    require('./person_has_gift')(pool, router, table, path);

    // Imperfection

    require('./person_has_imperfection')(pool, router, table, path);

    // Language

    require('./person_has_language')(pool, router, table, path);

    // Focus

    router.put(path + '/id/:id/focus', function(req, res) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.focus_id;

        async.series([
            function(callback) {
                async.parallel([
                    function(callback) {
                        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM person_has_attribute WHERE person_id = ?',[person.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, attribute_value AS value FROM focus WHERE id = ?',[insert.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT focus_id FROM person_playable WHERE id = ?',[person.id]),callback);
                    }
                ],function(err,results) {
                    person.auth = !!results[0][0][0];
                    person.attribute = results[1][0];
                    insert.attribute = results[2][0];
                    current.id = results[3][0][0].focus_id;

                    callback(err);
                });
            },
            function(callback) {
                if(person.auth && current.id !== undefined) {
                    pool.query(mysql.format('SELECT attribute_id, attribute_value AS value FROM focus WHERE id = ?',[current.id]),function(err,result) {
                        current.attribute = result;

                        callback(err);
                    });
                } else { callback(); }
            },
            function(callback) {
                if(person.auth && insert.id != current.id) {
                    async.parallel([
                        function(callback) {
                            pool.query(mysql.format('UPDATE person_playable SET focus_id = ? WHERE id = ?',[insert.id,person.id]),callback);
                        },
                        function(callback) {
                            rest.personInsertAttribute(pool, person, insert, current, callback);
                        }
                    ],function(err) {
                        callback(err);
                    });
                } else { callback(); }
            }
        ],function(err) {
            if(err) {
                console.log(err);
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                res.status(200).send();
            }
        });
    });

    // Identity

    router.put(path + '/id/:id/identity', function(req, res) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.identity_id;

        async.series([
            function(callback) {
                async.parallel([
                    function(callback) {
                        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM person_has_attribute WHERE person_id = ?',[person.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, attribute_value AS value FROM identity WHERE id = ?',[insert.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT identity_id FROM person_playable WHERE id = ?',[person.id]),callback);
                    }
                ],function(err,results) {
                    person.auth = !!results[0][0][0];
                    person.attribute = results[1][0];
                    insert.attribute = results[2][0];
                    current.id = results[3][0][0].identity_id;

                    callback(err);
                });
            },
            function(callback) {
                if(person.auth && current.id !== undefined) {
                    pool.query(mysql.format('SELECT attribute_id, attribute_value AS value FROM identity WHERE id = ?',[current.id]),function(err,result) {
                        current.attribute = result;

                        callback(err);
                    });
                } else { callback(); }
            },
            function(callback) {
                if(person.auth && insert.id != current.id) {
                    async.parallel([
                        function(callback) {
                            pool.query(mysql.format('UPDATE person_playable SET identity_id = ? WHERE id = ?',[insert.id,person.id]),callback);
                        },
                        function(callback) {
                            rest.personInsertAttribute(pool, person, insert, current, callback);
                        }
                    ],function(err) {
                        callback(err);
                    });
                } else { callback(); }
            }
        ],function(err) {
            if(err) {
                console.log(err);
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                res.status(200).send();
            }
        });
    });

    // Manifestation

    router.post(path + '/id/:id/manifestation', function(req, res) {
        var person = {},
            manifestation = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.manifestation_id;

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send(err);
            } else if(!person.auth) {
                res.status(400).send('Wrong Secret');
            } else {
                async.series([
                    function(callback) {
                        pool.query(mysql.format('UPDATE person_playable SET manifestation_id = ? WHERE id = ?',[insert.id,person.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT power_attribute_id, skill_attribute_id FROM manifestation WHERE id = ?',[insert.id]),function(err, result) {
                            manifestation.attribute = result[0];

                            callback(err);
                        });
                    },
                    function(callback) {
                        var call = 'INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ';

                        call += '(' + person.id + ',' + manifestation.attribute.power_attribute_id + ',0),';
                        call += '(' + person.id + ',' + manifestation.attribute.skill_attribute_id + ',0),';

                        call = call.slice(0, -1) + ' ON DUPLICATE KEY UPDATE value = VALUES(value)';

                        pool.query(call,callback);
                    }
                ],function(err) {
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    // Milestone

    require('./person_has_milestone')(pool, router, table, path);

    // Nature

    router.put(path + '/id/:id/nature', function(req, res) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.nature_id;

        async.series([
            function(callback) {
                async.parallel([
                    function(callback) {
                        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM person_has_attribute WHERE person_id = ?',[person.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, attribute_value AS value FROM nature WHERE id = ?',[insert.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT nature_id FROM person_playable WHERE id = ?',[person.id]),callback);
                    }
                ],function(err,results) {
                    person.auth = !!results[0][0][0];
                    person.attribute = results[1][0];
                    insert.attribute = results[2][0];
                    current.id = results[3][0][0].nature_id;

                    callback(err);
                });
            },
            function(callback) {
                if(person.auth && current.id !== undefined) {
                    pool.query(mysql.format('SELECT attribute_id, attribute_value AS value FROM nature WHERE id = ?',[current.id]),function(err,result) {
                        current.attribute = result;

                        callback(err);
                    });
                } else { callback(); }
            },
            function(callback) {
                if(person.auth && insert.id != current.id) {
                    async.parallel([
                        function(callback) {
                            pool.query(mysql.format('UPDATE person_playable SET nature_id = ? WHERE id = ?',[insert.id,person.id]),callback);
                        },
                        function(callback) {
                            if(insert.attribute[0] !== undefined) {
                                var call = 'INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ';

                                for(var i in person.attribute) {
                                    for(var j in insert.attribute) {
                                        if(person.attribute[i].attribute_id === insert.attribute[j].attribute_id) {
                                            person.attribute[i].value += insert.attribute[j].value;
                                            person.attribute[i].changed = true;
                                            insert.attribute[j].updated = true;
                                        }
                                    }

                                    if(current.attribute[0]) {
                                        for(var k in current.attribute) {
                                            if(person.attribute[i].attribute_id === current.attribute[k].attribute_id) {
                                                person.attribute[i].value -= current.attribute[k].value;
                                                person.attribute[i].changed = true;
                                            }
                                        }
                                    }

                                    if(person.attribute[i].changed === true) {
                                        call += '(' + person.id + ',' + person.attribute[i].attribute_id + ',' + person.attribute[i].value + '),';
                                    }
                                }

                                for(var m in insert.attribute) {
                                    if(insert.attribute[m].updated !== true) {
                                        call += '(' + person.id + ',' + insert.attribute[m].attribute_id + ',' + insert.attribute[m].value + '),';
                                    }
                                }

                                call = call.slice(0, -1);

                                call += ' ON DUPLICATE KEY UPDATE value = VALUES(value)';

                                pool.query(call,callback);
                            } else { callback(); }
                        }
                    ],function(err) {
                        callback(err);
                    });
                } else { callback(); }
            }
        ],function(err) {
            if(err) {
                console.log(err);
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                res.status(200).send();
            }
        });
    });

    // Protection

    require('./person_has_protection')(pool, router, table, path);

    // Relationship

    require('./person_has_relationship')(pool, router, table, path);

    // Sanity

    require('./person_has_sanity')(pool, router, table, path);

    // Species

    require('./person_has_species')(pool, router, table, path);

    // Software

    require('./person_has_software')(pool, router, table, path);

    // Weapon

    require('./person_has_weapon')(pool, router, table, path);

    // Wound

    require('./person_has_wound')(pool, router, table, path);
};