'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Shipping Schema
 */
var ShippingSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Shipping name',
    trim: true
  },
  detail: {
    type: String,
    required: 'Please fill Shipping detail'
  },
  price: {
    type: Number,
    default: 0,
    required: 'Please fill Shipping price'
  },
  duedate: {
    type: Number,
    default: 1,
    required: 'Please fill Shipping price'
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

mongoose.model('Shipping', ShippingSchema);
