var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    setting_id: 1,
    milestone_id: 1
};

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.name);
        should.exist(item.description);
        should.exist(item.upbringing);
        should.exist(item.caste_id);
        should.exist(item.caste_name);
        should.exist(item.manifestation_id);
        should.exist(item.manifestation_name);
        should.exist(item.attribute_id);
        should.exist(item.attribute_name);
        should.exist(item.attribute_value);
        should.exist(item.loyalty_id);
        should.exist(item.loyalty_name);
        should.exist(item.created);
        expect(item.deleted).to.be.a('null');
    });
};

describe('Setting has Milestone', function() {

    it('should successfully POST new row', function(done) {
        api('/setting-milestone', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for setting', function(done) {
        api('/setting-milestone/id/' + testPOST.setting_id)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for setting, upbringing, caste, and manifestation', function(done) {
        api('/setting-milestone/id/' + testPOST.setting_id + '/upbringing/1/caste/1/manifestation/1')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});