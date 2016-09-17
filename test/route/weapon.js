var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    name: r.rHEX(24),
    description: r.rHEX(64),
    price: r.rINT(1,40),
    hidden: r.rBOOL(),
    legal: r.rBOOL(),
    weapontype_id: 1
};

var testPUT = {
    name: r.rHEX(24),
    description: r.rHEX(64),
    price: r.rINT(1,40),
    hidden: r.rBOOL(),
    legal: r.rBOOL(),
    weapontype_id: 1
};

var insertedID;

describe('Weapon', function() {

    it('should successfully POST new row', function(done) {
        api('/weapon', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;
                insertedID = response.body.id;

                should.exist(data);

                done();
            });
    });

    it('should successfully PUT new row', function(done) {
        api('/weapon/id/'+insertedID, testPUT, 'put')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;

                should.exist(data);

                done();
            });
    });

    it('should successfully GET all rows', function(done) {
        api('/weapon')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;

                should.exist(data);

                _.each(data, function(item) {
                    should.exist(item.name);
                    should.exist(item.description);
                    should.exist(item.price);
                    should.exist(item.hidden);
                    should.exist(item.legal);
                    should.exist(item.weapontype_id);
                    should.exist(item.weapontype_name);
                    should.exist(item.weapongroup_id);
                    should.exist(item.weapongroup_name);
                    should.exist(item.created);
                });

                done();
            });
    });

    it('should successfully GET latest row', function(done) {
        api('/weapon/id/'+insertedID)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success[0];

                should.exist(data);

                expect(data.id).to.equal(insertedID);
                expect(data.name).to.equal(testPUT.name);
                expect(data.description).to.equal(testPUT.description);
                expect(data.price).to.equal(testPUT.price);
                expect(data.hidden).to.equal(testPUT.hidden);
                expect(data.legal).to.equal(testPUT.legal);
                expect(data.weapontype_id).to.equal(testPUT.weapontype_id);
                should.exist(data.weapontype_name);
                should.exist(data.weapongroup_id);
                should.exist(data.weapongroup_name);
                should.exist(data.created);

                done();
            });
    })

});