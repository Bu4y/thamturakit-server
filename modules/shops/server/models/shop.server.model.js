'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Shop Schema
 */
var ShopSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Shop name',
    trim: true
  },
  detail: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: 'http://res.cloudinary.com/hgwy12jde/image/upload/v1508231334/download_n6ttru.png'
  },
  tel: {
    type: String,
    default: ''
  },
  map: {
    lat: {
      type: String
    },
    long: {
      type: String
    }
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
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Shop', ShopSchema);
