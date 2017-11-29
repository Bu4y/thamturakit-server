'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Shop = mongoose.model('Shop'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  token,
  shop;

/**
 * Shop routes tests
 */
describe('Shop CRUD token tests', function () {

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

    // Save a user to the test db and create new Shop
    user.save(function () {
      shop = {
        name: 'Shop Name',
        detail: 'Shop Detail',
        email: 'Shop Email',
        image: 'https://www.onsite.org/assets/images/teaser/online-e-shop.jpg',
        tel: '097654321',
        map: {
          lat: '13.933954',
          long: '100.7157976'
        },
        user: user
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

  it('should be able to save a Shop if logged in with token', function (done) {
    // Save a new Product
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle Product save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }

        // Get a list of Products
        agent.get('/api/shops')
          .end(function (shopsGetErr, shopsGetRes) {
            // Handle Products save error
            if (shopsGetErr) {
              return done(shopsGetErr);
            }

            // Get Products list
            var shops = shopsGetRes.body.items;

            // Set assertions
            //(products[0].user.loginToken).should.equal(token);
            (shops[0].name).should.match(shop.name);


            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to get List a Shop if logged in with token', function (done) {
    // Save a new Product
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle Product save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }

        // Get a list of shops
        agent.get('/api/shops')
          .end(function (shopsGetErr, shopsGetRes) {
            // Handle shop save error
            if (shopsGetErr) {
              return done(shopsGetErr);
            }

            // Get shops list
            var shops = shopsGetRes.body.items;

            // Set assertions
            //(products[0].user.loginToken).should.equal(token);
            (shops.length).should.match(1);
            (shops[0]._id).should.match(shopSaveRes.body._id);
            (shops[0].name).should.match(shop.name);
            (shops[0].image).should.match(shop.image);
            (shops[0].rate).should.match(5);


            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to get By ID a Shop if logged in with token', function (done) {
    // Save a new Shop
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }
        agent.get('/api/shops/' + shopSaveRes.body._id)
          // .send(shop)
          // .expect(200)
          .end(function (shopGetErr, shopsGetRes) {
            // Handle shop save error
            if (shopGetErr) {
              return done(shopGetErr);
            }
            // Get shop list
            var shops = shopsGetRes.body;

            // Set assertions
            //(products[0].user.loginToken).should.equal(token);
            shops.should.be.instanceof(Object).and.have.property('name', shop.name);
            shops.should.be.instanceof(Object).and.have.property('detail', shop.detail);
            shops.should.be.instanceof(Object).and.have.property('image', shop.image);
            shops.should.be.instanceof(Object).and.have.property('email', shop.email);
            shops.should.be.instanceof(Object).and.have.property('tel', shop.tel);
            // shops.should.be.instanceof(Object).and.have.property('rate', 5);
            shops.should.be.instanceof(Object).and.have.property('map', shop.map).and.have.property('lat', shop.map.lat);
            shops.should.be.instanceof(Object).and.have.property('map', shop.map).and.have.property('long', shop.map.long);
            // shops.products.should.be.instanceof(Array).and.have.lengthOf(0);
            shops.reviews.should.be.instanceof(Array).and.have.lengthOf(0);
            shops.rate.should.match(5);
            done();
          });
      });
  });

  it('should be able to update a Shop if logged in with token', function (done) {
    // Save a new shops
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }

        shop.name = "test Shop";
        agent.put('/api/shops/' + shopSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(shop)
          .expect(200)
          .end(function (shopUpdateErr, shopUpdateRes) {
            // Handle shop save error
            if (shopUpdateErr) {
              return done(shopUpdateErr);
            }
            // Get a list of shop
            agent.get('/api/shops')
              .end(function (shopsGetErr, shopsGetRes) {
                // Handle shop save error
                if (shopsGetErr) {
                  return done(shopsGetErr);
                }

                // Get shop list
                var shops = shopsGetRes.body.items;

                // Set assertions
                //(products[0].user.loginToken).should.equal(token);
                (shops[0].name).should.match('test Shop');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to delete a Shop if logged in with token', function (done) {
    // Save a new shop
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }

        agent.delete('/api/shops/' + shopSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(shop)
          .expect(200)
          .end(function (shopUpdateErr, shopUpdateRes) {
            // Handle shop save error
            if (shopUpdateErr) {
              return done(shopUpdateErr);
            }
            // Get a list of shop
            agent.get('/api/shops')
              .end(function (shopsGetErr, shopsGetRes) {
                // Handle shop save error
                if (shopsGetErr) {
                  return done(shopsGetErr);
                }

                // Get shop list
                var shops = shopsGetRes.body.items;

                // Set assertions
                //(products[0].user.loginToken).should.equal(token);
                (shops.length).should.match(0);

                // Call the assertion callback
                done();
              });
          });
      });
  });


  it('update shop review', function (done) {
    // Save a new shop
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }

        var review = {
          topic: 'review topic',
          comment: 'comment',
          rate: 5
        };

        agent.put('/api/shops/review/' + shopSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(review)
          .expect(200)
          .end(function (shopUpdateErr, shopUpdateRes) {
            // Handle shop save error
            if (shopUpdateErr) {
              return done(shopUpdateErr);
            }
            // Get a list of shop
            agent.get('/api/shops/' + shopSaveRes.body._id)
              // .send(shop)
              // .expect(200)
              .end(function (shopGetErr, shopsGetRes) {
                // Handle shop save error
                if (shopGetErr) {
                  return done(shopGetErr);
                }
                // Get shop list
                var shops = shopsGetRes.body;

                // Set assertions
                //(products[0].user.loginToken).should.equal(token);
                shops.should.be.instanceof(Object).and.have.property('name', shop.name);
                shops.should.be.instanceof(Object).and.have.property('detail', shop.detail);
                shops.should.be.instanceof(Object).and.have.property('image', shop.image);
                shops.should.be.instanceof(Object).and.have.property('email', shop.email);
                shops.should.be.instanceof(Object).and.have.property('tel', shop.tel);
                // shops.should.be.instanceof(Object).and.have.property('rate', 5);
                shops.should.be.instanceof(Object).and.have.property('map', shop.map).and.have.property('lat', shop.map.lat);
                shops.should.be.instanceof(Object).and.have.property('map', shop.map).and.have.property('long', shop.map.long);
                // shops.products.should.be.instanceof(Array).and.have.lengthOf(0);
                shops.reviews.should.be.instanceof(Array).and.have.lengthOf(1);
                shops.reviews[0].should.be.instanceof(Object).and.have.property('topic', review.topic);
                shops.reviews[0].should.be.instanceof(Object).and.have.property('comment', review.comment);
                shops.reviews[0].should.be.instanceof(Object).and.have.property('rate', review.rate);
                shops.reviews[0].should.be.instanceof(Object).and.have.property('user', user.id);



                done();
              });
          });
      });

  });

  it('should be able to get List a Shop by user if logged in with token', function (done) {

    var ShopObj = new Shop(shop);
    var ShopObj2 = new Shop(shop);
    ShopObj2.user = null;
    ShopObj2.save();
    ShopObj.save();
    // Get a list of shops
    agent.get('/api/shopbyuser')
      .set('authorization', 'Bearer ' + token)
      .end(function (shopsGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopsGetErr) {
          return done(shopsGetErr);
        }

        // Get shops list
        var shops = shopsGetRes.body;

        // Set assertions
        //(products[0].user.loginToken).should.equal(token);
        (shops.length).should.match(1);

        // Call the assertion callback
        done();
      });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Shop.remove().exec(done);
    });
  });
});
