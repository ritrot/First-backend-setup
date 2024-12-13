// require('dotenv').config();

import dotenv from "dotenv"
import dbconnect from "./db/index.js";
import app from "./app.js";
dotenv.config()

dbconnect()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log("App is listning");
        })
    })
    .catch((err) => {
        console.log("error is found =", err);
    })