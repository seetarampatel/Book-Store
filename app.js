// Imports
require('dotenv').config;
import express from 'express';
import cors from 'cors';
import {connectDb} from './models';
import path from 'path';
import ejsMate from 'ejs-mate';
import Book from './models/book';
import User from './models/user';
import passport from 'passport';
import session from 'express-session';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import LocalStrategy from 'passport-local';
import expressSanitizer from 'express-sanitizer';

/**********************************/
const app = express();
// Declaration of port - Eitehr use default port or defined in .env file
const port = process.env.PORT || 3000;

/**********************************/
app.use(cors());
app.use(express.json());
// This will help to parse and read the data such as DATABASE_URL from .env file
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(expressSanitizer());
app.use(methodOverride('_method'));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());

// Intialize the passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// Store the user in the session
passport.serializeUser(User.serializeUser());
// Remove the user from the session
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

/**********************************/
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));

/**********************************/
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // If user try to acess protected links, then redirect to the login page
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

/***********************************************************/
// GET method - redirect to the books page
app.get('/', (req, res) => {
    res.redirect('/books');
})

// GET method - display the all books
app.get('/books', async (req, res) => {
    const books = await Book.find({});
    res.render('index', { books,  currentUser: req.user })
});

// GET method - open the create book page
app.get('/books/new', isLoggedIn, (req, res) => {
    res.render("new");
})

// GET method - display the details of particular book based on id
app.get("/books/:id", (req, res) => {
    Book.findById(req.params.id, (err, foundbook) =>{
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
app.get("/books/:id/edit", isLoggedIn, (req, res) => {
    Book.findById(req.params.id, (err, editbook) => {
        if(err){
            res.redirect("/books");
        } else {
            res.render("edit", {book: editbook});
        }
    });
})

// UPDATE method - update the book and redirect the user to the books page
app.put("/books/:id", isLoggedIn, (req, res) => {
    Book.findByIdAndUpdate(req.params.id, req.body.book, (err, updatedbook) => {
        if(err){
            res.redirect("/books");
        } else {
            res.redirect("/books");
        }
   });
});

// DELETE method - delete the book and redirect the user to the books page
app.delete("/books/:id", isLoggedIn,  (req, res) => {
    Book.findByIdAndRemove(req.params.id, (err) => {
        if(err){
            res.redirect("/books");
        } else {
            res.redirect("/books");
        }
    })
 });

 /*************************************************************/
 // API Route - Get method
app.get('/api/books', async (req, res) => {
    const apiBooks = await Book.find({});
    res.send(apiBooks);
});


// API Route - Get method
app.get('/api/books/:id', (req, res) => {
    Book.findById(req.params.id, (err, apifoundbook) =>{
        if(err){
            res.status(404).send('The course with given id was not found');
        } else {
            res.send(apifoundbook);        
        }
    });
});

// API Route - POST method
app.post('/api/books', (req, res) => {
    const apiBook = new Book ({
        title : req.body.title,
        description : req.body.description,
        image: req.body.image,
        genre: req.body.genre,
        rating: req.body.rating
    });
    try {
        const savedBook = apiBook.save();
        res.json(savedBook)
    } catch (err) {
        res.json( {message: err});
    }
})

// API Route - PUT Method
app.patch("/api/books/:id", async (req, res) => {
    try {
        res.book.title =  req.body.title
        res.book.description = req.body.description
        res.book.image = req.body.image
        res.book.genre = req.body.genre
        res.book.rating = req.body.rating
        const updateBook = await res.book.save();
        res.json(updateBook);
    }
    catch (err) {
        res.json({ message: err });
    }
 });

// API Route - DELETE Method
 app.delete("/api/books/:id", async (req, res) => {
    try {
        const removedBook = await Book.remove({_id: req.params.id});
        res.json(removedBook);
    }
    catch (err) {
        res.json({ message: err });
    }
 });

/****************************************************************/
// GET method - render the register page
app.get('/register', (req, res) => {
    res.render('register');
});

// GET method - render the login page
app.get('/login', (req, res) => {
    res.render('login');
});

// POST method - save the username, email, and password and redirect the user either login or books page
app.post("/register", async (req, res) => {
    try {
        // save req.body in email, username, and password variables
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        registeredUser.save();
        // If user is registerd then redirect to the books page
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Welcome to book store!');
            res.redirect('/books');
        })
    }
    catch (e) {
        req.flash('error', e.message);
        res.render('register');
    }
});

// GET method - display the login page
app.get("/login", function(req, res){
   res.render("login"); 
});

// POST method - take the username and password and redirect the user to the books page on successful login
app.post("/login", passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), (req, res) => {
    req.flash('success', 'Welcome Back');
    const redirectUrl = req.session.returnTo || '/books';
    res.redirect(redirectUrl);
});

// GET method - logout the user
app.get("/logout", function(req, res){
    req.logout();
    req.flash('success', 'Thanks for using Book Store!');
    res.redirect("/books");
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
