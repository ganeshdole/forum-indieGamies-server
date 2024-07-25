const express = require('express')
const {createSuccess } = require('../utils/utils')
const router = express.Router()

router.get("/", async (req, res)=>{
    res.send(createSuccess("Hello Gamies!"))
})

module.exports = router;