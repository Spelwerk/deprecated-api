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
    occupation: r.rHEX(32),
    finance: r.rINT(1,40),
    popularity: r.rINT(1,40),
    setting_id: 1
};

var testPUT = {
    name: r.rHEX(24),
    description: r.rHEX(64),
    occupation: r.rHEX(32),
    finance: r.rINT(1,40),
    popularity: r.rINT(1,40),
    setting_id: 1
};

var insertedID;

describe('Relationship', function() {

    it('should successfully POST new row', function(done) {
        api('/relationship', testPOST)
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
        api('/relationship/id/'+insertedID, testPUT, 'put')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;

                should.exist(data);

                done();
            });
    });

    it('should successfully GET all rows', function(done) {
        api('/relationship')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;

                should.exist(data);

                _.each(data, function(item) {
                    should.exist(item.name);
                    should.exist(item.description);
                    should.exist(item.occupation);
                    should.exist(item.finance);
                    should.exist(item.popularity);
                    should.exist(item.setting_id);
                    should.exist(item.setting_name);
                    should.exist(item.created);
                });

                done();
            });
    });

    it('should successfully GET latest row', function(done) {
        api('/relationship/id/'+insertedID)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success[0];

                should.exist(data);

                expect(data.id).to.equal(insertedID);
                expect(data.name).to.equal(testPUT.name);
                expect(data.description).to.equal(testPUT.description);
                expect(data.occupation).to.equal(testPUT.occupation);
                expect(data.finance).to.equal(testPUT.finance);
                expect(data.popularity).to.equal(testPUT.popularity);
                expect(data.setting_id).to.equal(testPUT.setting_id);
                should.exist(data.setting_name);
                should.exist(data.created);

                done();
            });
    })

});