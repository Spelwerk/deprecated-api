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
    damage_d12: r.rINT(1,40),
    damage_bonus: r.rINT(1,40),
    critical_d12: r.rINT(1,40),
    initiative: r.rINT(1,40),
    hit: r.rINT(1,40),
    distance: r.rINT(1,40)
};

var testPUT = {
    name: r.rHEX(24),
    description: r.rHEX(64),
    price: r.rINT(1,40),
    damage_d12: r.rINT(1,40),
    damage_bonus: r.rINT(1,40),
    critical_d12: r.rINT(1,40),
    initiative: r.rINT(1,40),
    hit: r.rINT(1,40),
    distance: r.rINT(1,40)
};

var insertedID;

describe('Weapon Quality', function() {

    it('should successfully POST new row', function(done) {
        api('/weaponquality', testPOST)
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
        api('/weaponquality/id/'+insertedID, testPUT, 'put')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;

                should.exist(data);

                done();
            });
    });

    it('should successfully GET all rows', function(done) {
        api('/weaponquality')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;

                should.exist(data);

                _.each(data, function(item) {
                    should.exist(item.name);
                    should.exist(item.description);
                    should.exist(item.price);
                    should.exist(item.damage_d12);
                    should.exist(item.damage_bonus);
                    should.exist(item.critical_d12);
                    should.exist(item.initiative);
                    should.exist(item.hit);
                    should.exist(item.distance);
                    should.exist(item.created);
                });

                done();
            });
    });

    it('should successfully GET latest row', function(done) {
        api('/weaponquality/id/'+insertedID)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success[0];

                should.exist(data);

                expect(data.id).to.equal(insertedID);
                expect(data.name).to.equal(testPUT.name);
                expect(data.description).to.equal(testPUT.description);
                expect(data.price).to.equal(testPUT.price);
                expect(data.damage_d12).to.equal(testPUT.damage_d12);
                expect(data.damage_bonus).to.equal(testPUT.damage_bonus);
                expect(data.critical_d12).to.equal(testPUT.critical_d12);
                expect(data.initiative).to.equal(testPUT.initiative);
                expect(data.hit).to.equal(testPUT.hit);
                expect(data.distance).to.equal(testPUT.distance);
                should.exist(data.created);

                done();
            });
    })

});