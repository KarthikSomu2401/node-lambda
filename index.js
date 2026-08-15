import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

import router from "./app/router/router.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());

let url = process.env.MONGODB_URI;
mongoose.connect(url).then(() => console.log("DB connection went successful!"));

app.use("/", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

