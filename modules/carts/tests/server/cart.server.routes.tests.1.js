'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Cart = mongoose.model('Cart'),
  Product = mongoose.model('Product'),
  Shipping = mongoose.model('Shipping'),
  Shop = mongoose.model('Shop'),
  Category = mongoose.model('Category'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  cart,
  product,
  shipping,
  shop,
  token,
  category;

/**
 * Cart routes tests
 */
describe('Cart CRUD tests', function () {

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

    category = new Category({
      name: 'แฟชั่น'
    });

    shipping = new Shipping({
      name: 'ส่งแบบส่งด่วน',
      detail: 'วันอังคาร, 1 - วัน อังคาร, 2 ส.ค. 2017 ฟรี',
      price: 0,
      duedate: 3
    });

    shop = new Shop({
      name: 'Shop Name',
      detail: 'Shop Detail',
      email: 'Shop Email',
      image: 'https://www.onsite.org/assets/images/teaser/online-e-shop.jpg',
      tel: '097654321',
      map: {
        lat: '13.933954',
        long: '100.7157976'
      },
    });

    product = new Product({
      name: 'Product name',
      detail: 'Product detail',
      price: 100,
      promotionprice: 80,
      percentofdiscount: 20,
      currency: 'Product currency',
      images: ['Product images'],
      shippings: [shipping],
      categories: [category],
      cod: false,
      shop: shop,
    });

    // Save a user to the test db and create new Cart
    user.save(function () {
      shipping.save(function () {
        shop.save(function () {
          product.save(function () {
            cart = {
              items: [{
                product: product,
                qty: 1,
                amount: 100,
                discount: 20,
                totalamount: 80
              }],
              amount: 100,
              discount: 20,
              totalamount: 80
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
      });
    });
  });

  it('should be have Token logged in', function (done) {
    token.should.not.be.empty();
    done();
  });

  it('should be able to save a Cart if logged in with token', function (done) {
    // Save a new Cart
    agent.post('/api/carts')
      .set('authorization', 'Bearer ' + token)
      .send(cart)
      .expect(200)
      .end(function (cartSaveErr, cartSaveRes) {
        // Handle Cart save error
        if (cartSaveErr) {
          return done(cartSaveErr);
        }

        // Get a list of Carts
        agent.get('/api/carts')
          .end(function (cartsGetErr, cartsGetRes) {
            // Handle Carts save error
            if (cartsGetErr) {
              return done(cartsGetErr);
            }

            // Get Carts list
            var carts = cartsGetRes.body;

            // Set assertions

            (carts[0].items.length).should.match(1);

            // Call the assertion callback
            done();
          });
      });
  });


  it('should be able to update a Cart if logged in with token', function (done) {
    // Save a new Cart
    agent.post('/api/carts')
      .set('authorization', 'Bearer ' + token)
      .send(cart)
      .expect(200)
      .end(function (cartSaveErr, cartSaveRes) {
        // Handle Cart save error
        if (cartSaveErr) {
          return done(cartSaveErr);
        }
        cart.items.push({
          product: product,
          qty: 1,
          amount: 20000,
          discount: 2000,
          totalamount: 18000
        });
        agent.put('/api/carts/' + cartSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(cart)
          .expect(200)
          .end(function (cartUpdateErr, cartUpdateRes) {
            // Handle Cart save error
            if (cartUpdateErr) {
              return done(cartUpdateErr);
            }

            // Get a list of Categories
            agent.get('/api/carts')
              .end(function (cartsGetErr, cartsGetRes) {
                // Handle Carts save error
                if (cartsGetErr) {
                  return done(cartsGetErr);
                }

                // Get Carts list
                var carts = cartsGetRes.body;

                // Set assertions

                (carts[0].items.length).should.match(2);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to delate a Cart if logged in with token', function (done) {
    // Save a new Cart
    agent.post('/api/carts')
      .set('authorization', 'Bearer ' + token)
      .send(cart)
      .expect(200)
      .end(function (cartSaveErr, cartSaveRes) {
        // Handle Cart save error
        if (cartSaveErr) {
          return done(cartSaveErr);
        }
        agent.delete('/api/carts/' + cartSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .end(function (cartDeleteErr, cartDelateRes) {
            // Handle Cart save error
            if (cartDeleteErr) {
              return done(cartDeleteErr);
            }

            // Get a list of Categories
            agent.get('/api/carts')
              .end(function (cartsGetErr, cartsGetRes) {
                // Handle Carts save error
                if (cartsGetErr) {
                  return done(cartsGetErr);
                }

                // Get Carts list
                var carts = cartsGetRes.body;

                // Set assertions

                (carts.length).should.match(0);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to Get List a Cart if logged in with token', function (done) {
    // Save a new Cart
    agent.post('/api/carts')
      .set('authorization', 'Bearer ' + token)
      .send(cart)
      .expect(200)
      .end(function (cartSaveErr, cartSaveRes) {
        // Handle Cart save error
        if (cartSaveErr) {
          return done(cartSaveErr);
        }

        // Get a list of Categories
        agent.get('/api/carts')
          .end(function (cartsGetErr, cartsGetRes) {
            // Handle Carts save error
            if (cartsGetErr) {
              return done(cartsGetErr);
            }

            // Get Carts list
            var carts = cartsGetRes.body;

            // Set assertions

            (carts.length).should.match(1);
            (carts[0].items.length).should.match(1);

            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to get by id a Cart if logged in with token', function (done) {
    // Save a new Cart
    agent.post('/api/carts')
      .set('authorization', 'Bearer ' + token)
      .send(cart)
      .expect(200)
      .end(function (cartSaveErr, cartSaveRes) {
        // Handle Cart save error
        if (cartSaveErr) {
          return done(cartSaveErr);
        }

        // Get a list of Categories
        agent.get('/api/carts/' + cartSaveRes.body._id)
          .end(function (cartsGetErr, cartsGetRes) {
            // Handle Carts save error
            if (cartsGetErr) {
              return done(cartsGetErr);
            }

            // Get Carts list
            var cart = cartsGetRes.body;

            // Set assertions

            // (carts.length).should.match(1);
            (cart.items.length).should.match(1);

            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to get by user id a Cart if logged in with token', function (done) {
    // Save a new Cart
    agent.post('/api/carts')
      .set('authorization', 'Bearer ' + token)
      .send(cart)
      .expect(200)
      .end(function (cartSaveErr, cartSaveRes) {
        // Handle Cart save error
        if (cartSaveErr) {
          return done(cartSaveErr);
        }

        // Get the userId
        var userId = user.id;
        // Get a list of Categories
        agent.get('/api/cartbyuser/' + userId)
          .end(function (cartsGetErr, cartsGetRes) {
            // Handle Carts save error
            if (cartsGetErr) {
              return done(cartsGetErr);
            }

            // Get Carts list
            var cart = cartsGetRes.body;

            // Set assertions

            // (carts.length).should.match(1);
            (cart.items.length).should.match(1);

            // Call the assertion callback
            done();
          });
      });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Shipping.remove().exec(function () {
        Shop.remove().exec(function () {
          Product.remove().exec(function () {
            Cart.remove().exec(done);
          });
        });
      });
    });
  });
});
