var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    person_id: 1,
    asset_id: 1,
    amount: r.rINT(1,40)
};

var testPUT = {
    person_id: 1,
    asset_id: 1,
    amount: r.rINT(1,40)
};

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.name);
        should.exist(item.amount);
        should.exist(item.description);
        should.exist(item.price);
        should.exist(item.legal);
        should.exist(item.assettype_id);
        should.exist(item.assettype_name);
        should.exist(item.assetgroup_id);
        should.exist(item.assetgroup_name);
    });
};

describe('Person has Asset', function() {

    it('should successfully POST new row', function(done) {
        api('/person-asset', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully PUT existing row', function(done) {
        api('/person-asset', testPUT, 'put')
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for person', function(done) {
        api('/person-asset/id/' + testPOST.person_id)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});