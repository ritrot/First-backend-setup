import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
    },
    watchHistory: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    }

},
    {
        timestamps: true
    })


// Here we are encrypting the password pre is method of mongoose which allwos us to do somthing before doing something here we are doing somthing before saving the data. "this" contains the all data in userschema so using that we are cheacking if the data is modified if it is true then we are replacing the password with hash (hash is hexadecimal number created using bcrypt) then after this we are passing to next (since this is a middleware we have to pass "next" to the function call it after the function is complete.
//"this" is js keyword here used to refer the documnet
//pre is middelware

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12)
    }
    next();
})

//here we are cheacking if the password user provided while login is correct or not by using the property of bcrypt(compare) which will compare the password provied by the user and the the hash password we stored in our databse (called using this keyword) this will return true or false

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.say = function(){
    console.log("Say  it");
    
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generatRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema) 