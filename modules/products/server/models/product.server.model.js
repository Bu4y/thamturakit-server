'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Product Schema
 * id: string;
    name: string;
    detail: string;
    unitprice: number;
    image: Array<ImgsModel>;
    review: Array<ReviewsModel>;
    rate: number;
    qa: Array<QASModel>;
    promotions: Array<PromotionsModel>;
    qty: number;
    issize: boolean;
    size: ProductDataSize = new ProductDataSize();
    shipping: Array<ShippingModel>;
    shop: ShopModel = new ShopModel();
    relationProducts: Array<RelationProductsModel>;
    selectedsize: string;
    title: string;
 */

var ProductSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Product name',
    trim: true
  },
  detail: String,
  price: {
    type: Number,
    required: 'Please fill Product price'
  },
  promotionprice: {
    type: Number
  },
  percentofdiscount: {
    type: Number
  },
  currency: {
    type: String
  },
  images: {
    type: [String],
    required: 'Please fill Product images'
  },
  reviews: {
    type: [{
      topic: String,
      comment: String,
      rate: Number,
      created: {
        type: Date,
        default: Date.now
      },
      user: {
        type: Schema.ObjectId,
        ref: 'User'
      }
    }]
  },
  shippings: {
    type: [{
      shippingtype: {
        type: Schema.ObjectId,
        ref: 'Shipping'
      },
      shippingprice: {
        type: Number,
        default: 0
      }
    }],
    required: 'Please fill Product Shipping'
  },
  categories: {
    type: [{
      type: Schema.ObjectId,
      ref: 'Category'
    }]
  },
  cod: {
    type: Boolean,
    default: false
  },
  rate: {
    type: Number
  },
  shop: {
    type: Schema.ObjectId,
    ref: 'Shop'
  },
  historylog: {
    type: [{
      user: {
        type: Schema.ObjectId,
        ref: 'User'
      },
      created: {
        type: Date,
        default: Date.now
      }
    }]
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Product', ProductSchema);
