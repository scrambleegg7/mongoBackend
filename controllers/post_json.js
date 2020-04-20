
const Post = require("../models/post");
const formidable = require("formidable");
const fs = require("fs")
const _ = require('lodash');


exports.postById = (req, res, next, id) => {

    Post.findById(id)
    .populate("postedBy", "_id name")
    .exec( (err, post) => {
        if ( err  || !post ) {
            return res.status(400).json(
                {error: err}
            )
        }
        req.post = post;
        next();

    })


};


exports.getPosts = (req, res)  => {

    const posts = Post.find()
    .populate("postedBy", "_id firstname lastname email backgroundColor created")
    .select(
        "_id title body created"
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

exports.createPost = (req, res, next) => {

    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                err: "Image could not be uploaded."
            })
        }
        let post = new Post(fields)
        req.profile.hashed_password = undefined;
        req.profile.salt = undefined;
        post.postedBy = req.profile

        console.log("createPost (post_json / controllers / user profile)", req.profile)
        console.log("createPost (post_json / controllers / post )", post)

        if (files.photo) {
            post.photo.data = fs.readFileSync(files.photo.path)
            post.photo.contentType = files.photo.type
        }

        post.save((err, result) => {
            if (err) {
                return res.status(400).json(
                    { error: err}
                );
            }
            res.json(result);
        })

    })
}

exports.postsByUser = (req, res) => {
    
    Post.find( 
        {postedBy: req.profile._id} 
        )
        .populate("postedBy", "_id name")
        .sort("created")
        .exec( (err, posts) => {
            if ( err ) {
                return res.status(400).json(
                    {error: err}
                )
            }
            res.json(posts)

        })

};

exports.isPoster = (req, res, next) => {

    let isPoster = req.post && req.auth && req.post.postedBy._id == req.auth._id;

    console.log("req.auth", req.auth._id)
    console.log("req.post.postedBy._id", req.post.postedBy._id)
    console.log("Posted content", req.post)

    if (!isPoster) {
        return res.status(403).json({
            error: "User is NOT authorized."
        })
    }
    next();

}

exports.deletePost = (req, res) => {
    let post = req.post;
    post.remove( (err, post) => {

        if (err) {
            return res.status(400).json({
                error: err
            })
        }
        res.json({
            message: "successfully removed"
        })
    });
};

exports.updatePost = (req, res, next) => {

    let post = req.post;
    post = _.extend(post, req.body);
    post.updated = Date.now();
    post.save( (err) => {

        if (err) {
            return res.status(400).json({
                error: "Post updated is failed. You are not authorized to perform."
            })
        }
        res.json(post)

    })
    
};