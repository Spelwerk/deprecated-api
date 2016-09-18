var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    setting_id: 1,
    attribute_id: 1
};

var testPUT = {
    setting_id: 1,
    attribute_id: 1
};

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.name);
        should.exist(item.description);
        should.exist(item.protected);
        should.exist(item.maximum);
        should.exist(item.attributetype_id);
        should.exist(item.attributetype_name);
        should.exist(item.manifestation_id);
        should.exist(item.manifestation_name);
        should.exist(item.created);
        expect(item.deleted).to.be.a('null');
    });
};

describe('Setting has Attribute', function() {

    it('should successfully POST new row', function(done) {
        api('/setting-attribute', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully PUT new row', function(done) {
        api('/setting-attribute', testPUT, 'put')
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for setting', function(done) {
        api('/setting-attribute/id/'+testPUT.setting_id)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for setting, type, and manifestation', function(done) {
        api('/setting-attribute/id/' + testPUT.setting_id + '/type/1/manifestation/1')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});