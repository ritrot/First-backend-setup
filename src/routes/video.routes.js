import { Router} from "express"
import {uploadVideo , deleteVideo , getVideo , updateVideo , togglePublishStatus} from "../controller/video.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verfiyJWT } from "../middlewares/auth .middleware.js";

const router = Router();

router.route('/uploadVideo').post(
    upload.fields([
        {
            name: 'video',
            maxCount: 1
        },
        {
            name: 'thumbnail',
            maxCount:1
        }
    ]) , uploadVideo)

router.route('/deleteVideo/:_id').post(deleteVideo)
router.route('/getVideo/:_id').post(getVideo)
router.route('/updateVideo/:_id').post(upload.single('thumbnail') , updateVideo)
router.route('/togglePublishStatus/:_id').post(togglePublishStatus)



export default router;