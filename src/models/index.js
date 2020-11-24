// Imports
import 'dotenv/config'
import mongoose from 'mongoose';
import Book from './book';

// Connection to the database
const connectDb = () => {
    return mongoose.connect((process.env.DATABASE_URL), {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    }).then(() => {
            console.log('Connected to DB!');  // Display the message on successful connection
        }).
       catch(err => console.error(`ERROR: ${err}`));    // Error message
};

// Defing models 
const models = {Book};

// Exporting database connection and models
export {connectDb};
export default models;