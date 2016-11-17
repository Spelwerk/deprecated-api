var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    setting_id: 1,
    software_id: 1
};

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.name);
        should.exist(item.description);
        should.exist(item.price);
        should.exist(item.hacking);
        should.exist(item.hacking_bonus);
        should.exist(item.legal);
        should.exist(item.created);
        expect(item.deleted).to.be.a('null');
    });
};

describe('Setting has Software', function() {

    it('should successfully POST new row', function(done) {
        api('/world-software', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for world', function(done) {
        api('/world-software/id/' + testPOST.setting_id)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});