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
    attributetype_id: 1,
    manifestation_id: 1
};

var testPUT = {
    name: r.rHEX(24),
    description: r.rHEX(64),
    attributetype_id: 1,
    manifestation_id: 1
};

var insertedID;

describe('Attribute', function() {

    it('should successfully POST new row', function(done) {
        api('/attribute', testPOST)
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
        api('/attribute/id/'+insertedID, testPUT, 'put')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;

                should.exist(data);

                done();
            });
    });

    it('should successfully GET all rows', function(done) {
        api('/attribute')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;

                should.exist(data);

                _.each(data, function(item) {
                    should.exist(item.name);
                    should.exist(item.description);
                    should.exist(item.maximum);
                    should.exist(item.attributetype_id);
                    should.exist(item.attributetype_name);
                    should.exist(item.manifestation_id);
                    should.exist(item.manifestation_name);
                    should.exist(item.created);
                });

                done();
            });
    });

    it('should successfully GET latest row', function(done) {
        api('/attribute/id/'+insertedID)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success[0];

                should.exist(data);

                expect(data.id).to.equal(insertedID);
                expect(data.name).to.equal(testPUT.name);
                expect(data.description).to.equal(testPUT.description);
                should.exist(data.maximum);
                expect(data.attributetype_id).to.equal(testPUT.attributetype_id);
                should.exist(data.attributetype_name);
                expect(data.manifestation_id).to.equal(testPUT.manifestation_id);
                should.exist(data.manifestation_name);
                should.exist(data.created);

                done();
            });
    })

});