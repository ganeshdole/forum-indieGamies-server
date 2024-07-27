const express = require('express');
const router = express.Router();
const {getLatestThread , getThreadsByCategory, getThreadById , postNewThread, updateThreadById, deleteThread } = require('../controllers/threadsController');


router.get('/', getLatestThread);
router.get("/:categoryId", getThreadsByCategory)
router.get("/thread/:threadId", getThreadById)
router.post("/thread/new", postNewThread)
router.put("/thread/:threadId", updateThreadById)
router.delete("/delete/:threadId", deleteThread)

module.exports = router;    