'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Payment Schema
 */
var PaymentSchema = new Schema({

  payment: {
    type: [{
      name: {
        type: String,
        default: '',
        required: 'Please fill Payment name',
        trim: true
      },
      image: {
        type: String,
      }
    }]
  },

  counterservice: {
    type: [{
      name: {
        type: String,
        default: '',
        required: 'Please fill Counterservice name',
        trim: true
      },
      image: {
        type: String,
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

mongoose.model('Payment', PaymentSchema);
