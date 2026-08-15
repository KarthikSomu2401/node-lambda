import express from "express";
import mongoose from "mongoose";

import router from "./app/router/router.js";

const app = express();

let url = process.env.MONGODB_URI;
mongoose.connect(url).then(() => console.log("DB connection went successful!"));

app.use("/", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
