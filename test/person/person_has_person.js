var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    person_id_1: 1,
    person_id_2: 2,
    loyalty_id: 1,
    hash: r.rHEX(20)
};

var testPUT = {
    person_id_1: 1,
    person_id_2: 2,
    loyalty_id: 1,
    hash: r.rHEX(20)
};

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.hash);
        should.exist(item.name_nick);
        should.exist(item.name_first);
        should.exist(item.name_last);
        should.exist(item.occupation);
        should.exist(item.description);
        should.exist(item.loyalty_id);
        should.exist(item.loyalty_name);
        should.exist(item.loyalty_description);
        should.exist(item.loyalty_value);
    });
};

describe('Person has Person', function() {

    it('should successfully POST new row', function(done) {
        api('/person-person', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully PUT existing row', function(done) {
        api('/person-person', testPUT, 'put')
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for person', function(done) {
        api('/person-person/id/' + testPOST.person_id_1)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});