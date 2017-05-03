var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher'),
    tokens = require('./../tokens');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM person ' +
        'LEFT JOIN person_playable ON person_playable.person_id = person.id ' +
        'LEFT JOIN person_description ON person_description.person_id = person.id ' +
        'LEFT JOIN person_creation ON person_creation.person_id = person.id ' +
        'LEFT JOIN person_has_species ON (person_has_species.person_id = person.id AND person_has_species.first = 1)';

    // GET

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, query, null, {"nickname": "ASC"});
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE person.id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"person.id": "ASC"});
    });

    router.get(path + '/popular', function(req, res) {
        var call = 'SELECT id,nickname,occupation FROM person WHERE ' +
            'playable = 1 AND ' +
            'calculated = 1 AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/deleted', function(req, res) {
        var call = query + ' WHERE person.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, null, {"id": "ASC"});
    });

    // PERSON

    router.post(path, function(req, res) {
        var person = {},
            insert = {},
            world = {},
            species = {},
            points = {},
            user = {};

        person.secret = hasher(32);

        insert.playable = parseInt(req.body.playable) || 1;
        insert.supernatural = parseInt(req.body.supernatural) || 0;
        insert.nickname = req.body.nickname;
        insert.age = parseInt(req.body.age);
        insert.occupation = req.body.occupation;

        species.id = parseInt(req.body.species_id);

        world.id = parseInt(req.body.world_id);

        user.token = tokens.decode(req);
        user.id = user.token.sub.id;

        async.series([
            function(callback) {
                async.parallel([
                    function (callback) {
                        rest.query(pool, 'SELECT * FROM world WHERE id = ?', [world.id], callback);
                    },
                    function(callback) {
                        rest.query(pool, 'SELECT attribute_id, value FROM world_has_attribute WHERE world_id = ?', [world.id], callback);
                    },
                    function(callback) {
                        rest.query(pool, 'SELECT skill_id FROM world_has_skill WHERE world_id = ?', [world.id], callback);
                    },
                    function (callback) {
                        rest.query(pool, 'SELECT * FROM species WHERE id = ?', [species.id], callback);
                    },
                    function (callback) {
                        rest.query(pool, 'SELECT attribute_id, value FROM species_has_attribute WHERE species_id = ?', [species.id], callback);
                    },
                    function (callback) {
                        rest.query(pool, 'SELECT id FROM skill WHERE species_id = ?', [species.id], callback);
                    },
                    function (callback) {
                        rest.query(pool, 'SELECT weapon_id FROM species_has_weapon WHERE species_id = ?', [species.id], callback);
                    }
                ], function (err, results) {
                    world.select = results[0][0];
                    world.attribute = results[1];
                    world.skill = results[2];

                    species.select = results[3][0];
                    species.attribute = results[4];
                    species.skill = results[5];
                    species.weapon = results[6];

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
                rest.query(pool, 'INSERT INTO person (secret,playable,nickname,occupation,world_id) VALUES (?,?,?,?,?)', [person.secret, insert.playable, insert.nickname, insert.occupation, world.id], function(err,result) {
                    person.id = result.insertId;

                    callback(err);
                });
            },
            function(callback) {
                async.parallel([
                    function(callback) {
                        rest.query(pool, 'INSERT INTO person_playable (person_id, supernatural, age) VALUES (?,?,?)', [person.id, insert.supernatural, insert.age], callback);
                    },
                    function(callback) {
                        rest.query(pool, 'INSERT INTO person_description (person_id) VALUES (?)', [person.id], callback);
                    },
                    function(callback) {
                        rest.query(pool, 'INSERT INTO person_has_species (person_id, species_id, first) VALUES (?,?,?)', [person.id, species.id, 1], callback);
                    },
                    function(callback) {
                        rest.query(pool, 'INSERT INTO person_creation (person_id,point_expertise,point_gift,point_imperfection,' +
                            'point_milestone,point_money,point_power,point_relationship,point_skill,point_supernatural) VALUES (?,?,?,?,?,?,?,?,?,?)',
                            [person.id, points.expertise, points.gift, points.imperfection, points.milestone, points.money, points.power,
                                points.relationship, points.skill, points.supernatural], callback);
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

                        rest.query(pool, call, null, callback);
                    },
                    function(callback) {
                        var call = 'INSERT INTO person_has_skill (person_id,skill_id,value) VALUES ';

                        for(var i in world.skill) {
                            if(species.skill[0]) {
                                for(var j in species.skill) {
                                    if(world.skill[i].skill_id === species.skill[j].skill_id) {
                                        world.skill[i].value += species.skill[j].value;
                                        species.skill[j].updated = true;
                                    }
                                }
                            }

                            call += '(' + person.id + ',' + world.skill[i].skill_id + ',' + world.skill[i].value + '),';
                        }

                        if(species.skill[0]) {
                            for (var m in species.skill) {
                                if (species.skill[m].updated !== true) {
                                    call += '(' + person.id + ',' + species.skill[m].skill_id + ',' + species.skill[m].value + '),';
                                }
                            }
                        }

                        call = call.slice(0, -1);

                        rest.query(pool, call, null, callback);
                    },
                    function(callback) {
                        if(species.weapon[0] !== undefined) {
                            var call = 'INSERT INTO person_has_weapon (person_id,weapon_id,species) VALUES ';

                            for(var i in species.weapon) {
                                call += '(' + person.id + ',' + species.weapon[i].weapon_id + ',1),';
                            }

                            call = call.slice(0, -1);

                            rest.query(pool, call, null, callback);
                        } else { callback(); }
                    },
                    function(callback) {
                        if(!user.token) { callback(); } else {
                            rest.query(pool, 'INSERT INTO user_has_person (user_id,person_id,owner,secret) VALUES (?,?,?1?)', [user.id, person.id, person.secret], callback);
                        }
                    }
                ],function(err) {
                    callback(err);
                });
            }
        ],function(err) {
            if (err) {
                res.status(500).send({code: err.code, message: err.message});
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

        person.id = parseInt(req.params.id);
        person.secret = req.body.secret;

        insert.playable = parseInt(req.body.playable);
        insert.calculated = parseInt(req.body.calculated);
        insert.nickname = req.body.nickname;
        insert.occupation = req.body.occupation;

        creation.point_expertise = parseInt(req.body.point_expertise);
        creation.point_gift = parseInt(req.body.point_gift);
        creation.point_imperfection = parseInt(req.body.point_imperfection);
        creation.point_milestone = parseInt(req.body.point_milestone);
        creation.point_money = parseInt(req.body.point_money);
        creation.point_power = parseInt(req.body.point_power);
        creation.point_relationship = parseInt(req.body.point_relationship);
        creation.point_skill = parseInt(req.body.point_skill);
        creation.point_supernatural = parseInt(req.body.point_supernatural);

        playable.cheated = parseInt(req.body.cheated);
        playable.supernatural = parseInt(req.body.supernatural);
        playable.age = parseInt(req.body.age);

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

        async.series([
            function (callback) {
                rest.query(pool, 'SELECT secret,playable,calculated FROM person WHERE id = ? AND secret = ?', [person.id,person.secret], function(err,result) {
                    person.auth = !!result[0];

                    if(err) return callback(err);

                    if(!person.auth) return callback({status: 403, code: 0, message: 'Forbidden'});

                    callback();
                });
            },
            function (callback) {
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

                    rest.query(pool, call, values_array, callback);
                } else {
                    callback();
                }
            },
            function (callback) {
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
                        call = call.slice(0, -2) + ' WHERE person_id = ?';
                        values_array.push(person.id);

                        rest.query(pool, call, values_array, callback);
                    } else {
                        callback();
                    }
                } else {
                    callback();
                }
            },
            function (callback) {
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
                        call = call.slice(0, -2) + ' WHERE person_id = ?';
                        values_array.push(person.id);

                        rest.query(pool, call, values_array, callback);
                    } else {
                        callback();
                    }
                } else {
                    callback();
                }
            },
            function (callback) {
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
                    call = call.slice(0, -2) + ' WHERE person_id = ?';
                    values_array.push(person.id);

                    rest.query(pool, call, values_array, callback);
                } else {
                    callback();
                }
            }
        ],function(err) {
            if (err) {
                var status = err.status ? err.status : 500;
                res.status(status).send({code: err.code, message: err.message});
            } else {
                res.status(200).send();
            }
        });
    });

    router.put(path + '/revive/:id', function(req, res) {
        rest.REVIVE(pool, req, res, 'person');
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(pool, req, res, 'person');
    });

    // SPECIAL

    router.put(path + '/id/:id/background', function(req, res) {
        var person = {},
            insert = {},
            current = {};

        person.id = parseInt(req.params.id);
        person.secret = req.body.secret;

        insert.id = parseInt(req.body.insert_id);

        async.series([
            function(callback) {
                async.parallel([
                    function(callback) {
                        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id, person.secret]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM person_has_attribute WHERE person_id = ?',[person.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT skill_id, value FROM person_has_skill WHERE person_id = ?',[person.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM background_has_attribute WHERE background_id = ?',[insert.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT skill_id, value FROM background_has_skill WHERE background_id = ?',[insert.id]),callback);
                    },
                    // todo select skill from background && person
                    function(callback) {
                        pool.query(mysql.format('SELECT background_id FROM person_playable WHERE person_id = ?',[person.id]),callback);
                    }
                ],function(err,results) {
                    person.auth = !!results[0][0][0];
                    person.attribute = results[1][0];
                    person.skill = results[2][0];
                    insert.attribute = results[4][0];
                    insert.skill = results[4][0];
                    current.id = parseInt(results[5][0][0].background_id);

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
                if(person.auth) {
                    if(current.id !== undefined) {
                        pool.query(mysql.format('SELECT skill_id, value FROM background_has_skill WHERE background_id = ?',[current.id]),function(err,result) {
                            current.skill = result;

                            callback(err);
                        });
                    } else {
                        callback();
                    }
                } else { callback(); }
            },
            function(callback) {
                if(person.auth && insert.id !== current.id) {
                    async.parallel([
                        function(callback) {
                            pool.query(mysql.format('UPDATE person_playable SET background_id = ? WHERE person_id = ?',[insert.id,person.id]),callback);
                        },
                        function(callback) {
                            rest.personInsertAttribute(pool, person, insert, current, callback);
                        },
                        function(callback) {
                            rest.personInsertSkill(pool, person, insert, current, callback);
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

    router.put(path + '/id/:id/focus', function(req, res) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.insert_id;

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
                        pool.query(mysql.format('SELECT focus_id FROM person_playable WHERE person_id = ?',[person.id]),callback);
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
                            pool.query(mysql.format('UPDATE person_playable SET focus_id = ? WHERE person_id = ?',[insert.id,person.id]),callback);
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

    router.put(path + '/id/:id/identity', function(req, res) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.insert_id;

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
                        pool.query(mysql.format('SELECT identity_id FROM person_playable WHERE person_id = ?',[person.id]),callback);
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
                            pool.query(mysql.format('UPDATE person_playable SET identity_id = ? WHERE person_id = ?',[insert.id,person.id]),callback);
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

    router.post(path + '/id/:id/manifestation', function(req, res) {
        var person = {},
            manifestation = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.insert_id;

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id, person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send(err);
            } else if(!person.auth) {
                res.status(400).send('Wrong Secret');
            } else {
                async.series([
                    function(callback) {
                        pool.query(mysql.format('UPDATE person_playable SET manifestation_id = ? WHERE person_id = ?',[insert.id, person.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT power_id, skill_id FROM manifestation WHERE id = ?',[insert.id]),function(err, result) {
                            manifestation.power = result[0].power_id;
                            manifestation.skill = result[0].skill_id;

                            callback(err);
                        });
                    },
                    function(callback) {
                        var call = 'INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ';

                        call += '(' + person.id + ',' + manifestation.power + ',0),';

                        call = call.slice(0, -1) + ' ON DUPLICATE KEY UPDATE value = VALUES(value)';

                        pool.query(call,callback);
                    },
                    function(callback) {
                        var call = 'INSERT INTO person_has_skill (person_id,skill_id,value) VALUES ';

                        call += '(' + person.id + ',' + manifestation.skill + ',0),';

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

    router.put(path + '/id/:id/nature', function(req, res) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.insert_id;

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
                        pool.query(mysql.format('SELECT nature_id FROM person_playable WHERE person_id = ?',[person.id]),callback);
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
                            pool.query(mysql.format('UPDATE person_playable SET nature_id = ? WHERE person_id = ?',[insert.id,person.id]),callback);
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

    // RELATIONSHIPS

    require('./person_has_attribute')(pool, router, table, path);

    require('./person_has_augmentation')(pool, router, table, path);

    require('./person_has_bionic')(pool, router, table, path);

    require('./person_has_disease')(pool, router, table, path);

    require('./person_has_doctrine')(pool, router, table, path);

    require('./person_has_expertise')(pool, router, table, path);

    require('./person_has_gift')(pool, router, table, path);

    require('./person_has_imperfection')(pool, router, table, path);

    require('./person_has_milestone')(pool, router, table, path);

    require('./person_has_protection')(pool, router, table, path);

    require('./person_has_sanity')(pool, router, table, path);

    require('./person_has_skill')(pool, router, table, path);

    require('./person_has_species')(pool, router, table, path);

    require('./person_has_weapon')(pool, router, table, path);

    require('./person_has_wound')(pool, router, table, path);
};