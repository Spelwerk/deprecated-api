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
    price: r.rINT(1,40),
    legal: r.rBOOL(),
    assettype_id: 1
};

var testPUT = {
    name: r.rHEX(24),
    description: r.rHEX(64),
    price: r.rINT(1,40),
    legal: r.rBOOL(),
    assettype_id: 1
};

var insertedID;

describe('Asset', function() {

    it('should successfully POST new row', function(done) {
        api('/asset', testPOST)
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
        api('/asset/id/'+insertedID, testPUT, 'put')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;

                should.exist(data);

                done();
            });
    });

    it('should successfully GET all rows', function(done) {
        api('/asset')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;

                should.exist(data);

                _.each(data, function(item) {
                    should.exist(item.name);
                    should.exist(item.description);
                    should.exist(item.price);
                    should.exist(item.legal);
                    should.exist(item.assettype_id);
                    should.exist(item.assettype_name);
                    should.exist(item.assetgroup_id);
                    should.exist(item.assetgroup_name);
                    should.exist(item.created);
                });

                done();
            });
    });

    it('should successfully GET latest row', function(done) {
        api('/asset/id/'+insertedID)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success[0];

                should.exist(data);

                expect(data.id).to.equal(insertedID);
                expect(data.name).to.equal(testPUT.name);
                expect(data.description).to.equal(testPUT.description);
                expect(data.price).to.equal(testPUT.price);
                expect(data.legal).to.equal(testPUT.legal);
                expect(data.assettype_id).to.equal(testPUT.assettype_id);
                should.exist(data.assettype_name);
                should.exist(data.assetgroup_id);
                should.exist(data.assetgroup_name);
                should.exist(data.created);

                done();
            });
    })

});