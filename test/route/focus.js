var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    name: r.rHEX(24),
    description: r.rHEX(32),
    give_attribute_id: r.rINT(1,5)
};

var testPUT = {
    name: r.rHEX(24),
    description: r.rHEX(32),
    give_attribute_id: r.rINT(1,5)
};

describe('Focus', function() {

    it('should successfully POST new row', function(done) {
        api('/focus', testPOST)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);

                should.exist(response.body.success);

                done();
        });
    });

    it('should successfully PUT new row', function(done) {
        api('/focus', testPUT, 'put')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);

                should.exist(response.body.success);

                done();
            });
    });

});