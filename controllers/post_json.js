
const Post = require("../models/post");

exports.getPosts = (req, res)  => {

    const posts = Post.find(  

    )
    .select(
        "_id title body"
    )
    .then( (posts) => {
        res.status(200).json(
            {posts: posts}
        )
    })
    .catch(
        err => console.log("getPosts error:",err)
    )

};

exports.createPost = (req, res) => {
    const mypost = new Post(req.body);
    console.log("Creating myPost", req.body);

    mypost.save().then( result => {

        res.status(200).json(
            {post: result}
        );
    });

};