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
describe('Get Order By user', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username2',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'tes2t@tes2t.com',
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
      tel: '0934524524'
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
      cod: false,
      shop: shop,
    });

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
                    product: product,
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
                    payment: {
                      paymenttype: 'String',
                      creditno: 'String',
                      creditname: 'String',
                      expdate: 'String',
                      creditcvc: 'String',
                      counterservice: 'String'
                    },
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

  it('get order by user', function (done) {
    var orderObj1 = new Order(order);
    var orderObj2 = new Order({
      shipping: address,
      items: [
        {
          product: product,
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
    });
    orderObj1.user = user;
    orderObj2.status = 'complete';
    orderObj1.save();
    orderObj2.save();
    agent.get('/api/orderbyuser/' + user.id)
      .end(function (orderErr, orderRes) {
        // Handle signin error
        if (orderErr) {
          return done(orderErr);
        }
        var ord = orderRes.body;
        ord.should.be.instanceof(Array).and.have.lengthOf(1);
        done();
      });
  });

  it('get order by id isTranfer true', function (done) {
    var orderObj1 = new Order(order);
    orderObj1.payment.paymenttype = 'Bank Transfer';
    orderObj1.user = user;
    orderObj1.save();
    agent.get('/api/orders/' + orderObj1.id)
      .end(function (orderErr, orderRes) {
        // Handle signin error
        if (orderErr) {
          return done(orderErr);
        }
        var ord = orderRes.body;
        (ord.isTransfer).should.match(true);
        (ord.imageslip).should.match('no image');
        done();
      });
  });

  it('get order by id isTranfer false 1', function (done) {
    var orderObj1 = new Order(order);
    orderObj1.payment.paymenttype = 'Bank Transfer';
    orderObj1.status = 'complete';
    orderObj1.user = user;
    orderObj1.save();
    agent.get('/api/orders/' + orderObj1.id)
      .end(function (orderErr, orderRes) {
        // Handle signin error
        if (orderErr) {
          return done(orderErr);
        }
        var ord = orderRes.body;
        (ord.isTransfer).should.match(false);
        done();
      });
  });

  it('get order by id isTranfer false 2', function (done) {
    var orderObj1 = new Order(order);
    orderObj1.payment.paymenttype = 'Bank Transfer';
    orderObj1.imageslip = 'sdfa';
    orderObj1.status = 'confirm';
    orderObj1.user = user;
    orderObj1.save();
    agent.get('/api/orders/' + orderObj1.id)
      .end(function (orderErr, orderRes) {
        // Handle signin error
        if (orderErr) {
          return done(orderErr);
        }
        var ord = orderRes.body;
        (ord.isTransfer).should.match(false);
        done();
      });
  });

  it('update order upload slip', function (done) {
    var orderObj1 = new Order(order);
    orderObj1.status = 'complete';
    orderObj1.user = user;
    orderObj1.save();
    var data = { image: 'img' };
    agent.put('/api/sliporder/' + orderObj1.id)
      .send(data)
      .expect(200)
      .end(function (orderErr, orderRes) {
        // Handle signin error
        if (orderErr) {
          return done(orderErr);
        }
        var ord = orderRes.body;
        (ord.imageslip).should.match('img');
        done();
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
