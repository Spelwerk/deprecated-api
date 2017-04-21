var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM person LEFT JOIN person_is_playable ON person_is_playable.id = person.id';

    function insertAttribute(person, insert, current, callback) {
        if(person.atr[0] !== undefined && insert.atr[0] !== undefined) {
            var call = 'INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ';

            for(var i in person.atr) {
                for(var j in insert.atr) {
                    if(person.atr[i].attribute_id === insert.atr[j].attribute_id) {
                        person.atr[i].value += insert.atr[j].value;
                        person.atr[i].changed = true;
                        insert.atr[j].updated = true;
                    }
                }

                console.log();

                if(current.atr !== undefined && current.atr[0] !== undefined) {
                    for(var k in current.atr) {
                        if(person.atr[i].attribute_id === current.atr[k].attribute_id) {
                            person.atr[i].value -= current.atr[k].value;
                            person.atr[i].changed = true;
                        }
                    }
                }

                if(person.atr[i].changed === true) {
                    call += '(' + person.id + ',' + person.atr[i].attribute_id + ',' + person.atr[i].value + '),';
                }
            }

            for(var m in insert.atr) {
                console.log(4);
                if(insert.atr[m].updated !== true) {
                    call += '(' + person.id + ',' + insert.atr[m].attribute_id + ',' + insert.atr[m].value + '),';
                }
            }

            call = call.slice(0, -1);

            call += ' ON DUPLICATE KEY UPDATE value = VALUES(value)';

            pool.query(call,callback);
        } else { callback(); }
    }

    function setCustomDescription(req, res, tableName) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.params.id2;
        insert.custom = req.body.custom;

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else if(!person.auth) {
                res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
            } else {
                pool.query(mysql.format('UPDATE person_has_'+tableName+' SET '+tableName+'_custom = ? WHERE person_id = ? AND '+tableName+'_id = ?',[insert.custom,person.id,insert.id]),function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    }

    function setEquipped(req, res, tableName) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.params.id2;
        insert.equip = req.params.equip;

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else if(!person.auth) {
                res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
            } else {
                pool.query(mysql.format('UPDATE person_has_'+tableName+' SET equipped = ? WHERE person_id = ? AND '+tableName+'_id = ?',[insert.equip,person.id,insert.id]),function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    }

    function deleteRelation(req, res, tableName) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.params.id2;

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else if(!person.auth) {
                res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
            } else {
                var call = mysql.format('DELETE FROM person_has_'+tableName+' WHERE person_id = ? AND '+tableName+'_id = ?',[person.id,insert.id]);
                console.log(call);
                pool.query(call,function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    }

    // Get

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, query, null, {"nickname": "ASC"});
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE person.id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"person.id": "ASC"});
    });

    router.get(path + '/popular', function(req, res) {
        var call = 'SELECT id,playable,calculated,nickname,firstname,surname,occupation FROM person WHERE ' +
            'playable = ? AND ' +
            'calculated = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [1, 1]);
    });

    router.get(path + '/short/id/:id', function(req, res) {
        var call = 'SELECT id,nickname,occupation FROM person WHERE ' +
            'id = ? AND ' +
            'playable = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1], {"id":"ASC"});
    });

    router.get(path + '/deleted', function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, null, {"id": "ASC"});
    });

    // Person

    router.post(path, function(req, res) {
        var person = {},
            points = {};

        person.id = null;
        person.nickname = req.body.nickname;
        person.age = req.body.age;
        person.occupation = req.body.occupation;
        person.supernatural = req.body.supernatural || 0;
        person.playable = req.body.playable || 1;
        person.secret = hasher(32);

        var species_id = req.body.species_id,
            world_id = req.body.world_id;

        async.waterfall([
            function(callback) {
                async.parallel([
                    function (callback) {
                        pool.query(mysql.format('SELECT * FROM world WHERE id = ?', [world_id]), callback);
                    },
                    function (callback) {
                        pool.query(mysql.format('SELECT * FROM species WHERE id = ?', [species_id]), callback);
                    },
                    function (callback) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM species_has_attribute WHERE species_id = ?', [species_id]), callback);
                    },
                    function (callback) {
                        pool.query(mysql.format('SELECT weapon_id FROM species_has_weapon WHERE species_id = ?', [species_id]), callback);
                    },
                    function (callback) {
                        pool.query(mysql.format('SELECT characteristic_id FROM species_has_characteristic WHERE species_id = ?', [species_id]), callback);
                    }
                ], function (err, results) {
                    var world = results[0][0][0],
                        species = results[1][0][0],
                        species_atr = results[2][0],
                        species_wpn = results[3][0],
                        species_cha = results[4][0];

                    points.expertise = 1;
                    points.gift = world.max_gift;
                    points.imperfection = world.max_imperfection;
                    points.milestone = 1;
                    points.money = 1;
                    points.power = 1;
                    points.relationship = 1;
                    points.skill = 1;
                    points.supernatural = 1;

                    var split_expertise = Math.floor(person.age / (world.split_expertise * species.multiply_expertise)),
                        split_milestone = Math.floor(person.age / world.split_milestone),
                        split_relationship = Math.floor(person.age / world.split_relationship),
                        split_skill = Math.floor(person.age / (world.split_skill * species.multiply_skill)),
                        split_supernatural = Math.floor(person.age / world.split_supernatural);

                    if (split_expertise < world.max_expertise && split_expertise > 1) {
                        points.expertise = split_expertise;
                    } else if (split_expertise > world.max_expertise) {
                        points.expertise = world.max_expertise;
                    }

                    if (split_milestone < world.max_milestone && split_milestone > 1) {
                        points.milestone = split_milestone;
                    } else if (split_milestone > world.max_milestone) {
                        points.milestone = world.max_milestone;
                    }

                    if (split_relationship < world.max_relationship && split_relationship > 1) {
                        points.relationship = split_relationship;
                    } else if (split_relationship > world.max_relationship) {
                        points.relationship = world.max_relationship;
                    }

                    if (split_skill < world.max_skill && split_skill > 1) {
                        points.skill = split_skill;
                    } else if (split_skill > world.max_skill) {
                        points.skill = world.max_skill;
                    }

                    if (split_supernatural < world.max_supernatural && split_supernatural > 1) {
                        points.supernatural = split_supernatural;
                    } else if (split_supernatural > world.max_supernatural) {
                        points.supernatural = world.max_supernatural;
                    }

                    callback(err,world,species_atr,species_wpn,species_cha);
                });
            },
            function(world,species_atr,species_wpn,species_cha,callback) {
                async.parallel([
                    function(callback) {
                        pool.query(mysql.format('INSERT INTO person (secret,playable,nickname,occupation,world_id) VALUES (?,?,?,?,?)',
                            [person.secret, person.playable, person.nickname, person.occupation, world_id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT ' +
                            'world_has_attribute.attribute_id, ' +
                            'world_has_attribute.default_value AS value ' +
                            'FROM world_has_attribute ' +
                            'LEFT JOIN attribute ON attribute.id = world_has_attribute.attribute_id ' +
                            'WHERE ' +
                            'world_has_attribute.world_id = ? AND ' +
                            '(attribute.protected = 1 OR (attribute.attributetype_id = ? AND (attribute.species_id = ? OR attribute.species_id IS NULL))) AND ' +
                            'attribute.canon = ? AND ' +
                            'attribute.deleted IS NULL',
                            [world_id,world.skill_attributetype_id,species_id,1]),callback);
                    }
                ],function(err,results) {
                    person.id = results[0][0].insertId;

                    var world_atr = results[1][0];

                    callback(err,species_atr,species_wpn,species_cha,world_atr);
                });
            },
            function(species_atr,species_wpn,species_cha,world_atr,callback) {
                async.parallel([
                    function(callback) {
                        pool.query(mysql.format('INSERT INTO person_is_playable (id,supernatural,age,species_id) VALUES (?,?,?,?)',
                            [person.id, person.supernatural, person.age, species_id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('INSERT INTO person_is_creation (id,point_expertise,point_gift,point_imperfection,' +
                            'point_milestone,point_money,point_power,point_relationship,point_skill,point_supernatural) VALUES (?,?,?,?,?,?,?,?,?,?)',
                            [person.id, points.expertise, points.gift, points.imperfection, points.milestone, points.money, points.power,
                                points.relationship, points.skill, points.supernatural]),callback);
                    },
                    function(callback) {
                        var call = 'INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ';

                        for(var i in world_atr) {
                            if(species_atr[0]) {
                                for(var j in species_atr) {
                                    if(world_atr[i].attribute_id === species_atr[j].attribute_id) {
                                        world_atr[i].value += species_atr[j].value;
                                    }
                                }
                            }

                            call += '(' + person.id + ',' + world_atr[i].attribute_id + ',' + world_atr[i].value + '),';
                        }

                        call = call.slice(0, -1);

                        pool.query(call,callback);
                    },
                    function(callback) {
                        if(species_wpn[0]) {
                            var call = 'INSERT INTO person_has_weapon (person_id,weapon_id,species) VALUES ';

                            for(var i in species_wpn) {
                                call += '(' + person.id + ',' + species_wpn[i].weapon_id + ',1),';
                            }

                            call = call.slice(0, -1);

                            pool.query(call,callback);
                        } else {
                            callback();
                        }
                    },
                    function(callback) {
                        if(species_cha[0]) {
                            var call = 'INSERT INTO person_has_characteristic (person_id,characteristic_id,species) VALUES ';

                            for(var i in species_cha) {
                                call += '(' + person.id + ',' + species_cha[i].characteristic_id + ',1),';
                            }

                            call = call.slice(0, -1);

                            pool.query(call,callback);
                        } else {
                            callback();
                        }
                    }
                ],function(err) {
                    callback(err);
                });
            }
        ],function(err) {
            if(err) {
                console.log(err);
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                res.status(200).send({id: person.id, secret: person.secret});
            }
        });
    });

    router.put(path + '/id/:id', function(req, res) {
        var person = {},
            insert = {},
            creation = {},
            playable = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.playable = req.body.playable;
        insert.calculated = req.body.calculated;
        insert.popularity = req.body.popularity;
        insert.thumbsup = req.body.thumbsup;
        insert.thumbsdown = req.body.thumbsdown;
        insert.nickname = req.body.nickname;
        insert.firstname = req.body.firstname;
        insert.surname = req.body.surname;
        insert.occupation = req.body.occupation;
        insert.gender = req.body.gender;
        insert.description = req.body.description;

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
        playable.personality = req.body.personality;
        playable.appearance = req.body.appearance;
        playable.species_custom = req.body.species_custom;
        playable.background_custom = req.body.background_custom;

        pool.query(mysql.format('SELECT secret,playable,calculated FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            var is_secret = result[0].secret,
                is_playable = result[0].playable,
                is_calculated = result[0].calculated;

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else if(!is_secret) {
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
                            call = call.slice(0, -2) + ' WHERE id = ?';
                            values_array.push(person.id);

                            pool.query(mysql.format(call,values_array),callback);
                        } else {
                            callback();
                        }
                    },
                    function(callback) {
                        if(is_playable && !is_calculated) {
                            var call = 'UPDATE person_is_creation SET ',
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
                        if(is_playable) {
                            var call = 'UPDATE person_is_playable SET ',
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
        rest.REVIVE(pool, req, res, table);
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(pool, req, res, table);
    });

    // Attribute

    router.post(path + '/id/:id/attribute', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.attribute_id;
        insert.value = parseInt(req.body.value);

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else if(!person.auth) {
                res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
            } else {
                pool.query(mysql.format('INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES (?,?,?) ON DUPLICATE KEY UPDATE value = VALUES(value)',[person.id,insert.id,insert.value]),function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    router.put(path + '/id/:id/attribute', function(req, res) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.attribute_id;
        insert.value = parseInt(req.body.value);

        async.parallel([
            function(callback) {
                pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),callback);
            },
            function(callback) {
                pool.query(mysql.format('SELECT value FROM person_has_attribute WHERE person_id = ? AND attribute_id = ?',[person.id,insert.id]),callback);
            }
        ],function(err,results) {
            person.auth = !!results[0][0][0];

            if(person.auth) {
                current.value = results[1][0][0] !== undefined
                    ? parseInt(results[1][0][0].value)
                    : 0;

                insert.value = insert.value + current.value;

                pool.query(mysql.format('INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES (?,?,?) ON DUPLICATE KEY UPDATE value = VALUES(value)',[person.id,insert.id,insert.value]),function(err) {
                    if(err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    // Augmentation

    router.post(path + '/id/:id/augmentation', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.augmentation_id;
        insert.bionic = req.body.bionic_id;

        async.waterfall([
            function(callback) {
                async.parallel([
                    function(callback) {
                        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM person_has_attribute WHERE person_id = ?',[person.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM augmentation_has_attribute WHERE augmentation_id = ?',[insert.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT weapon_id FROM augmentation WHERE id = ?',[insert.id]),callback);
                    }
                ],function(err,results) {
                    person.auth = !!results[0][0][0];
                    person.atr = results[1][0];
                    insert.atr = results[2][0];
                    insert.wpn = results[3][0][0];

                    callback(err,person,insert);
                });
            },
            function(person,insert,callback) {
                if(person.auth) {
                    async.parallel([
                        function(callback) {
                            pool.query(mysql.format('INSERT INTO person_has_augmentation (person_id,bionic_id,augmentation_id) VALUES (?,?,?)',[person.id,insert.bionic,insert.id]),callback);
                        },
                        function(callback) {
                            if(insert.atr[0] !== undefined) {
                                var call = 'INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ';

                                for(var i in person.atr) {
                                    for(var j in insert.atr) {
                                        if(person.atr[i].attribute_id === insert.atr[j].attribute_id) {
                                            person.atr[i].value += insert.atr[j].value;
                                            person.atr[i].changed = true;
                                            insert.atr[j].updated = true;
                                        }
                                    }

                                    if(person.atr[i].changed === true) {
                                        call += '(' + person.id + ',' + person.atr[i].attribute_id + ',' + person.atr[i].value + '),';
                                    }
                                }

                                for(var m in insert.atr) {
                                    if(insert.atr[m].updated !== true) {
                                        call += '(' + person.id + ',' + insert.atr[m].attribute_id + ',' + insert.atr[m].value + '),';
                                    }
                                }

                                call = call.slice(0, -1);

                                call += ' ON DUPLICATE KEY UPDATE value = VALUES(value)';

                                pool.query(call,callback);
                            } else { callback(); }
                        },
                        function(callback) {
                            if(insert.wpn !== undefined) {
                                var weapon = insert.wpn.weapon_id;

                                pool.query(mysql.format('INSERT INTO person_has_weapon (person_id,weapon_id) VALUES (?,?)',[person.id,weapon]),callback);
                            } else { callback(); }
                        }
                    ],function(err) {
                        callback(err);
                    });
                } else { callback('wrong secret'); }
            }
        ],function(err) {
            if(err) {
                console.log(err);
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                res.status(200).send();
            }
        })
    });

    // Background

    router.put(path + '/id/:id/background', function(req, res) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.background_id;

        async.waterfall([
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
                        pool.query(mysql.format('SELECT background_id FROM person_is_playable WHERE id = ?',[person.id]),callback);
                    }
                ],function(err,results) {
                    person.auth = !!results[0][0][0];
                    person.atr = results[1][0];
                    insert.atr = results[2][0];
                    current.id = results[3][0][0].background_id;

                    callback(err,person,insert,current);
                });
            },
            function(person,insert,current,callback) {
                if(person.auth) {
                    if(current.id !== undefined) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM background_has_attribute WHERE background_id = ?',[current.id]),function(err,result) {
                            current.atr = result;

                            callback(err,person,insert,current);
                        });
                    } else {
                        callback();
                    }
                } else { callback(); }
            },
            function(person,insert,current,callback) {
                if(person.auth && insert.id != current.id) {
                    async.parallel([
                        function(callback) {
                            pool.query(mysql.format('UPDATE person_is_playable SET background_id = ? WHERE id = ?',[insert.id,person.id]),callback);
                        },
                        function(callback) {
                            insertAttribute(person,insert,current,callback);
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

    router.post(path + '/id/:id/bionic', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.bionic_id;

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else if(!person.auth) {
                res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
            } else {
                pool.query(mysql.format('INSERT INTO person_has_bionic (person_id,bionic_id) VALUES (?,?)',[person.id,insert.id]),function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    router.put(path + '/id/:id/bionic/:id2', function(req, res) {
        setCustomDescription(req, res, 'bionic');
    });

    // Characteristic

    router.post(path + '/id/:id/characteristic', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.characteristic_id;

        async.waterfall([
            function(callback) {
                async.parallel([
                    function(callback) {
                        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM person_has_attribute WHERE person_id = ?',[person.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, attribute_value AS value FROM characteristic WHERE id = ?',[insert.id]),callback);
                    }
                ],function(err,results) {
                    person.auth = !!results[0][0][0];
                    person.atr = results[1][0];
                    insert.atr = results[2][0];

                    callback(err,person,insert);
                });
            },
            function(person,insert,callback) {
                if(person.auth) {
                    async.parallel([
                        function(callback) {
                            pool.query(mysql.format('INSERT INTO person_has_characteristic (person_id,characteristic_id) VALUES (?,?)',[person.id,insert.id]),callback);
                        },
                        function(callback) {
                            if(insert.atr[0].attribute_id !== null) {
                                var call = 'INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ';

                                for(var i in person.atr) {
                                    for(var j in insert.atr) {
                                        if(person.atr[i].attribute_id === insert.atr[j].attribute_id) {
                                            person.atr[i].value += insert.atr[j].value;
                                            person.atr[i].changed = true;
                                            insert.atr[j].updated = true;
                                        }
                                    }

                                    if(person.atr[i].changed === true) {
                                        call += '(' + person.id + ',' + person.atr[i].attribute_id + ',' + person.atr[i].value + '),';
                                    }
                                }

                                for(var m in insert.atr) {
                                    if(insert.atr[m].updated !== true) {
                                        call += '(' + person.id + ',' + insert.atr[m].attribute_id + ',' + insert.atr[m].value + '),';
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
                } else { callback('wrong secret'); }
            }
        ],function(err) {
            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                res.status(200).send();
            }
        });
    });

    router.put(path + '/id/:id/characteristic/:id2', function(req, res) {
        setCustomDescription(req, res, 'characteristic');
    });

    router.delete(path + '/id/:id/characteristic/:id2', function(req, res) {
        deleteRelation(req, res, 'characteristic');
    });

    // Disease

    router.post(path + '/id/:id/disease', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.name = req.body.name;
        insert.timestwo = req.body.timestwo;

        pool.query(mysql.format('INSERT INTO disease (name) VALUES (?)',[insert.name]),function(err,result) {
            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                insert.id = result.insertId;

                pool.query(mysql.format('INSERT INTO person_has_disease (person_id,disease_id,timestwo) VALUES (?,?,?)',[person.id,insert.id,insert.timestwo]),function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    router.put(path + '/id/:id/disease/:id2/heal/:heal', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.params.id2;
        insert.heal = req.params.heal;

        pool.query(mysql.format('UPDATE person_has_disease SET heal = ? WHERE person_id = ? AND disease_id = ?',[insert.heal,person.id,insert.id]),function(err) {
            if (err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                res.status(200).send();
            }
        });
    });

    // Expertise

    router.post(path + '/id/:id/expertise', function(req, res) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.expertise_id;
        insert.lvl = req.body.level;

        async.waterfall([
            function(callback) {
                async.parallel([
                    function(callback) {
                        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM person_has_attribute WHERE person_id = ?',[person.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT give_attribute_id AS attribute_id FROM expertise WHERE id = ?',[insert.id]),callback);
                    },
                    function(callback) {
                        var call = 'SELECT ' +
                            'expertisetype.maximum ' +
                            'FROM expertise ' +
                            'LEFT JOIN expertisetype ON expertisetype.id = expertise.expertisetype_id ' +
                            'WHERE expertise.id = ?';

                        pool.query(mysql.format(call,[insert.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT level FROM person_has_expertise WHERE person_id = ? AND expertise_id = ?',[person.id,insert.id]),callback);
                    }
                ],function(err,results) {
                    person.auth = !!results[0][0][0];
                    person.atr = results[1][0];
                    insert.atr = results[2][0];
                    insert.max = results[3][0][0].maximum;

                    current.lvl = results[4][0][0] !== undefined
                        ? results[2][0][0].level
                        : 0;

                    callback(err,person,insert,current);
                });
            },
            function(person,insert,current,callback) {
                if(person.auth) {
                    async.parallel([
                        function(callback) {
                            if(insert.lvl <= insert.max && insert.lvl > 0 && insert.lvl > current.lvl) {
                                pool.query(mysql.format('INSERT INTO person_has_expertise (person_id,expertise_id,level) VALUES (?,?,?) ON DUPLICATE KEY UPDATE level = VALUES(level)',[person.id,insert.id,insert.lvl]),callback);
                            } else { callback(); }
                        },
                        function(callback) {
                            if(insert.atr[0].attribute_id !== null && insert.lvl <= insert.max && insert.lvl > current.lvl) {
                                var call = 'INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ';

                                insert.atr[0].value = insert.lvl - current.lvl;

                                for(var i in person.atr) {
                                    for(var j in insert.atr) {
                                        if(person.atr[i].attribute_id === insert.atr[j].attribute_id) {
                                            person.atr[i].value += insert.atr[j].value;
                                            person.atr[i].changed = true;
                                            insert.atr[j].updated = true;
                                        }
                                    }

                                    if(person.atr[i].changed === true) {
                                        call += '(' + person.id + ',' + person.atr[i].attribute_id + ',' + person.atr[i].value + '),';
                                    }
                                }

                                for(var m in insert.atr) {
                                    if(insert.atr[m].updated !== true) {
                                        call += '(' + person.id + ',' + insert.atr[m].attribute_id + ',' + insert.atr[m].value + '),';
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
                } else { callback('wrong secret'); }
            }
        ],function(err) {
            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                res.status(200).send();
            }
        });
    });

    router.put(path + '/id/:id/expertise/:id2', function(req, res) {
        setCustomDescription(req, res, 'expertise');
    });

    // Focus

    router.put(path + '/id/:id/focus', function(req, res) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.focus_id;

        async.waterfall([
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
                        pool.query(mysql.format('SELECT focus_id FROM person_is_playable WHERE id = ?',[person.id]),callback);
                    }
                ],function(err,results) {
                    person.auth = !!results[0][0][0];
                    person.atr = results[1][0];
                    insert.atr = results[2][0];
                    current.id = results[3][0][0].focus_id;

                    callback(err,person,insert,current);
                });
            },
            function(person,insert,current,callback) {
                if(person.auth && current.id !== undefined) {
                    pool.query(mysql.format('SELECT attribute_id, attribute_value AS value FROM focus WHERE id = ?',[current.id]),function(err,result) {
                        current.atr = result;

                        callback(err,person,insert,current);
                    });
                } else { callback(); }
            },
            function(person,insert,current,callback) {
                if(person.auth && insert.id != current.id) {
                    async.parallel([
                        function(callback) {
                            pool.query(mysql.format('UPDATE person_is_playable SET focus_id = ? WHERE id = ?',[insert.id,person.id]),callback);
                        },
                        function(callback) {
                            insertAttribute(person,insert,current,callback);
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

        async.waterfall([
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
                        pool.query(mysql.format('SELECT identity_id FROM person_is_playable WHERE id = ?',[person.id]),callback);
                    }
                ],function(err,results) {
                    person.auth = !!results[0][0][0];
                    person.atr = results[1][0];
                    insert.atr = results[2][0];
                    current.id = results[3][0][0].identity_id;

                    callback(err,person,insert,current);
                });
            },
            function(person,insert,current,callback) {
                if(person.auth && current.id !== undefined) {
                    pool.query(mysql.format('SELECT attribute_id, attribute_value AS value FROM identity WHERE id = ?',[current.id]),function(err,result) {
                        current.atr = result;

                        callback(err,person,insert,current);
                    });
                } else { callback(); }
            },
            function(person,insert,current,callback) {
                if(person.auth && insert.id != current.id) {
                    async.parallel([
                        function(callback) {
                            pool.query(mysql.format('UPDATE person_is_playable SET identity_id = ? WHERE id = ?',[insert.id,person.id]),callback);
                        },
                        function(callback) {
                            insertAttribute(person,insert,current,callback);
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

    router.put(path + '/id/:id/manifestation', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.manifestation_id;

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else if(!person.auth) {
                res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
            } else {
                pool.query(mysql.format('UPDATE person_is_playable SET manifestation_id = ? WHERE id = ?',[insert.id,person.id]),function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    // Milestone

    router.post(path + '/id/:id/milestone', function(req, res) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.milestone_id;

        async.waterfall([
            function(callback) {
                async.parallel([
                    function(callback) {
                        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM person_has_attribute WHERE person_id = ?',[person.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, attribute_value AS value FROM milestone WHERE id = ?',[insert.id]),callback);
                    }
                ],function(err,results) {
                    person.auth = !!results[0][0][0];
                    person.atr = results[1][0];
                    insert.atr = results[2][0];

                    callback(err,person,insert);
                });
            },
            function(person,insert,callback) {
                if(person.auth) {
                    async.parallel([
                        function(callback) {
                            pool.query(mysql.format('INSERT INTO person_has_milestone (person_id,milestone_id) VALUES (?,?)',[person.id,insert.id]),callback);
                        },
                        function(callback) {
                            insertAttribute(person, insert, current, callback);
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

    router.put(path + '/id/:id/milestone/:id2', function(req, res) {
        setCustomDescription(req, res, 'milestone');
    });

    router.delete(path + '/id/:id/milestone/:id2', function(req, res) {
        deleteRelation(req, res, 'milestone');
    });

    // Nature

    router.put(path + '/id/:id/nature', function(req, res) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.nature_id;

        async.waterfall([
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
                        pool.query(mysql.format('SELECT nature_id FROM person_is_playable WHERE id = ?',[person.id]),callback);
                    }
                ],function(err,results) {
                    person.auth = !!results[0][0][0];
                    person.atr = results[1][0];
                    insert.atr = results[2][0];
                    current.id = results[3][0][0].nature_id;

                    callback(err,person,insert,current);
                });
            },
            function(person,insert,current,callback) {
                if(person.auth && current.id !== undefined) {
                    pool.query(mysql.format('SELECT attribute_id, attribute_value AS value FROM nature WHERE id = ?',[current.id]),function(err,result) {
                        current.atr = result;

                        callback(err,person,insert,current);
                    });
                } else { callback(); }
            },
            function(person,insert,current,callback) {
                if(person.auth && insert.id != current.id) {
                    async.parallel([
                        function(callback) {
                            pool.query(mysql.format('UPDATE person_is_playable SET nature_id = ? WHERE id = ?',[insert.id,person.id]),callback);
                        },
                        function(callback) {
                            if(insert.atr[0] !== undefined) {
                                var call = 'INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ';

                                for(var i in person.atr) {
                                    for(var j in insert.atr) {
                                        if(person.atr[i].attribute_id === insert.atr[j].attribute_id) {
                                            person.atr[i].value += insert.atr[j].value;
                                            person.atr[i].changed = true;
                                            insert.atr[j].updated = true;
                                        }
                                    }

                                    if(current.atr[0]) {
                                        for(var k in current.atr) {
                                            if(person.atr[i].attribute_id === current.atr[k].attribute_id) {
                                                person.atr[i].value -= current.atr[k].value;
                                                person.atr[i].changed = true;
                                            }
                                        }
                                    }

                                    if(person.atr[i].changed === true) {
                                        call += '(' + person.id + ',' + person.atr[i].attribute_id + ',' + person.atr[i].value + '),';
                                    }
                                }

                                for(var m in insert.atr) {
                                    if(insert.atr[m].updated !== true) {
                                        call += '(' + person.id + ',' + insert.atr[m].attribute_id + ',' + insert.atr[m].value + '),';
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

    router.post(path + '/id/:id/protection', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.protection_id;

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else if(!person.auth) {
                res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
            } else {
                pool.query(mysql.format('INSERT INTO person_has_protection (person_id,protection_id) VALUES (?,?)',[person.id,insert.id]),function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    router.put(path + '/id/:id/protection/:id2', function(req, res) {
        setCustomDescription(req, res, 'protection');
    });

    router.put(path + '/id/:id/protection/:id2/equip/:equip', function(req, res) {
        setEquipped(req, res, 'protection');
    });

    router.delete(path + '/id/:id/protection/:id2', function(req, res) {
        deleteRelation(req, res, 'protection');
    });

    // Sanity

    router.post(path + '/id/:id/sanity', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.name = req.body.name;
        insert.timestwo = req.body.timestwo;

        pool.query(mysql.format('INSERT INTO sanity (name) VALUES (?)',[insert.name]),function(err,result) {
            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                insert.id = result.insertId;

                pool.query(mysql.format('INSERT INTO person_has_sanity (person_id,sanity_id,timestwo) VALUES (?,?,?)',[person.id,insert.id,insert.timestwo]),function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    router.put(path + '/id/:id/sanity/:id2/heal/:heal', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.params.id2;
        insert.heal = req.params.heal;

        pool.query(mysql.format('UPDATE person_has_sanity SET heal = ? WHERE person_id = ? AND sanity_id = ?',[insert.heal,person.id,insert.id]),function(err) {
            if (err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                res.status(200).send();
            }
        });
    });

    // Species

    router.put(path + '/id/:id/species', function(req, res) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.species_id;

        async.waterfall([
            function(callback) {
                async.parallel([
                    function(callback) {
                        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM person_has_attribute WHERE person_id = ?',[person.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM species_has_attribute WHERE species_id = ?',[insert.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT species_id FROM person_is_playable WHERE id = ?',[person.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT weapon_id FROM species_has_weapon WHERE species_id = ?',[insert.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT characteristic_id FROM species_has_characteristic WHERE species_id = ?',[insert.id]),callback);
                    }
                ],function(err,results) {
                    person.auth = !!results[0][0][0];
                    person.atr = results[1][0];
                    insert.atr = results[2][0];
                    current.id = results[3][0][0].species_id;
                    insert.wpn = results[4][0];
                    insert.cha = results[5][0];

                    callback(err,person,insert,current);
                });
            },
            function(person,insert,current,callback) {
                if(person.auth && current.id !== undefined && insert.id != current.id) {
                    async.parallel([
                        function(callback) {
                            pool.query(mysql.format('SELECT attribute_id, value FROM species_has_attribute WHERE species_id = ?',[current.id]),callback);
                        },
                        function(callback) {
                            pool.query(mysql.format('SELECT weapon_id FROM species_has_weapon WHERE species_id = ?',[current.id]),callback);
                        },
                        function(callback) {
                            pool.query(mysql.format('SELECT characteristic_id FROM species_has_characteristic WHERE species_id = ?',[current.id]),callback);
                        }
                    ],function(err,results) {
                        current.atr = results[0][0];
                        current.wpn = results[1][0];
                        current.cha = results[2][0];

                        callback(err,person,insert,current);
                    });
                } else { callback(); }
            },
            function(person,insert,current,callback) {
                if(person.auth && insert.id != current.id) {
                    async.series([
                        function(callback) {
                            pool.query(mysql.format('UPDATE person_is_playable SET species_id = ? WHERE id = ?',[insert.id,person.id]),callback);
                        },
                        function(callback) {
                            pool.query(mysql.format('DELETE FROM person_has_weapon WHERE person_id = ? AND species = ?',[person.id,1]),callback);
                        },
                        function(callback) {
                            pool.query(mysql.format('DELETE FROM person_has_characteristic WHERE person_id = ? AND species = ?',[person.id,1]),callback);
                        },
                        function(callback) {
                            if(insert.atr[0] !== undefined) {
                                var call = 'INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ';

                                for(var i in person.atr) {
                                    for(var j in insert.atr) {
                                        if(person.atr[i].attribute_id === insert.atr[j].attribute_id) {
                                            person.atr[i].value += insert.atr[j].value;
                                            person.atr[i].changed = true;
                                            insert.atr[j].updated = true;
                                        }
                                    }

                                    if(current.atr[0]) {
                                        for(var k in current.atr) {
                                            if(person.atr[i].attribute_id === current.atr[k].attribute_id) {
                                                person.atr[i].value -= current.atr[k].value;
                                                person.atr[i].changed = true;
                                            }
                                        }
                                    }

                                    if(person.atr[i].changed === true) {
                                        call += '(' + person.id + ',' + person.atr[i].attribute_id + ',' + person.atr[i].value + '),';
                                    }
                                }

                                for(var m in insert.atr) {
                                    if(insert.atr[m].updated !== true) {
                                        call += '(' + person.id + ',' + insert.atr[m].attribute_id + ',' + insert.atr[m].value + '),';
                                    }
                                }

                                call = call.slice(0, -1);

                                call += ' ON DUPLICATE KEY UPDATE value = VALUES(value)';

                                console.log(call);

                                pool.query(call,callback);
                            } else { callback(); }
                        },
                        function(callback) {
                            if(insert.wpn[0] !== undefined) {
                                var call = 'INSERT INTO person_has_weapon (person_id,weapon_id,species) VALUES ';

                                for(var i in insert.wpn) {
                                    call += '(' + person.id + ',' + insert.wpn[i].weapon_id + ',1),';
                                }

                                call = call.slice(0, -1);

                                console.log(call);

                                pool.query(call,callback);
                            } else { callback(); }
                        },
                        function(callback) {
                            if(insert.cha[0] !== undefined) {
                                var call = 'INSERT INTO person_has_characteristic (person_id,characteristic_id,species) VALUES ';

                                for(var i in insert.cha) {
                                    call += '(' + person.id + ',' + insert.cha[i].characteristic_id + ',1),';
                                }

                                call = call.slice(0, -1);

                                console.log(call);

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

    // Software

    router.post(path + '/id/:id/software', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.software_id;

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else if(!person.auth) {
                res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
            } else {
                pool.query(mysql.format('INSERT INTO person_has_software (person_id,bionic_id) VALUES (?,?)',[person.id,insert.id]),function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    router.delete(path + '/id/:id/software/:id2', function(req, res) {
        deleteRelation(req, res, 'software');
    });

    // Weapon

    router.post(path + '/id/:id/weapon', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.weapon_id;

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else if(!person.auth) {
                res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
            } else {
                pool.query(mysql.format('INSERT INTO person_has_weapon (person_id,weapon_id) VALUES (?,?)',[person.id,insert.id]),function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    router.put(path + '/id/:id/weapon/:id2', function(req, res) {
        setCustomDescription(req, res, 'bionic');
    });

    router.put(path + '/id/:id/weapon/:id2/equip/:equip', function(req, res) {
        setEquipped(req, res, 'weapon');
    });

    router.delete(path + '/id/:id/weapon/:id2', function(req, res) {
        deleteRelation(req, res, 'weapon');
    });

    // Wound

    router.post(path + '/id/:id/wound', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.name = req.body.name;
        insert.timestwo = req.body.timestwo;

        pool.query(mysql.format('INSERT INTO wound (name) VALUES (?)',[insert.name]),function(err,result) {
            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                insert.id = result.insertId;

                pool.query(mysql.format('INSERT INTO person_has_wound (person_id,wound_id,timestwo) VALUES (?,?,?)',[person.id,insert.id,insert.timestwo]),function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    router.put(path + '/id/:id/wound/:id2/heal/:heal', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.params.id2;
        insert.heal = req.params.heal;

        pool.query(mysql.format('UPDATE person_has_wound SET heal = ? WHERE person_id = ? AND wound_id = ?',[insert.heal,person.id,insert.id]),function(err) {
            if (err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                res.status(200).send();
            }
        });
    });
};