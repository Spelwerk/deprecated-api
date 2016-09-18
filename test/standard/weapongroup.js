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
    skill_attribute_id: 1,
    damage_attribute_id: 1,
    expertise_id: 1
};

var testPUT = {
    name: r.rHEX(24),
    description: r.rHEX(64),
    skill_attribute_id: 1,
    damage_attribute_id: 1,
    expertise_id: 1
};

var insertedID;

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.name);
        should.exist(item.description);
        should.exist(item.skill_attribute_id);
        should.exist(item.skill_attribute_name);
        should.exist(item.damage_attribute_id);
        should.exist(item.damage_attribute_name);
        should.exist(item.expertise_id);
        should.exist(item.expertise_name);
        should.exist(item.created);
    });
};

describe('Weapon Group', function() {

    it('should successfully POST new row', function(done) {
        api('/weapongroup', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                insertedID = response.body.id;

                done();
            });
    });

    it('should successfully PUT new row', function(done) {
        api('/weapongroup/id/' + insertedID, testPUT, 'put')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows', function(done) {
        api('/weapongroup')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

    it('should successfully GET latest row', function(done) {
        api('/weapongroup/id/' + insertedID)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});