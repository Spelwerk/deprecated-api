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
    popularity: r.rINT(1,40),
    supernatural: r.rBOOL(),
    supernatural_name: r.rHEX(24),
    augmentation: r.rBOOL()
};

var testPUT = {
    name: r.rHEX(24),
    description: r.rHEX(64),
    template: r.rBOOL(),
    popularity: r.rINT(1,40),
    supernatural: r.rBOOL(),
    supernatural_name: r.rHEX(24),
    augmentation: r.rBOOL()
};

var insertedID;

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.name);
        should.exist(item.description);
        should.exist(item.template);
        should.exist(item.popularity);
        should.exist(item.supernatural);
        should.exist(item.supernatural_name);
        should.exist(item.augmentation);
        should.exist(item.created);
    });
};

describe('Setting', function() {

    it('should successfully POST new row', function(done) {
        api('/world', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                insertedID = response.body.id;

                done();
            });
    });

    it('should successfully PUT new row', function(done) {
        api('/world/id/' + insertedID, testPUT, 'put')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows', function(done) {
        api('/world')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

    it('should successfully GET latest row', function(done) {
        api('/world/id/' + insertedID)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});