import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import {Video} from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import mongoose, { Aggregate } from "mongoose";
// import ffmpeg from 'fluent-ffmpeg';


// const getVideoDuration = (videoPath) => {
//     return new Promise((resolve, reject) => {
//         ffmpeg.ffprobe(videoPath, (err, metadata) => {
//             if (err) {
//                 return reject(err);
//             }
//             const duration = metadata.format.duration; // duration in seconds
//             resolve(duration);
//         });
//     });
// };




const videoList = asyncHandler(async(req , res)=>{
    //we have to list out every video that user has uploaded and its some other info


})


const uploadVideo = asyncHandler(async(req , res)=>{
    // user will provide video and we have to upload on cloudniry
    // inputs = video , des,title , thumbnail
    //1 take the video file
    const {description , title} = req.body
    const videoLocalPath = req.files?.video[0].path
    let thumbnailLocalPath ;

    if(!description || !title){
        throw new ApiError(400 , "Title and description is required.")
    }
    
    if(!videoLocalPath){
        throw new ApiError(400 , "Video is required.")
    }

    if(req.files?.thumbnail?.length>0){
        thumbnailLocalPath = req.files.thumbnail[0].path;
    }

    //2 upload on cloudinry
    const uploaded = await uploadOnCloudinary(videoLocalPath)
    const imageuploaded = await uploadOnCloudinary(thumbnailLocalPath);

    
    if(!uploaded ){
        throw new ApiError(400 , "Failed to upload video")
    }
    // const videoduration = await getVideoDuration(videoLocalPath);
    //3 save the url of video on database
    const user = await Video.create({
        videoFile:uploaded.url,
        description,
        title,
        thumbnail:imageuploaded?.url || " "
    })
    console.log("user =" , user);
    

    if(!user){
        throw new ApiError(401 , "The video is not uploaded")
    }

    // const user = User.findByIdAndUpdate(req.user?._id ,
    //     {
    //         $push: { videos: uploaded.url }
    //     }
    //     , { new: true }
    // )

    //4 return the response
    return res
    .status(200)
    .json(
        new ApiResponse(200 , user , "uploaded video.")
    )
})

const deleteVideo = asyncHandler(async(req , res) =>{
    // We have to remove the video from database the user will provide the VideoId
    const videoId = req.params._id;
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404 , "Video not found")
    }
    //1 delete the video from cloudinary


    const deleted =await Video.findByIdAndDelete(videoId);
    

    return res
    .status(200)
    .json(
        new ApiResponse(200 , null , "Video deleted")
    )

})

const getVideo = asyncHandler(async(req , res)=>{
    const videoid = req.params._id;
    const video = await Video.findById(videoid);
    if(!video) {
        throw new ApiError(404, "Video not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200 , video , "Video featched succesfully")
    )
})

const updateVideo = asyncHandler(async(req , res) =>{
    //The user can update the Title , des And Thumbnail
    const {title , description} = req.body
    console.log(title , " " , description);
    const videoid = req.params._id;
    
    const video = await Video.findById(videoid);
    
    if(!video){
        throw new ApiError(404 , "Video not found")
    }
    
    
    video.title = title ;
    video.description = description ;

    const thumbnail =await req.files?.thumbnail[0]?.path;
    if(thumbnail){
        video.thumbnail = thumbnail;
    }
    const updatevideo = await video.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200 , updatevideo , "Video updated succesfully")
    )
})

const togglePublishStatus = asyncHandler(async(req , res)=>{

    const video = await Video.findById(req.params._id)
    if(!video){
        throw new ApiError(404 , "Video not found")
    }
    video.isPublished = !video.isPublished;
    const toggled = await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200 , toggled , "Video published status toggled succesfully")
    )
})

export {uploadVideo , deleteVideo , getVideo ,updateVideo , togglePublishStatus}