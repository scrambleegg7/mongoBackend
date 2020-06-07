const express = require('express')
const { getPosts, createPost, postsByUser, postById, isPoster, deletePost, updatePost, 
        findByIdAndUpdatePost, 
        comment, uncomment, 
        commentTest, photo, 
        findTest
        } = require('../controllers/post_json')
const {createPostValidator} = require("../validator")


const { requireSignin, checkIfAuthenticated } = require('../controllers/firebasee_auth');
const { userById } = require('../controllers/user');


const router = express.Router()



router.get('/posts', requireSignin,  getPosts);
//router.get('/posts', checkIfAuthenticated,  getPosts);

router.post('/post/new/:userId',  
                requireSignin,
                createPost,
                createPostValidator);
router.get('/posts/by/:userId',  
                requireSignin,
                postsByUser,);

router.get('/post/comment/get', requireSignin,  findTest);

router.put("/post/comment/update", requireSignin, comment);

router.put('/post/comment/uncomment', requireSignin, uncomment);

//router.delete("/post/:postId", checkIfAuthenticated, mytest,  isPoster, deletePost);
router.delete("/post/:postId", requireSignin,  isPoster, deletePost);

router.put("/post/:postId", requireSignin,  isPoster, updatePost);
router.put("/post/update/:postId", requireSignin,  isPoster, findByIdAndUpdatePost);


// photo
router.get('/post/photo/:postId', photo);



router.param("userId", userById);

router.param("postId", postById);


module.exports = router;
