'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Address = mongoose.model('Address'),
  Product = mongoose.model('Product'),
  Shipping = mongoose.model('Shipping'),
  Shop = mongoose.model('Shop'),
  Order = mongoose.model('Order'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  address,
  product,
  shipping,
  shop,
  order;

/**
 * Order routes tests
 */
describe('Order CRUD tests', function () {

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
          price: 0
        }
      },
      {
        shipping: {
          detail: 'วันอังคาร, 1 - วัน อังคาร, 2 ส.ค. 2017 ฟรี',
          name: 'ส่งแบบธรรมดา',
          price: 0
        }
      }
    ]);
    shop = new Shop({
      name: 'Shop name'
    });
    address = new Address({
      address: '90',
      district: 'ลำลูกกา',
      postcode: '12150',
      province: 'ปทุมธานี',
      subdistrict: 'ลำลูกกา',
      firstname: 'amonrat',
      lastname: 'chantawon',
      tel: '0934524524'
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

    // Save a user to the test db and create new Order
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

              done();
            });
          });
        });
      });
    });
  });

  it('should be able to save a Order if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Order
        agent.post('/api/orders')
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
                (orders[0].user._id).should.equal(userId);
                // (orders[0].name).should.match('Order name');
                (orders[0].items.length).should.match(1);
                (orders[0].items[0].qty).should.match(1);
                (orders[0].items[0].amount).should.match(20000);
                (orders[0].items[0].delivery.detail).should.match('วันอังคาร, 1 - วัน อังคาร, 2 ส.ค. 2017 ฟรี');
                (orders[0].items[0].delivery.name).should.match('ส่งแบบส่งด่วน');
                (orders[0].items[0].delivery.price).should.match(0);
                (orders[0].items[0].discount).should.match(2000);
                (orders[0].items[0].totalamount).should.match(18000);
                (orders[0].amount).should.match(30000);
                (orders[0].discount).should.match(2000);
                (orders[0].totalamount).should.match(28000);
                (orders[0].deliveryprice).should.match(0);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Order if not logged in', function (done) {
    agent.post('/api/orders')
      .send(order)
      .expect(403)
      .end(function (orderSaveErr, orderSaveRes) {
        // Call the assertion callback
        done(orderSaveErr);
      });
  });

  it('should not be able to save an Order if no items is provided', function (done) {
    // Invalidate name field
    order.items = null;

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Order
        agent.post('/api/orders')
          .send(order)
          .expect(400)
          .end(function (orderSaveErr, orderSaveRes) {
            // Set message assertion
            (orderSaveRes.body.message).should.match('Please fill Order items');

            // Handle Order save error
            done(orderSaveErr);
          });
      });
  });

  it('should be able to update an Order if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Order
        agent.post('/api/orders')
          .send(order)
          .expect(200)
          .end(function (orderSaveErr, orderSaveRes) {
            // Handle Order save error
            if (orderSaveErr) {
              return done(orderSaveErr);
            }

            // Update Order name
            order.totalamount = 1000;

            // Update an existing Order
            agent.put('/api/orders/' + orderSaveRes.body._id)
              .send(order)
              .expect(200)
              .end(function (orderUpdateErr, orderUpdateRes) {
                // Handle Order update error
                if (orderUpdateErr) {
                  return done(orderUpdateErr);
                }

                // Set assertions
                (orderUpdateRes.body._id).should.equal(orderSaveRes.body._id);
                (orderUpdateRes.body.totalamount).should.match(1000);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Orders if not signed in', function (done) {
    // Create new Order model instance
    var orderObj = new Order(order);

    // Save the order
    orderObj.save(function () {
      // Request Orders
      request(app).get('/api/orders')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Order if not signed in', function (done) {
    // Create new Order model instance
    var orderObj = new Order(order);

    // Save the Order
    orderObj.save(function () {
      request(app).get('/api/orders/' + orderObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('totalamount', order.totalamount);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Order with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/orders/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Order is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Order which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Order
    request(app).get('/api/orders/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Order with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Order if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Order
        agent.post('/api/orders')
          .send(order)
          .expect(200)
          .end(function (orderSaveErr, orderSaveRes) {
            // Handle Order save error
            if (orderSaveErr) {
              return done(orderSaveErr);
            }

            // Delete an existing Order
            agent.delete('/api/orders/' + orderSaveRes.body._id)
              .send(order)
              .expect(200)
              .end(function (orderDeleteErr, orderDeleteRes) {
                // Handle order error error
                if (orderDeleteErr) {
                  return done(orderDeleteErr);
                }

                // Set assertions
                (orderDeleteRes.body._id).should.equal(orderSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Order if not signed in', function (done) {
    // Set Order user
    order.user = user;

    // Create new Order model instance
    var orderObj = new Order(order);

    // Save the Order
    orderObj.save(function () {
      // Try deleting Order
      request(app).delete('/api/orders/' + orderObj._id)
        .expect(403)
        .end(function (orderDeleteErr, orderDeleteRes) {
          // Set message assertion
          (orderDeleteRes.body.message).should.match('User is not authorized');

          // Handle Order error error
          done(orderDeleteErr);
        });

    });
  });

  it('should be able to get a single Order that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Order
          agent.post('/api/orders')
            .send(order)
            .expect(200)
            .end(function (orderSaveErr, orderSaveRes) {
              // Handle Order save error
              if (orderSaveErr) {
                return done(orderSaveErr);
              }

              // Set assertions on new Order
              (orderSaveRes.body.totalamount).should.equal(order.totalamount);
              should.exist(orderSaveRes.body.user);
              should.equal(orderSaveRes.body.user._id, orphanId);

              // force the Order to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Order
                    agent.get('/api/orders/' + orderSaveRes.body._id)
                      .expect(200)
                      .end(function (orderInfoErr, orderInfoRes) {
                        // Handle Order error
                        if (orderInfoErr) {
                          return done(orderInfoErr);
                        }

                        // Set assertions
                        (orderInfoRes.body._id).should.equal(orderSaveRes.body._id);
                        (orderInfoRes.body.totalamount).should.equal(order.totalamount);
                        should.equal(orderInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Address.remove().exec(function () {
        Shipping.remove().exec(function () {
          Shop.remove().exec(function () {
            Product.remove().exec(function () {
              Order.remove().exec(done);
            });
          });
        });
      });
    });
  });
});
