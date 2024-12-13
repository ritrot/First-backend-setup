import { Router} from "express"
import { refreshaccesstoken, register, userlogin, userlogout ,changeCurrentPassword , getCurrentUser , updateAccountDetails , updateAvatar , updateCoverImage ,watchHistory,getChannelProfile} from "../controller/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verfiyJWT } from "../middlewares/auth .middleware.js";

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ])
    
    ,register);

router.route('/login').post(userlogin);

//secured routes
router.route('/logout').post(verfiyJWT , userlogout);
router.route('/refresh-accesstoken').post(refreshaccesstoken);
router.route('/changepassword').post(verfiyJWT ,changeCurrentPassword);
router.route('/getcurrentuser').post(verfiyJWT ,getCurrentUser);
router.route('/updateaccountdetails').post(verfiyJWT ,updateAccountDetails);
router.route('/updateavatar').post(upload.single("avatar") ,updateAvatar);
router.route('/updatecoverimage').post(upload.single("coverImage") ,updateCoverImage);
router.route('/refreshaccesstoken').post(refreshaccesstoken);
router.route('/c/:username').get(verfiyJWT,getChannelProfile);
router.route('/history').get(verfiyJWT , watchHistory)


export default router ;


//here we are inserting a upload middlerware 
// what happens is when we hit at the address before going to controller this upload middelware is excuted
// what it does it takes fields as input to store the file 
// Multer is basically used to handale the files becuse mdb only handels the text files
// so basically we to handle the image and coverimage we are using the multer
// in logout the verifyJWT is middeleware and userlogout is controller
