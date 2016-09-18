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
    damage_d12: r.rINT(1,10),
    damage_bonus: r.rINT(1,10),
    critical_d12: r.rINT(1,10),
    hand: r.rINT(1,2),
    initiative: r.rINT(1,10),
    hit: r.rINT(1,10),
    distance: r.rINT(1,10),
    weapongroup_id: 1
};

var testPUT = {
    name: r.rHEX(24),
    description: r.rHEX(64),
    damage_d12: r.rINT(1,10),
    damage_bonus: r.rINT(1,10),
    critical_d12: r.rINT(1,10),
    hand: r.rINT(1,2),
    initiative: r.rINT(1,10),
    hit: r.rINT(1,10),
    distance: r.rINT(1,10),
    weapongroup_id: 1
};

var insertedID;

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.name);
        should.exist(item.description);
        should.exist(item.damage_d12);
        should.exist(item.damage_bonus);
        should.exist(item.critical_d12);
        should.exist(item.hand);
        should.exist(item.initiative);
        should.exist(item.hit);
        should.exist(item.distance);
        should.exist(item.weapongroup_id);
        should.exist(item.weapongroup_name);
        should.exist(item.created);
    });
};

describe('Weapon Type', function() {

    it('should successfully POST new row', function(done) {
        api('/weapontype', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                insertedID = response.body.id;

                done();
            });
    });

    it('should successfully PUT new row', function(done) {
        api('/weapontype/id/' + insertedID, testPUT, 'put')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows', function(done) {
        api('/weapontype')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

    it('should successfully GET latest row', function(done) {
        api('/weapontype/id/' + insertedID)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});