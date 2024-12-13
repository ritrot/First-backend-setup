import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import mongoose, { Aggregate } from "mongoose";

// generting access and refresh token
const getAccessAndRefreshToken = async (user) => {
    let accessToken;
    let refreshToken;
    try {
        accessToken =await user.generateAccessToken()
        refreshToken = user.generatRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({ ValidateBeforeSave: false });
    } catch (err) {
        throw new ApiError(500, err);
    }
    return accessToken, refreshToken;
}






const register = asyncHandler(async (req, res) => {
    //get the user data

    //console.log("Files are here = " ,req.files);
    
    const { email, username, fullName, password } = req.body;

    //cheak if entries are empty

    if ([email, username, fullName, password].some(e => !e?.trim())) {
        throw new ApiError(400, "All fields are required!!!");
    }

    //Why???
    // if([email , username ,fullName , password].some((e)=> {e?.trim()===""})) {
    //     throw new ApiError(400 , "All fildes are required!!!")
    // }

    //cheak if user already exists
    const cheakuser = await User.findOne({
        $or: [{ username },{ email }]
    })

    if (cheakuser) {
        throw new ApiError(409, "User with same username or email exists.")
    }

    // uplod image on cloundinary
    if (!Array.isArray(req.files.avatar)) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatarpath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarpath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarpath);
    const coverimage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(501, "Not uploded on cloudinary");
    }

    //create user in db
    const user = await User.create({
        username,
        email,
        avatar: avatar.url,
        coverImage: coverimage?.url || "",
        fullName,
        password,
    })

    // delete the password and refresh token from response
    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createduser) {
        throw new ApiError(500, "Error while regisring the user in db");
    }


    // return the response
    return res.status(201).json(
        new ApiResponse(200, createduser, "User is registered succefully.")
    )
})

const userlogin = asyncHandler(async (req, res) => {
    //get userdata
    //cheak if all of it is provided
    //find the user by using either email or username
    //pasword cheak
    //create access token and refresh token
    //send cookies
    //send response

    //get the userdata
    const { email, username, password } = req.body;
    console.log(req.body);
    
    if (!email ) {
        throw new ApiError(400, "Username or email is required");
    }
    if(!password){
        throw new ApiError(400 , "Password is required")
    }

    //cheak  if the user is prsent in database
    const user = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (!user) {
        throw new ApiError(404, "User is not in data base.");
    }

    //cheak the password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Entered wrong password.")
    }

    //create accesstoken and refreshtoken
    const { accessToken, refreshToken } = await getAccessAndRefreshToken(user);

    const option = {
        httpOnly: true,
        secure: true
    }

    return res.
        status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(
                200,
                { user: user },
                "User loggoned in succefully."
            )
        )

})

const userlogout = asyncHandler(async (req, res) => {

    User.findByIdAndUpdate(
        
        req._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const option = {
        httpOnly: true,
        secure: true
    }

    res.
    status(200)
    .clearCookie("accessToken" , option)
    .clearCookie("refreshToken" , option)
    .json(new ApiResponse(200 , {} , "User Logout Successfully."))

})

const refreshaccesstoken = asyncHandler(async(req , res)=>{
    const incomingRefreshtoken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshtoken){
        throw new ApiError(400 , "Error while incomig the refresh token.")
    }

    const decodedtoken = jwt.verify(
        incomingRefreshtoken,
        process.env.REFRESH_TOKEN_SECRET,
    )
    const user =await User.findById(decodedtoken?._id);
    if(!user){
        throw new ApiError(400 , "Invalid refresh token.")
    }
    if(incomingRefreshtoken != user.refreshToken){
        throw new ApiError(401 , "Refresh token is expired.")
    }
    const option = {
        httpOnly : true,
        secure : true
    }

    const {newrefrshtoken , newacesstoken } = getAccessAndRefreshToken(user);

    return res.
        status(200)
        .cookie("accessToken", newacesstoken, option)
        .cookie("refreshToken", newrefrshtoken, option)
        .json(
            new ApiResponse(
                200,
                {accessToken :newacesstoken , refreshToken:newrefrshtoken},
                "Access cookie refiled successfuly."
            )
        )
     
})

const changeCurrentPassword = asyncHandler(async(req , res) =>{
    const {oldPassword , newPassword} = req.body;
    if(!oldPassword || !newPassword){
        throw new ApiError(400 , "Enter the password.")
    }    
    
    const user =await User.findById(req.user?._id);
    // const say = user.say();
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400 , "invalid old password")
    }
    user.password = newPassword;
    user.save({ValidateBeforeSave:false});

    return res
    .status(200)
    .json(new ApiResponse(200 , {} , "Password changed succesfully"))
})

const getCurrentUser = asyncHandler(async(req , res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200 ,req.user , "Current user fatched successfully"))
})

const updateAccountDetails = asyncHandler(async (req , res) =>{
    const {fullName , email , } = req.body;
    if(!fullName && !email){
        throw new ApiError(400 , "All fields are required.")
    }

    const user =await User.findByIdAndUpdate(req.user?._id , {
        $set:{
            fullName,
            email
        }
    } , {new:true}).select("-password")

    
    return res
    .status(200)
    .json(new ApiResponse(200 , user , "Account details are updated."))
})

const updateAvatar = asyncHandler(async(req , res)=>{
    console.log("FILES ARE = " , req.files);
    
    //take the new avatar
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw new ApiError(400 , "avatar file is missing")
    }

    //upload the new avatar on cloundinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400 , "Error while Uploading on cloudaniry")
    }

    //update the url in database
    const user = await User.findByIdAndUpdate(req.user?._id , {
        $set:{
            avatar : avatar.url
        }
    },{new:true}).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 , user , "Avtar is updated" ))

})

const updateCoverImage = asyncHandler(async(req , res)=>{

    //take the new coverImage url
    const coverLocalPath = req.file?.path;
    if(!coverLocalPath){
        throw new ApiError(400 , "cover file is missing")
    }

    //upload the new coverImage on cloundinary
    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if(!coverImage.url){
        throw new ApiError(400 , "error while Uploading on cloudaniry")
    }

    const user = await User.findByIdAndUpdate(req.user?._id , {
        $set:{
            coverImage : coverImage.url
        }
    },{new:true}).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 , user , "CoverImage is updated" ))
})

const getChannelProfile = asyncHandler(async(req , res)=>{
    const {username} = req.params;
    
    if(!username?.trim()){
        throw new ApiError(400 , "Username is missing.")
    }
    console.log(req.user?._id);
    
    const channel = await User.aggregate([
        {
            $match:{
                username : username.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"Subscription",
                localField: "_id",
                foreignField: "Channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"Subscription",
                localField: "_id",
                foreignField: "Subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount : {
                    $size:"$subscribers"
                },
                subscribedToCount : {
                    $size:"$subscribedTo" 
                },
                isSubscribed:{
                    
                    $cond:{
                        if:{$in :[req.user?._id , "$subscribers.Subscriber"]},
                        then:true,
                        else:false
                    }
                }

            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                email:1,
                subscriberCount:1,
                subscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,

            }
        }
    ])        
    if(!channel.length){
        throw new ApiError(404 , "the channel is not feached")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200 , channel[0] , "Channel data feched succesfully.")
    )
})

const watchHistory = asyncHandler(async (req , res)=>{
    const user =await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
                // username: req.user?.username
            }
        },
        {
            $lookup:{
                from:"Video",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline :[
                    {
                        $lookup:{
                            from:"user",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            //it will just over write the owner list with its first value to simply make it easy for thr frontend devlpoer.
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    console.log(user);
    

    return res
    .status(200)
    .json(
        new ApiResponse(200 , user[0].watchHistory ,"Watchhistory obtained.")
    )
})

export { register, userlogin, userlogout ,refreshaccesstoken , changeCurrentPassword , getCurrentUser , updateAccountDetails , updateAvatar , updateCoverImage , getChannelProfile , watchHistory};


// in 2nd step we used some
//what it does it cheaks if any of the elemnt in array is empty if its is then return true and breaks
// and if it returns true then the if code is excuted which is an error sender

// in 3rd step $or is called opretors which is used to cheak for multiple elments like in this case we are cheaking if email or username is exists or not so by using findone we will cheak if (any one of them = or) exits it will give true

// in 6th step by using select we can delete the perticular unwanted elments from schema
//if the deltation occurs then returns true(the object containg evrything except the password and refreshToken) else false


//in case of logout we dont have access to the data base since the user is not provideing any like when regiser or login hence here we ue token to get the acess
//every user logined have the access token and by using that we will get the acess to the db and erase the acess token 
// to do that we have crated a middleware called auth which will cheak if the user is logged in and it will decode the info in jwt and by using that decoded info we can access the db
 


//while updating the avatar we first took the img url from user then uploded on the cloudinary and then by using set opration put the url to appropriate place such as avatar or the CoverImage.