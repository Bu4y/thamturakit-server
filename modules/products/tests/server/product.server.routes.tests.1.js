'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Product = mongoose.model('Product'),
  Category = mongoose.model('Category'),
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
  category,
  shop,
  shipping,
  product,
  token;

/**
 * Product routes tests
 */
describe('Product CRUD tests with Token Base Authen', function () {

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
    shipping = new Shipping({
      name: 'Shipping Name',
      detail: 'ส่งด่วน',
      price: 300,
      duedate: 2,
      user: user
    });

    token = '';

    // Save a user to the test db and create new Product
    user.save(function () {
      shipping.save(function () {
        shop.save(function () {
          category.save(function () {
            product = {
              name: 'Product name',
              detail: 'Product detail',
              price: 100,
              promotionprice: 80,
              percentofdiscount: 20,
              currency: 'Product currency',
              images: ['Product images'],
              shippings: [{ shippingtype: shipping, shippingprice: 100 }],
              categories: [category],
              cod: false,
              shop: shop,
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

  it('should be able to save a Product if logged in with token', function (done) {
    // Save a new Product
    agent.post('/api/products')
      .set('authorization', 'Bearer ' + token)
      .send(product)
      .expect(200)
      .end(function (productSaveErr, productSaveRes) {
        // Handle Product save error
        if (productSaveErr) {
          return done(productSaveErr);
        }

        // Get a list of Products
        agent.get('/api/products')
          .end(function (productsGetErr, productsGetRes) {
            // Handle Products save error
            if (productsGetErr) {
              return done(productsGetErr);
            }

            // Get Products list
            var products = productsGetRes.body;

            // Set assertions
            //(products[0].user.loginToken).should.equal(token);
            (products.items[0].name).should.match('Product name');

            // Call the assertion callback
            done();
          });
      });
  });
  it('should be able to update a Product if logged in with token', function (done) {
    // Save a new Product
    agent.post('/api/products')
      .set('authorization', 'Bearer ' + token)
      .send(product)
      .expect(200)
      .end(function (productSaveErr, productSaveRes) {
        // Handle Product save error
        if (productSaveErr) {
          return done(productSaveErr);
        }
        // var products = productSaveRes.body;
        // (products.name).should.equal('Product name');
        product.name = "test Product";
        agent.put('/api/products/' + productSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(product)
          .expect(200)
          .end(function (productUpdateErr, productUpdateRes) {
            // Handle Product save error
            if (productUpdateErr) {
              return done(productUpdateErr);
            }

            // Get a list of Products
            agent.get('/api/products')
              .end(function (productsGetErr, productsGetRes) {
                // Handle Products save error
                if (productsGetErr) {
                  return done(productsGetErr);
                }

                // Get Products list
                var products = productsGetRes.body;

                // Set assertions
                //(products[0].user.loginToken).should.equal(token);
                (products.items[0].name).should.equal('test Product');

                // Call the assertion callback
                done();
              });
          });
      });
  });
  it('should be able to delete a Product if logged in with token', function (done) {
    // Save a new Product
    agent.post('/api/products')
      .set('authorization', 'Bearer ' + token)
      .send(product)
      .expect(200)
      .end(function (productSaveErr, productSaveRes) {
        // Handle Product save error
        if (productSaveErr) {
          return done(productSaveErr);
        }

        agent.delete('/api/products/' + productSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(product)
          .expect(200)
          .end(function (productUpdateErr, productUpdateRes) {
            // Handle Product save error
            if (productUpdateErr) {
              return done(productUpdateErr);
            }
            // Get a list of Products
            agent.get('/api/products')
              .end(function (productsGetErr, productsGetRes) {
                // Handle Products save error
                if (productsGetErr) {
                  return done(productsGetErr);
                }

                // Get Products list
                var products = productsGetRes.body;

                // Set assertions
                //(products[0].user.loginToken).should.equal(token);
                (products.items.length).should.match(0);

                // Call the assertion callback
                done();
              });
          });
      });
  });
  it('should be able to get List a Product if logged in with token', function (done) {
    // Save a new Product
    agent.post('/api/products')
      .set('authorization', 'Bearer ' + token)
      .send(product)
      .expect(200)
      .end(function (productSaveErr, productSaveRes) {
        // Handle Product save error
        if (productSaveErr) {
          return done(productSaveErr);
        }

        // Get a list of Products
        agent.get('/api/products')
          .end(function (productsGetErr, productsGetRes) {
            // Handle Products save error
            if (productsGetErr) {
              return done(productsGetErr);
            }

            // Get Products list
            var products = productsGetRes.body;

            // Set assertions
            //(products[0].user.loginToken).should.equal(token);
            (products.items.length).should.match(1);
            (products.items[0].name).should.match(product.name);
            (products.items[0].image).should.match(product.images[0]);
            (products.items[0].price).should.match(product.price);
            (products.items[0].promotionprice).should.match(product.promotionprice);
            (products.items[0].percentofdiscount).should.match(product.percentofdiscount);
            (products.items[0].currency).should.match(product.currency);
            (products.items[0].rate).should.match(5);
            (products.items[0].categories[0].name).should.match(product.categories[0].name);
            done();
          });
      });
  });
  it('should be able to get By ID a Product if logged in with token', function (done) {
    // Save a new Product
    agent.post('/api/products')
      .set('authorization', 'Bearer ' + token)
      .send(product)
      .expect(200)
      .end(function (productSaveErr, productSaveRes) {
        // Handle Product save error
        if (productSaveErr) {
          return done(productSaveErr);
        }

        var productObj = productSaveRes.body;
        agent.get('/api/products/' + productSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .end(function (productGetErr, productsGetRes) {
            // Handle Product save error
            if (productGetErr) {
              return done(productGetErr);
            }
            // Get Products list
            var product = productsGetRes.body;

            // Set assertions
            //(products[0].user.loginToken).should.equal(token);
            (product.name).should.match('Product name');
            (product.price).should.match(productObj.price);
            (product.promotionprice).should.match(productObj.promotionprice);
            (product.percentofdiscount).should.match(productObj.percentofdiscount);
            (product.currency).should.match(productObj.currency);
            (product.rate).should.match(5);
            (product.shippings.length).should.match(1);
            // (product.shippings[0]._id).should.match(shipping.id);
            // (product.shippings[0].name).should.match(shipping.name);
            // (product.shippings[0].price).should.match(100);
            (product.shop.name).should.match(shop.name);


            done();
          });
      });
  });

  it('should be able to Product update historylog if logged in with token', function (done) {
    // Save a new Product
    agent.post('/api/products')
      .set('authorization', 'Bearer ' + token)
      .send(product)
      .expect(200)
      .end(function (productSaveErr, productSaveRes) {
        // Handle Product save error
        if (productSaveErr) {
          return done(productSaveErr);
        }

        var productObj = productSaveRes.body;
        agent.get('/api/productupdatehitorylog/' + productSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .end(function (productGetErr, productsGetRes) {
            // Handle Product save error
            if (productGetErr) {
              return done(productGetErr);
            }
            // Get Products list
            var product = productsGetRes.body;

            // Set assertions

            (product.historylog.length).should.match(1);
            (product.historylog[0].user).should.match(user.id);


            done();
          });
      });
  });

  it('update product review', function (done) {
    // Save a new product
    agent.post('/api/products')
      .set('authorization', 'Bearer ' + token)
      .send(product)
      .expect(200)
      .end(function (productSaveErr, productSaveRes) {
        // Handle shop save error
        if (productSaveErr) {
          return done(productSaveErr);
        }

        var review = {
          topic: 'review topic',
          comment: 'comment',
          rate: 5
        };

        agent.put('/api/products/review/' + productSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(review)
          .expect(200)
          .end(function (productUpdateErr, productUpdateRes) {
            // Handle shop save error
            if (productUpdateErr) {
              return done(productUpdateErr);
            }
            // Get a list of product
            agent.get('/api/products/' + productSaveRes.body._id)
              .end(function (productGetErr, productsGetRes) {
                // Handle shop save error
                if (productGetErr) {
                  return done(productGetErr);
                }
                // Get shop list
                var products = productsGetRes.body;

                // Set assertions
                products.reviews.should.be.instanceof(Array).and.have.lengthOf(1);
                products.reviews[0].should.be.instanceof(Object).and.have.property('topic', review.topic);
                products.reviews[0].should.be.instanceof(Object).and.have.property('comment', review.comment);
                products.reviews[0].should.be.instanceof(Object).and.have.property('rate', review.rate);
                products.reviews[0].should.be.instanceof(Object).and.have.property('user', user.id);



                done();
              });
          });
      });

  });

  it('update product shipping', function (done) {
    // Save a new product
    agent.post('/api/products')
      .set('authorization', 'Bearer ' + token)
      .send(product)
      .expect(200)
      .end(function (productSaveErr, productSaveRes) {
        // Handle shop save error
        if (productSaveErr) {
          return done(productSaveErr);
        }

        var shippingObj1 = new Shipping({
          name: 'review topic',
          detail: 'comment',
          price: 5,
          duedate: 3
        });
        var shippingObj2 = new Shipping({
          name: 'review topic',
          detail: 'comment',
          price: 5,
          duedate: 3
        });
        shippingObj1.save();
        shippingObj2.save();
        var shippings = [{ shippingtype: shippingObj1, shippingprice: 30 }, { shippingtype: shippingObj2, shippingprice: 20 }];

        agent.put('/api/products/shippings/' + productSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(shippings)
          .expect(200)
          .end(function (productUpdateErr, productUpdateRes) {
            // Handle shop save error
            if (productUpdateErr) {
              return done(productUpdateErr);
            }
            // Get a list of product
            agent.get('/api/products/' + productSaveRes.body._id)
              .end(function (productGetErr, productsGetRes) {
                // Handle shop save error
                if (productGetErr) {
                  return done(productGetErr);
                }
                // Get shop list
                var products = productsGetRes.body;

                // Set assertions
                products.shippings.should.be.instanceof(Array).and.have.lengthOf(3);

                done();
              });
          });
      });

  });

  it('should be able to get List a Product by Shop if logged in with token', function (done) {
    var ProductObj = new Product(product);
    // Get a list of Products
    ProductObj.save();
    agent.get('/api/productsbyshop/' + shop.id)
      .set('authorization', 'Bearer ' + token)
      .end(function (productsGetErr, productsGetRes) {
        // Handle Products save error
        if (productsGetErr) {
          return done(productsGetErr);
        }

        // Get Products list
        var products = productsGetRes.body;

        // Set assertions
        //(products[0].user.loginToken).should.equal(token);
        (products.items.length).should.match(1);
        (products.items[0].name).should.match(product.name);
        (products.items[0].image).should.match(product.images[0]);
        (products.items[0].price).should.match(product.price);
        (products.items[0].promotionprice).should.match(product.promotionprice);
        (products.items[0].percentofdiscount).should.match(product.percentofdiscount);
        (products.items[0].currency).should.match(product.currency);
        (products.items[0].rate).should.match(5);
        (products.items[0].categories[0].name).should.match(product.categories[0].name);
        done();
      });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Shipping.remove().exec(function () {
        Shop.remove().exec(function () {
          Category.remove().exec(function () {
            Product.remove().exec(done);
          });
        });
      });
    });
  });
});
