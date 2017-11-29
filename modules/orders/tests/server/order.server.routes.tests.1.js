'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Order = mongoose.model('Order'),
  Address = mongoose.model('Address'),
  Product = mongoose.model('Product'),
  Shop = mongoose.model('Shop'),
  Shipping = mongoose.model('Shipping'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  address,
  order,
  product,
  shop,
  shipping,
  token;

/**
 * Order routes tests
 */
describe('Order CRUD tests with Token Base Authen', function () {

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

    shipping = new Shipping([
      {
        shipping: {
          detail: 'วันอังคาร, 1 - วัน อังคาร, 2 ส.ค. 2017 ฟรี',
          name: 'ส่งแบบส่งด่วน',
          price: 0,
          duedate: 2
        }
      },
      {
        shipping: {
          detail: 'วันอังคาร, 1 - วัน อังคาร, 2 ส.ค. 2017 ฟรี',
          name: 'ส่งแบบธรรมดา',
          price: 0,
          duedate: 2
        }
      }
    ]);

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
      user: user
    });

    address = new Address({
      address: '90',
      district: 'ลำลูกกา',
      postcode: '12150',
      province: 'ปทุมธานี',
      subdistrict: 'ลำลูกกา',
      firstname: 'amonrat',
      lastname: 'chantawon',
      tel: '0934524524',
      location: {
        lat: '222',
        lng: '333'
      }
    });
    product = new Product([
      {
        product: {
          _id: '1',
          name: 'Crossfit WorldWide Event',
          image: 'https://images-eu.ssl-images-amazon.com/images/G/02/AMAZON-FASHION/2016/SHOES/SPORT/MISC/Nikemobilefootball',
          price: 20000,
          promotionprice: 18000,
          percentofdiscount: 10,
          currency: 'THB',
          shop: shop,
          shippings: [shipping]
        },
        qty: 1,
        amount: 20000,
        discount: 2000,
        deliveryprice: 0,
        totalamount: 18000,
        delivery: {
          detail: 'วันอังคาร, 1 - วัน อังคาร, 2 ส.ค. 2017 ฟรี',
          name: 'ส่งแบบส่งด่วน',
          price: 0
        }
      },
    ]);

    token = '';

    // Save a user to the test db and create new Product
    user.save(function () {
      address.save(function () {
        shipping.save(function () {
          shop.save(function () {
            product.save(function () {
              order = {
                shipping: address,
                items: [
                  {
                    product: product[0],
                    qty: 1,
                    delivery: {
                      detail: "วันอังคาร, 1 - วัน อังคาร, 2 ส.ค. 2017 ฟรี",
                      name: "ส่งแบบส่งด่วน",
                      price: 0
                    },
                    amount: 20000,
                    discount: 2000,
                    deliveryprice: 0,
                    totalamount: 18000,
                  }
                ],
                amount: 30000,
                discount: 2000,
                totalamount: 28000,
                deliveryprice: 0,
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
  });

  it('should be have Token logged in', function (done) {
    token.should.not.be.empty();
    done();
  });

  it('should be able to save a Order if logged in with token', function (done) {
    // Save a new Order
    agent.post('/api/orders')
      .set('authorization', 'Bearer ' + token)
      .send(order)
      .expect(200)
      .end(function (orderSaveErr, orderSaveRes) {
        // Handle Order save error
        if (orderSaveErr) {
          return done(orderSaveErr);
        }
        (orderSaveRes.body.items.length).should.match(1);
        (orderSaveRes.body.location.lat).should.match(address.location.lat);
        (orderSaveRes.body.location.lng).should.match(address.location.lng);


        // Get a list of Orders
        agent.get('/api/orders')
          .end(function (ordersGetErr, ordersGetRes) {
            // Handle Orders save error
            if (ordersGetErr) {
              return done(ordersGetErr);
            }

            // Get Orders list
            var orders = ordersGetRes.body;

            // Set assertions
            //(Orders[0].user.loginToken).should.equal(token);
            (orders[0].items[0].totalamount).should.match(order.items[0].totalamount);

            // Call the assertion callback
            done();
          });
      });
  });
  it('should be able to update a Order if logged in with token', function (done) {
    // Save a new Order
    agent.post('/api/orders')
      .set('authorization', 'Bearer ' + token)
      .send(order)
      .expect(200)
      .end(function (orderSaveErr, orderSaveRes) {
        // Handle Order save error
        if (orderSaveErr) {
          return done(orderSaveErr);
        }

        order.discount = 80;
        agent.put('/api/orders/' + orderSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(order)
          .expect(200)
          .end(function (orderUpdateErr, orderUpdateRes) {
            // Handle Order save error
            if (orderUpdateErr) {
              return done(orderUpdateErr);
            }

            // Get a list of Orders
            agent.get('/api/orders')
              .end(function (ordersGetErr, ordersGetRes) {
                // Handle Orders save error
                if (ordersGetErr) {
                  return done(ordersGetErr);
                }

                // Get Orders list
                var orders = ordersGetRes.body;

                // Set assertions
                //(orders[0].user.loginToken).should.equal(token);
                (orders[0].discount).should.equal(80);

                // Call the assertion callback
                done();
              });
          });
      });
  });
  it('should be able to delete a Order if logged in with token', function (done) {
    // Save a new Order
    agent.post('/api/orders')
      .set('authorization', 'Bearer ' + token)
      .send(order)
      .expect(200)
      .end(function (orderSaveErr, orderSaveRes) {
        // Handle Order save error
        if (orderSaveErr) {
          return done(orderSaveErr);
        }

        agent.delete('/api/orders/' + orderSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(order)
          .expect(200)
          .end(function (orderUpdateErr, orderUpdateRes) {
            // Handle Order save error
            if (orderUpdateErr) {
              return done(orderUpdateErr);
            }
            // Get a list of Orders
            agent.get('/api/orders')
              .end(function (ordersGetErr, ordersGetRes) {
                // Handle Orders save error
                if (ordersGetErr) {
                  return done(ordersGetErr);
                }

                // Get Orders list
                var orders = ordersGetRes.body;

                // Set assertions
                (orders.length).should.match(0);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get List a Order if logged in with token', function (done) {
    // Save a new Order
    agent.post('/api/orders')
      .set('authorization', 'Bearer ' + token)
      .send(order)
      .expect(200)
      .end(function (orderSaveErr, orderSaveRes) {
        // Handle Order save error
        if (orderSaveErr) {
          return done(orderSaveErr);
        }

        // Get a list of Orders
        agent.get('/api/orders')
          .end(function (ordersGetErr, ordersGetRes) {
            // Handle Orders save error
            if (ordersGetErr) {
              return done(ordersGetErr);
            }

            // Get Orders list
            var orders = ordersGetRes.body;

            // Set assertions
            (orders.length).should.match(1);
            (orders[0].items.length).should.match(1);
            (orders[0].items[0].totalamount).should.match(18000);
            done();
          });
      });
  });
  it('should be able to get By ID a Order if logged in with token', function (done) {
    // Save a new Order
    agent.post('/api/orders')
      .set('authorization', 'Bearer ' + token)
      .send(order)
      .expect(200)
      .end(function (orderSaveErr, orderSaveRes) {
        // Handle Order save error
        if (orderSaveErr) {
          return done(orderSaveErr);
        }

        var orderObj = orderSaveRes.body;
        agent.get('/api/orders/' + orderObj._id)
          .send(order)
          .expect(200)
          .end(function (orderGetErr, orderGetRes) {
            // Handle Order save error
            if (orderGetErr) {
              return done(orderGetErr);
            }
            // Get Order list
            var order = orderGetRes.body;

            // Set assertions
            (order.totalamount).should.match(orderObj.totalamount);

            done();
          });
      });
  });


  afterEach(function (done) {
    User.remove().exec(function () {
      Address.remove().exec(function () {
        Shop.remove().exec(function () {
          Shipping.remove().exec(function () {
            Product.remove().exec(function () {
              Order.remove().exec(done);
            });
          });
        });
      });
    });
  });
});
