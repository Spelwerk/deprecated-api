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
    template: r.rBOOL(),
    popularity: r.rINT(1,40)
};

var testPUT = {
    name: r.rHEX(24),
    description: r.rHEX(64),
    template: r.rBOOL(),
    popularity: r.rINT(1,40)
};

var insertedID;

describe('Setting', function() {

    it('should successfully POST new row', function(done) {
        api('/setting', testPOST)
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
        api('/setting/id/'+insertedID, testPUT, 'put')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;

                should.exist(data);

                done();
            });
    });

    it('should successfully GET all rows', function(done) {
        api('/setting')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;

                should.exist(data);

                _.each(data, function(item) {
                    should.exist(item.name);
                    should.exist(item.description);
                    should.exist(item.template);
                    should.exist(item.popularity);
                    should.exist(item.created);
                });

                done();
            });
    });

    it('should successfully GET latest row', function(done) {
        api('/setting/id/'+insertedID)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success[0];

                should.exist(data);

                expect(data.id).to.equal(insertedID);
                expect(data.name).to.equal(testPUT.name);
                expect(data.description).to.equal(testPUT.description);
                expect(data.template).to.equal(testPUT.template);
                expect(data.popularity).to.equal(testPUT.popularity);
                should.exist(data.created);

                done();
            });
    })

});