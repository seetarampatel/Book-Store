import mongoose from 'mongoose';

// Schema for book collection
const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: String,
    genre: String,
    rating: Number,
    created: {type: Date, default: Date.now},
}, {
    timestamp: true,
    collection: 'Books',
});

module.exports = mongoose.model('Book', BookSchema);
