var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    name_nick: r.rHEX(32),
    name_first: r.rHEX(32),
    name_last: r.rHEX(32),
    age: r.rINT(1,99),
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
    name_nick: r.rHEX(32),
    name_first: r.rHEX(32),
    name_last: r.rHEX(32),
    age: r.rINT(1,99),
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
                var data = response.body.success;

                should.exist(data);

                _.each(data, function(item) {
                    should.exist(item.name_nick);
                    should.exist(item.name_first);
                    should.exist(item.name_last);
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

                done();
            });
    });

    it('should successfully GET latest row', function(done) {
        api('/person/id/'+insertedID)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success[0];

                should.exist(data);

                expect(data.id).to.equal(insertedID);
                expect(data.name_nick).to.equal(testPUT.name_nick);
                expect(data.name_first).to.equal(testPUT.name_first);
                expect(data.name_last).to.equal(testPUT.name_last);
                expect(data.age).to.equal(testPUT.age);
                expect(data.occupation).to.equal(testPUT.occupation);
                expect(data.gender).to.equal(testPUT.gender);
                expect(data.description).to.equal(testPUT.description);
                expect(data.behaviour).to.equal(testPUT.behaviour);
                expect(data.appearance).to.equal(testPUT.appearance);
                expect(data.features).to.equal(testPUT.features);
                expect(data.personality).to.equal(testPUT.personality);
                expect(data.template).to.equal(testPUT.template);
                expect(data.popularity).to.equal(testPUT.popularity);
                expect(data.setting_id).to.equal(testPUT.setting_id);
                should.exist(data.setting_name);
                should.exist(data.setting_description);
                expect(data.species_id).to.equal(testPUT.species_id);
                should.exist(data.species_name);
                should.exist(data.species_description);
                expect(data.caste_id).to.equal(testPUT.caste_id);
                should.exist(data.caste_name);
                should.exist(data.caste_description);
                expect(data.nature_id).to.equal(testPUT.nature_id);
                should.exist(data.nature_name);
                should.exist(data.nature_description);
                expect(data.identity_id).to.equal(testPUT.identity_id);
                should.exist(data.identity_name);
                should.exist(data.identity_description);
                expect(data.manifestation_id).to.equal(testPUT.manifestation_id);
                should.exist(data.manifestation_name);
                should.exist(data.manifestation_description);
                expect(data.focus_id).to.equal(testPUT.focus_id);
                should.exist(data.focus_name);
                should.exist(data.focus_description);
                should.exist(data.created);

                done();
            });
    });

    it('should successfully GET latest row with hash', function(done) {
        api('/person/hash/'+insertedHASH)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success[0];

                should.exist(data);

                expect(data.id).to.equal(insertedID);
                expect(data.name_nick).to.equal(testPUT.name_nick);
                expect(data.name_first).to.equal(testPUT.name_first);
                expect(data.name_last).to.equal(testPUT.name_last);
                expect(data.age).to.equal(testPUT.age);
                expect(data.occupation).to.equal(testPUT.occupation);
                expect(data.gender).to.equal(testPUT.gender);
                expect(data.description).to.equal(testPUT.description);
                expect(data.behaviour).to.equal(testPUT.behaviour);
                expect(data.appearance).to.equal(testPUT.appearance);
                expect(data.features).to.equal(testPUT.features);
                expect(data.personality).to.equal(testPUT.personality);
                expect(data.template).to.equal(testPUT.template);
                expect(data.popularity).to.equal(testPUT.popularity);
                expect(data.setting_id).to.equal(testPUT.setting_id);
                should.exist(data.setting_name);
                should.exist(data.setting_description);
                expect(data.species_id).to.equal(testPUT.species_id);
                should.exist(data.species_name);
                should.exist(data.species_description);
                expect(data.caste_id).to.equal(testPUT.caste_id);
                should.exist(data.caste_name);
                should.exist(data.caste_description);
                expect(data.nature_id).to.equal(testPUT.nature_id);
                should.exist(data.nature_name);
                should.exist(data.nature_description);
                expect(data.identity_id).to.equal(testPUT.identity_id);
                should.exist(data.identity_name);
                should.exist(data.identity_description);
                expect(data.manifestation_id).to.equal(testPUT.manifestation_id);
                should.exist(data.manifestation_name);
                should.exist(data.manifestation_description);
                expect(data.focus_id).to.equal(testPUT.focus_id);
                should.exist(data.focus_name);
                should.exist(data.focus_description);
                should.exist(data.created);

                done();
            });
    });

});