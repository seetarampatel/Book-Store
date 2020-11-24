// Imports
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {connectDb} from './models';
import path from 'path';
import ejsMate from 'ejs-mate';
import Book from './models/book';
import methodOverride from 'method-override';

/**********************************/
const app = express();
// Declaration of port - Eitehr use default port or defined in .env file
const port = process.env.PORT || 3000;

/**********************************/
app.use(cors());
app.use(express.json());
// This will help to parse and read the data such as DATABASE_URL from .env file
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

/**********************************/
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));

/**********************************/
// GET method - redirect to the books page
app.get('/', (req, res) => {
    res.redirect('/books');
})

// GET method - display the all books
app.get('/books', async (req, res) => {
    const books = await Book.find({});
    res.render('index', { books })
});

// GET method - open the create book page
app.get('/books/new', (req, res) => {
    res.render("new");
})

// GET method - display the details of particular book based on id
app.get("/books/:id", (req, res) => {
    Book.findById(req.params.id, function(err, foundbook){
        if(err){
            res.redirect("/books");
        } else {
            res.render("show", {book: foundbook});
        }
    })
 });

// POST method - save the new book and redirect user to the detailed book page
app.post('/books', (req, res) => {
    const book = new Book(req.body.Book);
    book.save();
    res.redirect(`/books/${book._id}`)
})

// GET method - open the edit page based on id 
app.get("/books/:id/edit", (req, res) => {
    Book.findById(req.params.id, (err, editbook) => {
        if(err){
            res.redirect("/books");
        } else {
            res.render("edit", {book: editbook});
        }
    });
})

// UPDATE method - update the book and redirect the user to the books page
app.put("/books/:id", (req, res) => {
    Book.findByIdAndUpdate(req.params.id, req.body.book, (err, updatedbook) => {
        if(err){
            res.redirect("/books");
        } else {
            res.redirect("/books");
        }
   });
});

// DELETE method - delete the book and redirect the user to the books page
app.delete("/books/:id", (req, res) => {
    Book.findByIdAndRemove(req.params.id, (err) => {
        if(err){
            res.redirect("/books");
        } else {
            res.redirect("/books");
        }
    })
 });
 

// It will run the app after the database connection.
connectDb().then( async () => {
    // Run our app on selected port
    app.listen(port, () => {
        console.log(`The server is started at ${port}`);
    });
}).catch(err => {
    console.error(err.message);     // Display the error message
});
