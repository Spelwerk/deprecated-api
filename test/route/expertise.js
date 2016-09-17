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
    hidden: r.rBOOL(),
    expertisetype_id: 1,
    species_id: 1,
    manifestation_id: 1,
    skill_attribute_id: 1,
    give_attribute_id: 1
};

var testPUT = {
    name: r.rHEX(24),
    description: r.rHEX(64),
    hidden: r.rBOOL(),
    expertisetype_id: 1,
    species_id: 1,
    manifestation_id: 1,
    skill_attribute_id: 1,
    give_attribute_id: 1
};

var insertedID;

describe('Expertise', function() {

    it('should successfully POST new row', function(done) {
        api('/expertise', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;
                insertedID = response.body.id;

                should.exist(data);

                done();
            });
    });

    it('should successfully PUT new row', function(done) {
        api('/expertise/id/'+insertedID, testPUT, 'put')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;

                should.exist(data);

                done();
            });
    });

    it('should successfully GET all rows', function(done) {
        api('/expertise')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;

                should.exist(data);

                _.each(data, function(item) {
                    should.exist(item.name);
                    should.exist(item.description);
                    should.exist(item.hidden);
                    should.exist(item.maximum);
                    should.exist(item.expertisetype_id);
                    should.exist(item.expertisetype_name);
                    should.exist(item.species_id);
                    should.exist(item.species_name);
                    should.exist(item.manifestation_id);
                    should.exist(item.manifestation_name);
                    should.exist(item.skill_attribute_id);
                    should.exist(item.skill_attribute_name);
                    should.exist(item.give_attribute_id);
                    should.exist(item.give_attribute_name);
                    should.exist(item.created);
                });

                done();
            });
    });

    it('should successfully GET latest row', function(done) {
        api('/expertise/id/'+insertedID)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success[0];

                should.exist(data);

                expect(data.id).to.equal(insertedID);
                expect(data.name).to.equal(testPUT.name);
                expect(data.description).to.equal(testPUT.description);
                expect(data.hidden).to.equal(testPUT.hidden);
                should.exist(data.maximum);
                expect(data.expertisetype_id).to.equal(testPUT.expertisetype_id);
                should.exist(data.expertisetype_name);
                expect(data.species_id).to.equal(testPUT.species_id);
                should.exist(data.species_name);
                expect(data.manifestation_id).to.equal(testPUT.manifestation_id);
                should.exist(data.manifestation_name);
                expect(data.skill_attribute_id).to.equal(testPUT.skill_attribute_id);
                should.exist(data.skill_attribute_name);
                expect(data.give_attribute_id).to.equal(testPUT.give_attribute_id);
                should.exist(data.give_attribute_name);
                should.exist(data.created);

                done();
            });
    })

});