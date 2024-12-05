import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verfiyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401, "Error while creating the token.")
        }
        
        const decodedinfo = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const user =await User.findById(decodedinfo._id);
        if (!user) {
            throw new ApiError(401, "token creation error.");
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(400, error?.message || "Error while verfying the user using JWT in middelware.")
    }
    
})

//in 8 we got the cookie from req. 
//in 12 we decoded the cookie.
//in [17] we provided the db acess to the req.