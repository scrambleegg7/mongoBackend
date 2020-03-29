
const Post = require("../models/post");
const formidable = require("formidable");
const fs = require("fs")

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

exports.createPost = (req, res, next) => {

    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse( req, (err, fields, files) => {
        if (err) {
            return res.status(400).json( 
                { error: "Error (Image cannot be loaded)"}
            )
        }
        let post = new Post(fields)
        post.postedBy = req.profile
        console.log("CreatePost Profile", req.profile)

        if (files.photo) {
            post.photo.data = fs.readFileSync(files.photo.path)
            post.photo.contentType = files.photo.type
        }

        post.save( (err, result) => {

            if (err) {
                return res.status(400).json(
                    {error: err}
                )
            }
            res.json( result )

        }  )

    })


    const mypost = new Post(req.body);
    console.log("Creating myPost", req.body);

    mypost.save().then( result => {

        res.status(200).json(
            {post: result}
        );
    });

};