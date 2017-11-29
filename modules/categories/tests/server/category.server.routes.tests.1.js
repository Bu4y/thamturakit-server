'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Category = mongoose.model('Category'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  token,
  category;

/**
 * Category routes tests
 */
describe('Category CRUD token tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Category
    user.save(function () {
      category = {
        name: 'Category name'
      };
      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }
          signinRes.body.loginToken.should.not.be.empty();
          token = signinRes.body.loginToken;
          done();
        });
    });
  });


  it('should be have Token logged in', function (done) {
    token.should.not.be.empty();
    done();
  });

  it('should be able to save a Category if logged in with token', function (done) {
    // Save a new Category
    agent.post('/api/categories')
      .set('authorization', 'Bearer ' + token)
      .send(category)
      .expect(200)
      .end(function (categorySaveErr, categorySaveRes) {
        // Handle Category save error
        if (categorySaveErr) {
          return done(categorySaveErr);
        }

        // Get a list of Categories
        agent.get('/api/categories')
          .end(function (categoriesGetErr, categoriesGetRes) {
            // Handle Categorys save error
            if (categoriesGetErr) {
              return done(categoriesGetErr);
            }

            // Get Categorys list
            var categories = categoriesGetRes.body;

            // Set assertions

            (categories[0].name).should.match('Category name');

            // Call the assertion callback
            done();
          });
      });
  });


  it('should be able to update a Category if logged in with token', function (done) {
    // Save a new Category
    agent.post('/api/categories')
      .set('authorization', 'Bearer ' + token)
      .send(category)
      .expect(200)
      .end(function (categorySaveErr, categorySaveRes) {
        // Handle Category save error
        if (categorySaveErr) {
          return done(categorySaveErr);
        }
        category.name = "mam cate";
        agent.put('/api/categories/' + categorySaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(category)
          .expect(200)
          .end(function (categoryUpdateErr, categoryUpdateRes) {
            // Handle Category save error
            if (categoryUpdateErr) {
              return done(categoryUpdateErr);
            }

            // Get a list of Categories
            agent.get('/api/categories')
              .end(function (categoriesGetErr, categoriesGetRes) {
                // Handle Categorys save error
                if (categoriesGetErr) {
                  return done(categoriesGetErr);
                }

                // Get Categorys list
                var categories = categoriesGetRes.body;

                // Set assertions

                (categories[0].name).should.match('mam cate');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to delate a Category if logged in with token', function (done) {
    // Save a new Category
    agent.post('/api/categories')
      .set('authorization', 'Bearer ' + token)
      .send(category)
      .expect(200)
      .end(function (categorySaveErr, categorySaveRes) {
        // Handle Category save error
        if (categorySaveErr) {
          return done(categorySaveErr);
        }
        agent.delete('/api/categories/' + categorySaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .end(function (categoryDeleteErr, categoryDelateRes) {
            // Handle Category save error
            if (categoryDeleteErr) {
              return done(categoryDeleteErr);
            }

            // Get a list of Categories
            agent.get('/api/categories')
              .end(function (categoriesGetErr, categoriesGetRes) {
                // Handle Categorys save error
                if (categoriesGetErr) {
                  return done(categoriesGetErr);
                }

                // Get Categorys list
                var categories = categoriesGetRes.body;

                // Set assertions

                (categories.length).should.match(0);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to GetList a Category if logged in with token', function (done) {
    // Save a new Category
    agent.post('/api/categories')
      .set('authorization', 'Bearer ' + token)
      .send(category)
      .expect(200)
      .end(function (categorySaveErr, categorySaveRes) {
        // Handle Category save error
        if (categorySaveErr) {
          return done(categorySaveErr);
        }

        // Get a list of Categories
        agent.get('/api/categories')
          .end(function (categoriesGetErr, categoriesGetRes) {
            // Handle Categorys save error
            if (categoriesGetErr) {
              return done(categoriesGetErr);
            }

            // Get Categorys list
            var categories = categoriesGetRes.body;

            // Set assertions

            (categories.length).should.match(1);
            (categories[0].name).should.match('Category name');

            // Call the assertion callback
            done();
          });
      });
  });


  it('should be able to getById a Category if logged in with token', function (done) {
    // Save a new Category
    agent.post('/api/categories')
      .set('authorization', 'Bearer ' + token)
      .send(category)
      .expect(200)
      .end(function (categorySaveErr, categorySaveRes) {
        // Handle Category save error
        if (categorySaveErr) {
          return done(categorySaveErr);
        }

        // Get a list of Categories
        agent.get('/api/categories/' + categorySaveRes.body._id)
          .end(function (categoriesGetErr, categoriesGetRes) {
            // Handle Categorys save error
            if (categoriesGetErr) {
              return done(categoriesGetErr);
            }

            // Get Categorys list
            var category = categoriesGetRes.body;

            // Set assertions

            // (categories.length).should.match(1);
            (category.name).should.match('Category name');

            // Call the assertion callback
            done();
          });
      });
  });



















  afterEach(function (done) {
    User.remove().exec(function () {
      Category.remove().exec(done);
    });
  });
});
