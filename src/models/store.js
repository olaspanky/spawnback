// const mongoose = require('mongoose');

// const StoreSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   description: { type: String, required: true },
//   location: { type: String, required: true },
//   storeImage: { type: String },
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   items: [{
//     name: { type: String, required: true },
//     measurement: {
//       unit: { 
//         type: String, 
//         enum: ['congo', 'bag', '1/2 bag', '1/4 bag', 'litre', 'keg', '50kg', 'custom'], // Predefined options + custom
//         default: 'bag'
//       },
//       value: { type: Number, min: 0 }, // Numeric value for the measurement
//       customUnit: { type: String, required: function() { return this.unit === 'custom'; } } // Required if unit is 'custom'
//     },
//     price: { type: Number, required: true, min: 0 },
//     image: { type: String }, // URL to the uploaded image
//     available: { type: Boolean, default: true },
//   }],
//   packageDeals: [{
//     name: { type: String, required: true },
//     description: { type: String },
//     items: [{ 
//       item: { type: String, required: true },
//       measurement: {
//         unit: { 
//           type: String, 
//           required: true,
//           enum: ['congo', 'bag', '1/2 bag', '1/4 bag', 'litre', 'keg', '50kg', 'custom'],
//           default: 'bag'
//         },
//         value: { type: Number, required: true, min: 1 },
//         customUnit: { type: String, required: function() { return this.unit === 'custom'; } }
//       }
//     }],
//     discountPercentage: { type: Number, min: 0, max: 100 },
//     price: { type: Number, required: true, min: 0 },
//     active: { type: Boolean, default: true },
//   }],
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('Store', StoreSchema);

const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  location: String,
  storeImage: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      name: { type: String, required: true },
      measurement: {
        unit: {
          type: String,
          required: true,
          enum: ['congo', 'bag', '1/2 bag', '1/4 bag', 'litre', 'keg', '50kg', 'custom'],
        },
        value: { type: Number, min: 0 },
        customUnit: { type: String },
      },
      price: { type: Number, required: true, min: 0 },
      image: { type: String }, // URL to the uploaded image
      available: { type: Boolean, default: true },
    },
  ],
  packageDeals: [
    {
      name: { type: String, required: true },
      description: String,
      items: [
        {
          item: { type: String, required: true }, // Reference by name
          quantity: { type: Number, required: true, min: 1 },
        },
      ],
      discountPercentage: { type: Number, min: 0, max: 100 },
      price: { type: Number, required: true, min: 0 },
      active: { type: Boolean, default: true },
    },
  ],
});

module.exports = mongoose.model('Store', storeSchema);