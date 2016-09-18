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
    energy: r.rINT(1,10),
    legal: r.rBOOL(),
    bionic_id: 1,
    attribute_id: 1,
    attribute_value: r.rINT(1,10),
    weapon_id: 1
};

var testPUT = {
    name: r.rHEX(24),
    description: r.rHEX(64),
    price: r.rINT(1,40),
    energy: r.rINT(1,10),
    legal: r.rBOOL(),
    bionic_id: 1,
    attribute_id: 1,
    attribute_value: r.rINT(1,10),
    weapon_id: 1
};

var insertedID;

describe('Augmentation', function() {

    it('should successfully POST new row', function(done) {
        api('/augmentation', testPOST)
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
        api('/augmentation/id/'+insertedID, testPUT, 'put')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;

                should.exist(data);

                done();
            });
    });

    it('should successfully GET all rows', function(done) {
        api('/augmentation')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success;

                should.exist(data);

                _.each(data, function(item) {
                    should.exist(item.name);
                    should.exist(item.description);
                    should.exist(item.price);
                    should.exist(item.energy);
                    should.exist(item.legal);
                    should.exist(item.bionic_id);
                    should.exist(item.bionic_name);
                    should.exist(item.attribute_id);
                    should.exist(item.attribute_name);
                    should.exist(item.attribute_value);
                    should.exist(item.weapon_id);
                    should.exist(item.weapon_name);
                    should.exist(item.created);
                });

                done();
            });
    });

    it('should successfully GET latest row', function(done) {
        api('/augmentation/id/'+insertedID)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                var data = response.body.success[0];

                should.exist(data);

                expect(data.id).to.equal(insertedID);
                expect(data.name).to.equal(testPUT.name);
                expect(data.description).to.equal(testPUT.description);
                expect(data.price).to.equal(testPUT.price);
                expect(data.energy).to.equal(testPUT.energy);
                expect(data.legal).to.equal(testPUT.legal);
                expect(data.bionic_id).to.equal(testPUT.bionic_id);
                should.exist(data.bionic_name);
                expect(data.attribute_id).to.equal(testPUT.attribute_id);
                should.exist(data.attribute_name);
                expect(data.attribute_value).to.equal(testPUT.attribute_value);
                expect(data.weapon_id).to.equal(testPUT.weapon_id);
                should.exist(data.weapon_name);
                should.exist(data.created);

                done();
            });
    })

});