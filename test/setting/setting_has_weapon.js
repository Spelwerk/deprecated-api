var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    setting_id: 1,
    weapon_id: 1
};

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.name);
        should.exist(item.price);
        should.exist(item.hidden);
        should.exist(item.legal);
        should.exist(item.weapontype_id);
        should.exist(item.weapontype_name);
        should.exist(item.weapongroup_id);
        should.exist(item.weapongroup_name);
        should.exist(item.damage_d12);
        should.exist(item.damage_bonus);
        should.exist(item.critical_d12);
        should.exist(item.hand);
        should.exist(item.initiative);
        should.exist(item.hit);
        should.exist(item.distance);
        should.exist(item.skill_attribute_id);
        should.exist(item.skill_attribute_name);
        should.exist(item.damage_attribute_id);
        should.exist(item.damage_attribute_name);
        should.exist(item.expertise_id);
        should.exist(item.expertise_name);
        should.exist(item.created);
        expect(item.deleted).to.be.a('null');
    });
};

describe('Setting has Weapon', function() {

    it('should successfully POST new row', function(done) {
        api('/setting-weapon', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for setting', function(done) {
        api('/setting-weapon/id/' + testPOST.setting_id)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for setting and group', function(done) {
        api('/setting-weapon/id/' + testPOST.setting_id + '/group/1')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});