var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    person_id: 1,
    wound_id: 1,
    aid: r.rBOOL(),
    heal: r.rBOOL()
};

var testPUT = {
    person_id: 1,
    wound_id: 1,
    aid: r.rBOOL(),
    heal: r.rBOOL()
};

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.name);
        should.exist(item.lethal);
        should.exist(item.aid);
        should.exist(item.heal);
    });
};

describe('Person has Wound', function() {

    it('should successfully POST new row', function(done) {
        api('/person-wound', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully PUT existing row', function(done) {
        api('/person-wound', testPUT, 'put')
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for person', function(done) {
        api('/person-wound/id/' + testPOST.person_id)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});