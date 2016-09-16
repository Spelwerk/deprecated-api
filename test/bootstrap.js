var testdata = require('./testdata'),
    random = require('./random'),
    supertest = require('supertest');

module.exports = function(path, data, type) {
    data = data || null;

    request = supertest(testdata.server.url);

    if(data) {
        type = type || 'post';

        if(type == 'post') {
            request = request
                .post(path)
                .send(data);
        }

        if(type == 'put') {
            request = request
                .put(path)
                .send(data);
        }

    } else {

        request = request
            .get(path);

    }

    request
        .set({
            'Accept' : 'application/x-www-form-urlencoded',
            'debug' : testdata.keys.debug
        })
        .auth(testdata.keys.user,testdata.keys.pass);

    return request;

};