import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

// Schema for user collection
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true,
    collection: 'Users',
});


// It will add the username, has password and salt value
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
