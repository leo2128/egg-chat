'use strict';

const mock = require('egg-mock');

describe('test/app/controller/home.test.js', () => {
//   it('should assert', () => {
//     const pkg = require('../../../package.json');
//     assert(app.config.keys.startsWith(pkg.name));

  //     // const ctx = app.mockContext({});
  //     // yield ctx.service.xx();
  //   });

  //   it('should GET /', () => {
  //     return app.httpRequest()
  //       .get('/')
  //       .expect('hi, egg')
  //       .expect(200);
  //   });

  let ass;
  before(() => {
    ass = mock.app();
    return ass.ready();
  });
});
