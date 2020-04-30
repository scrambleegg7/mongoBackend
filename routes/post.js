const express = require('express')
const { getPosts, createPost, postsByUser, postById, isPoster, deletePost, updatePost, 
        findByIdAndUpdatePost, 
        comment, uncomment, 
        commentTest, 
        findTest
        } = require('../controllers/post_json')
const {createPostValidator} = require("../validator")

const { requireSignin } = require('../controllers/auth');
const { userById } = require('../controllers/user');


const router = express.Router()



router.get('/posts', requireSignin,  getPosts);
router.post('/post/new/:userId',  
                requireSignin,
                createPost,
                createPostValidator);
router.get('/posts/by/:userId',  
                requireSignin,
                postsByUser,);

router.get('/post/comment/get', requireSignin,  findTest);

router.put("/post/comment/update", requireSignin, comment);
                

router.delete("/post/:postId", requireSignin,  isPoster, deletePost);
router.put("/post/:postId", requireSignin,  isPoster, updatePost);
router.put("/post/update/:postId", requireSignin,  isPoster, findByIdAndUpdatePost);

// comments
//router.put('/post/comment', requireSignin, comment);


//router.put('/post/updatecomment', requireSignin, updateComment);

//router.put('/post/comment/:postId', requireSignin, comment);

router.param("userId", userById);

router.param("postId", postById);


module.exports = router;
