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

        if(type == 'token') {
            request = request
                .get(path);
        }

    } else {
        request = request
            .get(path);
    }

    if(type == 'token') {
        request
            .set({
                'Accept' : 'application/x-www-form-urlencoded',
                'apikey' : testdata.keys.api,
                'Authorization' : data
            });
    }

    request
        .set({
            'Accept' : 'application/x-www-form-urlencoded',
            'apikey' : testdata.keys.api
        });

    return request;
};