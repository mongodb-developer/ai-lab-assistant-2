import mongoose from 'mongoose';

// Book Copy Schema
const bookCopySchema = new mongoose.Schema({
  copyNumber: { type: Number, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['available', 'checked-out', 'maintenance']
  },
  location: { type: String, required: true },
  lastCheckedOut: Date,
  dueDate: Date
}, { _id: false });

// Book Schema
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  publishedYear: { type: Number, required: true },
  publisher: { type: String, required: true },
  genre: { type: String, required: true },
  copies: [bookCopySchema]
}, {
  timestamps: true,
  collection: 'books'
});

// Patron Address Schema
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true }
}, { _id: false });

// Checked Out Book Schema
const checkedOutBookSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  copyNumber: { type: Number, required: true },
  checkoutDate: { type: Date, required: true },
  dueDate: { type: Date, required: true }
}, { _id: false });

// Patron Schema
const patronSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: addressSchema, required: true },
  membershipStatus: { 
    type: String, 
    required: true,
    enum: ['active', 'suspended', 'expired']
  },
  membershipExpiry: { type: Date, required: true },
  checkedOutBooks: [checkedOutBookSchema]
}, {
  timestamps: true,
  collection: 'patrons'
});

// Checkout Schema
const checkoutSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  patronId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patron', required: true },
  copyNumber: { type: Number, required: true },
  checkoutDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: Date,
  status: { 
    type: String, 
    required: true,
    enum: ['active', 'returned', 'overdue']
  }
}, {
  timestamps: true,
  collection: 'checkouts'
});

// Create indexes
bookSchema.index({ title: 'text', author: 'text', genre: 'text' });
patronSchema.index({ membershipStatus: 1 });
checkoutSchema.index({ bookId: 1, patronId: 1, status: 1 });
checkoutSchema.index({ dueDate: 1 });

// Create models
const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);
const Patron = mongoose.models.Patron || mongoose.model('Patron', patronSchema);
const Checkout = mongoose.models.Checkout || mongoose.model('Checkout', checkoutSchema);

export { Book, Patron, Checkout }; 