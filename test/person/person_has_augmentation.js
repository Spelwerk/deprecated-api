var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    person_id: 1,
    augmentation_id: 1,
    augmentationquality_id: 1
};

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.name);
        should.exist(item.description);
        should.exist(item.price);
        should.exist(item.energy);
        should.exist(item.legal);
        should.exist(item.bionic_id);
        should.exist(item.bionic_name);
        should.exist(item.attribute_id);
        should.exist(item.attribute_name);
        should.exist(item.attribute_description);
        should.exist(item.attribute_value);
        should.exist(item.weapon_id);
        should.exist(item.weapon_name);
        should.exist(item.quality_id);
        should.exist(item.quality_name);
        should.exist(item.quality_price);
        should.exist(item.quality_energy);
    });
};

describe('Setting has Augmentation', function() {

    it('should successfully POST new row', function(done) {
        api('/person-augmentation', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for person and bionic', function(done) {
        api('/person-augmentation/id/' + testPOST.person_id + '/bionic/1')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});