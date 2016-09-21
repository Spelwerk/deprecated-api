var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    person_id: 1,
    attribute_id: 1,
    value: r.rINT(1,16)
};

var testPUT = {
    person_id: 1,
    attribute_id: 1,
    value: r.rINT(1,16)
};

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.name);
        should.exist(item.value);
        should.exist(item.description);
        should.exist(item.protected);
        should.exist(item.maximum);
        should.exist(item.attributetype_id);
        should.exist(item.attributetype_name);
        should.exist(item.manifestation_id);
        should.exist(item.manifestation_name);
    });
};

describe('Person has Attribute', function() {

    it('should successfully POST new row', function(done) {
        api('/person-attribute', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully PUT existing row', function(done) {
        api('/person-attribute', testPUT, 'put')
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for person with type filter', function(done) {
        api('/person-attribute/id/' + testPOST.person_id + '/type/1')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});