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
  shop,
  shipping,
  category,
  token;

/**
 * Order routes tests
 */
describe('Save Order clear Cart', function () {

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

  it('save Order Clear Cart', function (done) {
    var cart = new Cart({
      items: [{
        product: product,
        qty: 1,
        amount: 100,
        discount: 20,
        totalamount: 80
      }],
      amount: 100,
      discount: 20,
      totalamount: 80,
      user: user
    });
    cart.save();
    agent.get('/api/carts')
      // .set('authorization', 'Bearer ' + token)
      .end(function (orderErr, orderRes) {
        // Handle signin error
        if (orderErr) {
          return done(orderErr);
        }
        var ord = orderRes.body;
        (ord.length).should.match(1);
        (ord[0].user._id).should.match(user.id);
        agent.post('/api/orders')
          .set('authorization', 'Bearer ' + token)
          .send(order)
          .expect(200)
          .end(function (orderErr, orderRes) {
            // Handle signin error
            if (orderErr) {
              return done(orderErr);
            }
            agent.get('/api/carts')
              // .set('authorization', 'Bearer ' + token)
              .end(function (order2Err, order2Res) {
                // Handle signin error
                if (order2Err) {
                  return done(order2Err);
                }
                var ord2 = order2Res.body;
                (ord2.length).should.match(0);
                done();
              });
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
