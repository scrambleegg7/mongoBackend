const express = require('express')
const { getPosts, createPost } = require('../controllers/post_json')
const validator = require("../validator")

const router = express.Router()

router.get('/', getPosts);
router.post('/post',   validator.createPostValidator,   createPost);

module.exports = router;
