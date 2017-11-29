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
  Category = mongoose.model('Category'),
  Cart = mongoose.model('Cart'),
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
  product2,
  shop,
  shipping,
  category,
  category2,
  token;

/**
 * Order routes tests
 */
describe('home seller', function () {

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

    category = new Category({
      name: 'แฟชั่น'
    });

    category2 = new Category({
      name: 'แฟชั่น2'
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

    product2 = new Product({
      name: 'Product name2',
      detail: 'Product detail2',
      price: 100,
      promotionprice: 80,
      percentofdiscount: 20,
      currency: 'Product currency2',
      images: ['Product images2'],
      shippings: [shipping],
      categories: [category2],
      cod: false,
      shop: shop,
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

    // Save a user to the test db and create new Product
    user.save(function () {
      address.save(function () {
        shipping.save(function () {
          shop.save(function () {
            category.save(function () {
              category2.save(function () {
                product.save(function () {
                  product2.save(function () {
                    order = {
                      shipping: address,
                      items: [{
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
                      }, {
                        product: product2,
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
                      }],
                      status: 'complete',
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
      });
    });
  });

  it('should be have Token logged in', function (done) {
    token.should.not.be.empty();
    done();
  });

  it('home seller', function (done) {
    var orderObj1 = new Order(order);
    orderObj1.items[0].status = 'complete';
    orderObj1.items[1].status = 'complete';
    var orderObj2 = new Order(order);
    orderObj2.items[0].status = 'complete';
    orderObj2.items[1].status = 'complete';
    var orderObj3 = new Order(order);
    orderObj3.created = new Date('2017', '9', '22');

    orderObj2.status = 'confirm';
    orderObj1.save();
    orderObj2.save();
    orderObj3.save();
    agent.get('/api/homeseller/' + shop.id)
      .set('authorization', 'Bearer ' + token)
      .end(function (homeGetErr, homeGetRes) {
        // Handle Home save error
        if (homeGetErr) {
          return done(homeGetErr);
        }
        // Get Home list
        var home = homeGetRes.body;

        // Set assertions
        (home.items.day.amount).should.match(36000);
        (home.items.month.amount).should.match(36000);
        (home.items.year.amount).should.match(36000);
        (home.items.categories.length).should.match(2);
        (home.items.categories[0].cate).should.match(category.name);
        (home.items.categories[1].cate).should.match(category2.name);

        (home.report.length).should.match(4);

        done();
      });
  });

  it('check token expire not expire', function (done) {
    agent.get('/api/checkexpireuser')
      .set('authorization', 'Bearer ' + token)
      .end(function (tokenGetErr, tokenGetRes) {
        // Handle Home save error
        if (tokenGetErr) {
          return done(tokenGetErr);
        }
        // Get Home list
        var home = tokenGetRes.body;
        (home.firstName).should.match(user.firstName);
        // Set assertions

        done();
      });
  });

  it('check token expire', function (done) {
    var oldToken = token;
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
        agent.get('/api/checkexpireuser')
          .set('authorization', 'Bearer ' + oldToken)
          .expect(401)
          .end(function (tokenGetErr, tokenGetRes) {
            // Handle Home save error
            if (tokenGetErr) {
              return done(tokenGetErr);
            }
            (tokenGetRes.body.message).should.match('Token is incorrect or has expired. Please login again');

            // Handle Category error error

            done(tokenGetErr);
          });
      });

  });


  afterEach(function (done) {
    User.remove().exec(function () {
      Address.remove().exec(function () {
        Shop.remove().exec(function () {
          Shipping.remove().exec(function () {
            Category.remove().exec(function () {
              Product.remove().exec(function () {
                Order.remove().exec(done);
              });
            });
          });
        });
      });
    });
  });
});
