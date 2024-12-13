import express, { json } from "express"
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"))
app.use(cookieParser())

//Routes

import userRouter from "./routes/user.routes.js"
import subscriptionRoute from "./routes/subscription.routes.js"

app.use("/api/v1/user" , userRouter);
app.use("/api/v1/subscription" , subscriptionRoute)



export default app;
