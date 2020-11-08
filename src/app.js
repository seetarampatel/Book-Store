// Imports
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {connectDb} from './models';
import bookRoutes from './routes/book';

const app = express();
// Declaration of port - Eitehr use default port or defined in .env file
const port = process.env.PORT || 3000;

// Use of our imports / Middlewares
app.use(cors());
app.use(express.json());
// This will help to parse and read the data such as DATABASE_URL from .env file
app.use(express.urlencoded({ extended: true })); 
app.use('/books', bookRoutes);

// It will run the app after the database connection.
connectDb().then( async () => {
    // Run our app on selected port
    app.listen(port, () => {
        console.log(`The server is started at ${port}`);
    });
}).catch(err => {
    console.error(err.message);     // Display the error message
});
