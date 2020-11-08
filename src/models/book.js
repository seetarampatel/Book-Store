import mongoose from 'mongoose';

// Schema for book collection
const bookSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    genre: String,
    review: Number
}, {
    timestamp: true,
    collection: 'Books',
});

// Bind the Book in bookSchema format
const Book = mongoose.model('Book', bookSchema);

// export the book
export default Book;
