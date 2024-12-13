import { v2 as cloudinary } from 'cloudinary';
import fs, { unlinkSync } from "fs"


//why not env ?
cloudinary.config({
    cloud_name: "danw1yrjm" ,
    api_key: "635461316387877",
    api_secret: "52NjBXRMQzs7eB-hxNVfuUBRj44"
});

const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if (!localFilePath) {
            return null;
        }
        const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type:"auto"
        })
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null
    }
}

export {uploadOnCloudinary}



// import { v2 as cloudinary } from 'cloudinary';
// import fs from 'fs/promises';  // Using promises for async file operations

// cloudinary.config({
//     cloud_name: "danw1yrjm" ,
//     api_key: "635461316387877",
//     api_secret: "52NjBXRMQzs7eB-hxNVfuUBRj44"
// });

// const uploadOnCloudinary = async (localFilePath) => {
//     try {
//         if (!localFilePath) {
//             throw new Error("File path is required");
//         }

//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto"
//         });

//         // Clean up local file after successful upload
//         // await fs.unlink(localFilePath);
        
//         return response;
//     } catch (error) {
//         console.error("Error uploading to Cloudinary:", error.message);

//         // Clean up local file on error
//         if (localFilePath) {
//             await fs.unlink(localFilePath);
//         }

//         throw new Error("Upload to Cloudinary failed");
//     }
// };

// export { uploadOnCloudinary };
