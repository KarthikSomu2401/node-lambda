import express from "express";
import Crud from "em-crud";

import Note from "../model/note.js";

const router = express.Router();

router.use("note", Crud({ className: Note }));

export default router;
