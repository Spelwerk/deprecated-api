var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    person_id: 1,
    weaponmod_id: 1,
    weapon_id: 1
};

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
    });
};

describe('Person has Weapon Modification', function() {

    it('should successfully POST new row', function(done) {
        api('/person-weaponmod', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for person', function(done) {
        api('/person-weaponmod/id/' + testPOST.person_id + '/weapon/1')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});