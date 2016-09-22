var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    nickname: r.rHEX(32),
    firstname: r.rHEX(32),
    surname: r.rHEX(32),
    age: r.rINT(1,99),
    afflicted: r.rBOOL(),
    cheated: 0,
    occupation: r.rHEX(32),
    gender: r.rHEX(32),
    description: r.rHEX(64),
    behaviour: r.rHEX(64),
    appearance: r.rHEX(64),
    features: r.rHEX(64),
    personality: r.rHEX(64),
    template: r.rBOOL(),
    popularity: r.rINT(1,40),
    setting_id: 1,
    species_id: 1,
    caste_id: 1,
    nature_id: 1,
    identity_id: 1,
    manifestation_id: 1,
    focus_id: 1
};

var testPUT = {
    nickname: r.rHEX(32),
    firstname: r.rHEX(32),
    surname: r.rHEX(32),
    age: r.rINT(1,99),
    afflicted: r.rBOOL(),
    cheated: 0,
    occupation: r.rHEX(32),
    gender: r.rHEX(32),
    description: r.rHEX(64),
    behaviour: r.rHEX(64),
    appearance: r.rHEX(64),
    features: r.rHEX(64),
    personality: r.rHEX(64),
    template: r.rBOOL(),
    popularity: r.rINT(1,40),
    setting_id: 1,
    species_id: 1,
    caste_id: 1,
    nature_id: 1,
    identity_id: 1,
    manifestation_id: 1,
    focus_id: 1
};

var insertedID,
    insertedHASH;

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.nickname);
        should.exist(item.firstname);
        should.exist(item.surname);
        should.exist(item.age);
        should.exist(item.occupation);
        should.exist(item.gender);
        should.exist(item.description);
        should.exist(item.behaviour);
        should.exist(item.appearance);
        should.exist(item.features);
        should.exist(item.personality);
        should.exist(item.template);
        should.exist(item.popularity);
        should.exist(item.setting_id);
        should.exist(item.setting_name);
        should.exist(item.setting_description);
        should.exist(item.species_id);
        should.exist(item.species_name);
        should.exist(item.species_description);
        should.exist(item.caste_id);
        should.exist(item.caste_name);
        should.exist(item.caste_description);
        should.exist(item.nature_id);
        should.exist(item.nature_name);
        should.exist(item.nature_description);
        should.exist(item.identity_id);
        should.exist(item.identity_name);
        should.exist(item.identity_description);
        should.exist(item.manifestation_id);
        should.exist(item.manifestation_name);
        should.exist(item.manifestation_description);
        should.exist(item.focus_id);
        should.exist(item.focus_name);
        should.exist(item.focus_description);
        should.exist(item.created);
    });
};

describe('Person', function() {

    it('should successfully POST new row', function(done) {
        api('/person', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;
                insertedID = response.body.id;
                insertedHASH = response.body.hash;

                should.exist(data);

                done();
            });
    });

    it('should successfully PUT new row', function(done) {
        api('/person/hash/'+insertedHASH, testPUT, 'put')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;

                should.exist(data);

                done();
            });
    });

    it('should successfully GET all rows', function(done) {
        api('/person')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

    it('should successfully GET latest row', function(done) {
        api('/person/id/'+insertedID)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

    it('should successfully GET latest row with hash', function(done) {
        api('/person/hash/'+insertedHASH)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});