var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    name: r.rHEX(24),
    description: r.rHEX(64),
    short: r.rHEX(1),
    price: r.rINT(1,40),
    damage_d12: r.rINT(1,10),
    damage_bonus: r.rINT(1,10),
    critical_d12: r.rINT(1,10),
    initiative: r.rINT(1,10),
    hit: r.rINT(1,10),
    distance: r.rINT(1,10),
    weapontype_id: 1
};

var testPUT = {
    name: r.rHEX(24),
    description: r.rHEX(64),
    short: r.rHEX(1),
    price: r.rINT(1,40),
    damage_d12: r.rINT(1,10),
    damage_bonus: r.rINT(1,10),
    critical_d12: r.rINT(1,10),
    initiative: r.rINT(1,10),
    hit: r.rINT(1,10),
    distance: r.rINT(1,10),
    weapontype_id: 1
};

var insertedID;

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.name);
        should.exist(item.description);
        should.exist(item.short);
        should.exist(item.price);
        should.exist(item.damage_d12);
        should.exist(item.damage_bonus);
        should.exist(item.critical_d12);
        should.exist(item.initiative);
        should.exist(item.hit);
        should.exist(item.distance);
        should.exist(item.weapontype_id);
        should.exist(item.weapontype_name);
        should.exist(item.created);
    });
};

describe('Weapon Modification', function() {

    it('should successfully POST new row', function(done) {
        api('/weaponmod', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                insertedID = response.body.id;

                done();
            });
    });

    it('should successfully PUT new row', function(done) {
        api('/weaponmod/id/' + insertedID, testPUT, 'put')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows', function(done) {
        api('/weaponmod')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

    it('should successfully GET latest row', function(done) {
        api('/weaponmod/id/' + insertedID)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});