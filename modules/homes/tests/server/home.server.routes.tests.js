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
describe('home', function () {

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
      historylog: [{
        user: user,
        created: new Date()
      }]
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
              product.save(function () {
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
                  }],
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

  it('should be have Token logged in', function (done) {
    token.should.not.be.empty();
    done();
  });

  it('home', function (done) {
    var product1 = new Product({
      name: 'Product name1',
      detail: 'Product detail',
      price: 100,
      promotionprice: 80,
      percentofdiscount: 20,
      currency: 'Product currency',
      images: ['Product images'],
      shippings: [shipping],
      categories: [category],
      historylog: [{
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }],
      cod: false,
      shop: shop,
    });
    var product2 = new Product({
      name: 'Product name2',
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
      historylog: [{
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }]
    });
    var product3 = new Product({
      name: 'Product name3',
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
      historylog: [{
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }]
    });
    var olddate = new Date();
    olddate.setMonth(1);
    var product4 = new Product({
      name: 'Product name4',
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
      historylog: [{
        user: user,
        created: new Date()
      }, {
        user: user,
        created: olddate
      }]
    });

    var shop1 = new Shop({
      name: 'Shop Name',
      detail: 'Shop Detail',
      email: 'Shop Email',
      image: 'https://www.onsite.org/assets/images/teaser/online-e-shop.jpg',
      tel: '097654321',
      map: {
        lat: '13.933954',
        long: '100.7157976'
      }
    });

    var shop2 = new Shop({
      name: 'Shop Name',
      detail: 'Shop Detail',
      email: 'Shop Email',
      image: 'https://www.onsite.org/assets/images/teaser/online-e-shop.jpg',
      tel: '097654321',
      map: {
        lat: '13.933954',
        long: '100.7157976'
      }
    });

    var shop3 = new Shop({
      name: 'Shop Name',
      detail: 'Shop Detail',
      email: 'Shop Email',
      image: 'https://www.onsite.org/assets/images/teaser/online-e-shop.jpg',
      tel: '097654321',
      map: {
        lat: '13.933954',
        long: '100.7157976'
      }
    });

    var shop4 = new Shop({
      name: 'Shop Name',
      detail: 'Shop Detail',
      email: 'Shop Email',
      image: 'https://www.onsite.org/assets/images/teaser/online-e-shop.jpg',
      tel: '097654321',
      map: {
        lat: '13.933954',
        long: '100.7157976'
      }
    });
    product1.save();
    product2.save();
    product3.save();
    product4.save();
    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    var cate = new Category({
      name: 'mos'
    });
    cate.save();
    agent.get('/api/homes')
      .end(function (homeGetErr, homeGetRes) {
        // Handle Home save error
        if (homeGetErr) {
          return done(homeGetErr);
        }
        // Get Home list
        var home = homeGetRes.body;

        // Set assertions
        (home.categories.length).should.match(3);
        (home.categories[0].name).should.match('Highlight');
        (home.categories[0].popularproducts.length).should.match(5);
        (home.categories[0].popularshops.length).should.match(1);
        (home.categories[0].popularshops[0].name).should.match(shop.name);

        (home.categories[1].name).should.match(cate.name);
        (home.categories[1].popularproducts.length).should.match(0);
        (home.categories[1].popularshops.length).should.match(0);

        (home.categories[2].name).should.match(category.name);
        (home.categories[2].popularproducts.length).should.match(5);
        (home.categories[2].popularshops.length).should.match(1);
        done();
      });
  });

  it('see all product highlight cate', function (done) {
    var product1 = new Product({
      name: 'Product name1',
      detail: 'Product detail',
      price: 100,
      promotionprice: 80,
      percentofdiscount: 20,
      currency: 'Product currency',
      images: ['Product images'],
      shippings: [shipping],
      categories: [category],
      historylog: [{
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }],
      cod: false,
      shop: shop,
    });
    var product2 = new Product({
      name: 'Product name2',
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
      historylog: [{
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }]
    });
    var product3 = new Product({
      name: 'Product name3',
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
      historylog: [{
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }]
    });
    var olddate = new Date();
    olddate.setMonth(1);
    var product4 = new Product({
      name: 'Product name4',
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
      historylog: [{
        user: user,
        created: new Date()
      }, {
        user: user,
        created: olddate
      }]
    });

    var shop1 = new Shop({
      name: 'Shop Name',
      detail: 'Shop Detail',
      email: 'Shop Email',
      image: 'https://www.onsite.org/assets/images/teaser/online-e-shop.jpg',
      tel: '097654321',
      map: {
        lat: '13.933954',
        long: '100.7157976'
      }
    });

    var shop2 = new Shop({
      name: 'Shop Name',
      detail: 'Shop Detail',
      email: 'Shop Email',
      image: 'https://www.onsite.org/assets/images/teaser/online-e-shop.jpg',
      tel: '097654321',
      map: {
        lat: '13.933954',
        long: '100.7157976'
      }
    });

    var shop3 = new Shop({
      name: 'Shop Name',
      detail: 'Shop Detail',
      email: 'Shop Email',
      image: 'https://www.onsite.org/assets/images/teaser/online-e-shop.jpg',
      tel: '097654321',
      map: {
        lat: '13.933954',
        long: '100.7157976'
      }
    });

    var shop4 = new Shop({
      name: 'Shop Name',
      detail: 'Shop Detail',
      email: 'Shop Email',
      image: 'https://www.onsite.org/assets/images/teaser/online-e-shop.jpg',
      tel: '097654321',
      map: {
        lat: '13.933954',
        long: '100.7157976'
      }
    });
    product1.save();
    product2.save();
    product3.save();
    product4.save();
    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    var cate = new Category({
      name: 'mos'
    });
    cate.save();
    agent.get('/api/seeallproduct/Highlight')
      .end(function (homeGetErr, homeGetRes) {
        // Handle Home save error
        if (homeGetErr) {
          return done(homeGetErr);
        }
        // Get Home list
        var home = homeGetRes.body;

        (home.title).should.match('Highlight');
        (home.items.length).should.match(5);
        done();
      });
  });

  it('see all shop highlight cate', function (done) {
    var product1 = new Product({
      name: 'Product name',
      detail: 'Product detail',
      price: 100,
      promotionprice: 80,
      percentofdiscount: 20,
      currency: 'Product currency',
      images: ['Product images'],
      shippings: [shipping],
      categories: [category],
      historylog: [{
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }],
      cod: false,
      shop: shop,
    });
    var product2 = new Product({
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
      historylog: [{
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }]
    });
    var product3 = new Product({
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
      historylog: [{
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }, {
        user: user,
        created: new Date()
      }]
    });
    var olddate = new Date();
    olddate.setMonth(1);
    var product4 = new Product({
      name: 'Product name4',
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
      historylog: [{
        user: user,
        created: new Date()
      }, {
        user: user,
        created: olddate
      }]
    });
    product1.save();
    product2.save();
    product3.save();
    product4.save();
    var cate = new Category({
      name: 'mos'
    });
    cate.save();
    agent.get('/api/seeallshop/Highlight')
      .end(function (homeGetErr, homeGetRes) {
        // Handle Home save error
        if (homeGetErr) {
          return done(homeGetErr);
        }
        // Get Home list
        var home = homeGetRes.body;

        (home.title).should.match('Highlight');
        (home.items.length).should.match(1);
        done();
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
