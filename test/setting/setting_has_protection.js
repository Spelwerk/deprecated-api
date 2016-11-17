var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    setting_id: 1,
    protection_id: 1
};

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.name);
        should.exist(item.description);
        should.exist(item.price);
        should.exist(item.protectiontype_id);
        should.exist(item.protectiontype_name);
        should.exist(item.attribute_id);
        should.exist(item.attribute_name);
        should.exist(item.attribute_value);
        should.exist(item.bodypart_id);
        should.exist(item.bodypart_name);
        should.exist(item.created);
        expect(item.deleted).to.be.a('null');
    });
};

describe('Setting has Protection', function() {

    it('should successfully POST new row', function(done) {
        api('/world-protection', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for world', function(done) {
        api('/world-protection/id/' + testPOST.setting_id)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});