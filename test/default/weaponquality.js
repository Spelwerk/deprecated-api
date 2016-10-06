var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    name: r.rHEX(24),
    price: r.rINT(1,40),
    damage_d12: r.rINT(1,40),
    damage_bonus: r.rINT(1,40),
    critical_d12: r.rINT(1,40),
    initiative: r.rINT(1,40),
    hit: r.rINT(1,40),
    distance: r.rINT(1,40)
};

var testPUT = {
    name: r.rHEX(24),
    price: r.rINT(1,40),
    damage_d12: r.rINT(1,40),
    damage_bonus: r.rINT(1,40),
    critical_d12: r.rINT(1,40),
    initiative: r.rINT(1,40),
    hit: r.rINT(1,40),
    distance: r.rINT(1,40)
};

var insertedID;

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.name);
        should.exist(item.price);
        should.exist(item.damage_d12);
        should.exist(item.damage_bonus);
        should.exist(item.critical_d12);
        should.exist(item.initiative);
        should.exist(item.hit);
        should.exist(item.distance);
        should.exist(item.created);
    });
};

describe('Weapon Quality', function() {

    it('should successfully POST new row', function(done) {
        api('/weaponquality', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                insertedID = response.body.id;

                done();
            });
    });

    it('should successfully PUT new row', function(done) {
        api('/weaponquality/id/' + insertedID, testPUT, 'put')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows', function(done) {
        api('/weaponquality')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

    it('should successfully GET latest row', function(done) {
        api('/weaponquality/id/' + insertedID)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});