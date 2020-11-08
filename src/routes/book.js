// Imports
import { Router } from 'express';
import Book from '../models/book';

const router = Router();

// Create a book
router.post('/', async (req, res) => {
  const book = new Book(req.body);      // Creating a new book
  await book.save();                    // Saving a new book
  return res.send(book);
});

// Retrieve the books
router.get('/', async (req, res) => { 
  const books = await Book.find({});    // Finding a book
  return res.send(books);
});

// Retrieve specific book
router.get('/:bookId', async (req, res) => { 
  const book = await Book.findById(req.params.bookId);   // Accessing a specific book by bookId
  return res.send(book);
});

// export the router
export default router;