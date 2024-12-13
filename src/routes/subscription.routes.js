import { Router} from "express"
import { subscribedChannels  ,togglesubscription , Subscribers} from "../controller/subscription.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verfiyJWT } from "../middlewares/auth .middleware.js";

const router = Router();

router.route('/subscribed/:_id').get(verfiyJWT , subscribedChannels).post(verfiyJWT , togglesubscription)
router.route('/subscribers/:_id').get(verfiyJWT , Subscribers)

export default router