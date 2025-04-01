import mongoose from 'mongoose';

// Define the schema for location
const locationSchema = new mongoose.Schema({
  country: String,
  region: String,
  city: String,
  lat: Number,
  lon: Number
}, { _id: false });

// Define the schema for users
const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    unique: true,
    index: true
  },
  name: { 
    type: String, 
    required: true 
  },
  isAdmin: { 
    type: Boolean, 
    default: false,
    index: true
  },
  picture: String,
  last_login: { 
    type: Date,
    default: Date.now
  },
  last_ip: String,
  last_location: locationSchema
}, {
  timestamps: true,
  collection: 'users',
  strict: false // Allow flexibility with existing documents
});

// Add indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ isAdmin: 1 });
userSchema.index({ createdAt: -1 });

// Delete the model if it exists to prevent OverwriteModelError during hot reloading
if (mongoose.models.User) {
  delete mongoose.models.User;
}

// Create and export the model
const User = mongoose.model('User', userSchema);

export default User; 