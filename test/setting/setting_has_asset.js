var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    setting_id: 1,
    asset_id: 1
};

var testPUT = {
    setting_id: 1,
    asset_id: 1
};

describe('Setting has Asset', function() {

    var verifyData = function(data) {
        should.exist(data);

        _.each(data, function(item) {
            should.exist(item.id);
            should.exist(item.name);
            should.exist(item.description);
            should.exist(item.price);
            should.exist(item.legal);
            should.exist(item.assettype_id);
            should.exist(item.assettype_name);
            should.exist(item.assetgroup_id);
            should.exist(item.assetgroup_name);
            should.exist(item.created);
            expect(item.deleted).to.be.a('null');
        });
    };

    it('should successfully POST new row', function(done) {
        api('/setting-asset', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully PUT new row', function(done) {
        api('/setting-asset', testPUT, 'put')
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for setting', function(done) {
        api('/setting-asset/id/'+testPUT.setting_id)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for setting and type', function(done) {
        api('/setting-asset/id/' + testPUT.setting_id + '/type/1')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});