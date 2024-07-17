const express = require('express')
const {createSuccess } = require('../utils/utils')

const router = express.Router()

router.get("/", (req, res)=>{
    res.send(createSuccess("Hello Gamies!"))
})

module.exports = router;