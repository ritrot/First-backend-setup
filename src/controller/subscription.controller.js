import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import mongoose, { Aggregate } from "mongoose";
import { Subscription } from "../models/subscription.model.js";

const togglesubscription = asyncHandler(async (req , res)=>{
    // user will send the channelID
    //here we have to toggle the subscription 
    const {_id} = req.params
    const channel = await User.findById(_id);
    if(!channel) {
        throw new ApiError("User not found", 404);
    }

    const subscribed = await Subscription.findOne({
        Subscriber:req.user._id,
        Channel :_id
    })
    const isSubscribed = !!subscribed;
    console.log("Status = ",isSubscribed);
    
    let toggle ; 
    
    if(isSubscribed){
        // if the user is already subscribed then we have to unsubcribe him
        toggle = await Subscription.findOneAndDelete({
            Subscriber:req.user._id,
            Channel:_id
        })
    }

    else{
        // if the user is not subscribed then we have to subscribe him
        toggle = await Subscription.create({
            Subscriber:req.user?._id,
            Channel:_id
        })
    }

    //     const channels = await User.aggregate([
    //     {
    //         $match:{
    //             _id: mongoose.Types.ObjectId(_id)
    //         }
    //     },
    //     {
    //         $lookup:{
    //             from:"Subscription",
    //             localField: "_id",
    //             foreignField: "Channel",
    //             as:"subscribers"
    //         }
    //     },

    //     {
    //         $addFields:{
    //             isSubscribed:{             
    //                 $cond:{
    //                     if:{$in :[req.user?._id , "$subscribers.Subscriber"]},
    //                     then:true,
    //                     else:false
    //                 }
    //             }
    //         }
    //     },
    // ])


    return res
    .status(200)
    .json(
        new ApiResponse(200 , toggle , "did it")
    )
})

const subscribedChannels = asyncHandler(async(req , res)=>{
    // find all the channels that the user is subscribed to

    
    const subscribed = await Subscription.find({Subscriber:req.user._id}).populate("Channel" , "fullName username avatar ")
    
    return res.
    status(200)
    .json(
      new  ApiResponse(200 ,subscribed , "List obtained")
    )
})

const Subscribers = asyncHandler(async(req , res)=>{
    //find all the subscribers of a channel
    const channel = await User.findById(req.params._id)
    if(!channel){
        throw new ApiError(404 , "Channel is not valid.");
    }
    const subscribers = Subscription.find({Channel:req.user?._id}).populate('Subscriber' , "username avatar fullName")

    return res
    .status(200)
    .json(
        new ApiResponse(200 ,subscribers[0] , "List obtained")
    )
})

export {subscribedChannels , togglesubscription , Subscribers}