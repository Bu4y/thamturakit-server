'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Address Schema
 */
var AddressSchema = new Schema({
  firstname: {
    type: String,
    default: '',
    required: 'Please fill Address firstname',
  },
  lastname: {
    type: String,
    default: '',
    required: 'Please fill Address lastname',
  },
  address: {
    type: String,
    default: '',
    required: 'Please fill Address address',
  },
  subdistrict: {
    type: String,
    default: '',
    required: 'Please fill Address subdistrict',
  },
  district: {
    type: String,
    default: '',
    required: 'Please fill Address district',
  },
  province: {
    type: String,
    default: '',
    required: 'Please fill Address province',
  },
  postcode: {
    type: String,
    default: '',
    required: 'Please fill Address postcode',
  },
  tel: {
    type: String,
    default: '',
    required: 'Please fill Address tel',
  },
  location: {
    lat: { type: String },
    lng: { type: String }
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

mongoose.model('Address', AddressSchema);
