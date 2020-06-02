
const Post = require("../models/post");
const formidable = require("formidable");
const fs = require("fs")
const _ = require('lodash');


exports.postById = (req, res, next, id) => {

    Post.findById(id)
    .populate("postedBy", "_id firstname lastname email created")
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

    console.log("getPosts...")

    const posts = Post.find()
//    .populate("comments", "text created")
    .populate("comments.postedBy", "_id firstname lastname email backgroundColor")
    .populate("postedBy", "_id firstname lastname email backgroundColor created")
    
    .sort({ created: -1 })
    
    .select(
        "_id title body created updated confirmed comments photo"
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
        console.log("createPost (post_json / controllers / post )", files)


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


exports.mytest = (req, res, next) => {

    console.log("*** mytest.......")
    next();
}

exports.isPoster = (req, res, next) => {

    console.log("*** isPoster begins......", req.post.postedBy._id)
    let isPoster = req.post && req.auth && req.post.postedBy._id == req.auth._id;

    console.log("req.auth (isPoster/post_json/controllers) : ", req.auth._id)
    console.log("req.post.postedBy._id (isPoster/post_json/controllers) : ", req.post.postedBy._id)
    console.log("Posted content (isPoster/post_json/controllers) : ", req.post)

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
            console.log("** deletePost Error -->" , err)
            return res.status(400).json({
                error: err
            })
        }
        res.json(post)
    });
};

exports.updatePost = (req, res, next) => {

    // save post
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Photo could not be uploaded'
            });
        }

        console.log("updatePost : request post --> ", req.post)
        // save post
        let post = req.post;
        post = _.extend(post, fields);
        post.updated = Date.now();

        if (files.photo) {
            post.photo.data = fs.readFileSync(files.photo.path);
            post.photo.contentType = files.photo.type;
        }

        post.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json(post);
        });
    });

    
};

exports.findByIdAndUpdatePost = (req, res, next) => {

    // save post
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Photo could not be uploaded'
            });
        }

        console.log("findByIdAndUpdatePost : request post --> ", req.post)
        // save post
        let post = req.post;
        post = _.extend(post, fields);
        post.updated = Date.now();

        if (files.photo) {
            post.photo.data = fs.readFileSync(files.photo.path);
            post.photo.contentType = files.photo.type;
        }

        post.save((err, result) => {

            Post.findById( post._id)
            .populate("comments.postedBy", "_id firstname lastname email backgroundColor")
            .populate("postedBy", "_id firstname lastname email backgroundColor created")
            .select(
                "_id title body created updated confirmed comments"
                //"_id title body created updated confirmed "
            )
            .exec( (err, result) => {
                if ( err  || !post ) {
                    return res.status(400).json(
                        {error: err}
                    )
                }
                res.json(result);
            });
        });

    
    });

}


exports.findTest = (req, res, next) => {

    const posts = Post.find()

    .populate("comments.postedBy", "_id firstname lastname email")
    .populate("postedBy", "_id firstname lastname email")
    .sort({ created: -1 })
    
    .select(
        "_id title body created updated confirmed comments"
    )

    .exec((err,result) => {
        if (err) {
            return res.status(400).json(
                {error: err}
            );
        }
        else {
            res.json(result)
        }
    });


}


exports.comment = (req, res) => {

    let comment = req.body.comment
    comment.postedBy = req.body.userId;

    console.log("comment", comment)

    Post.findByIdAndUpdate(
        req.body.postId ,
        { $push: { comments: comment } },
        { new : true}
    )

    .populate("comments.postedBy", "_id firstname lastname email backgroundColor")
    .populate("postedBy", "_id firstname lastname email backgroundColor created")

    .exec((err,result) => {
        if (err) {
            return res.status(400).json(
                {error: err}
            );
        }
        else {
            res.json(result)
        }
    });
}


exports.uncomment = (req, res) => {

    let comment = req.body.comment
    //comment.postedBy = req.body.userId;

    console.log("comment to be deleted.", comment)

    Post.findByIdAndUpdate(
        req.body.postId ,
        
        { $pull: { comments: { _id: comment._id } } }, 
        { new: true }

    )

    .populate("comments.postedBy", "_id firstname lastname email backgroundColor")
    .populate("postedBy", "_id firstname lastname email backgroundColor created")

    .exec((err,result) => {
        if (err) {
            console.log("Error on delete Comment..", err)
            return res.status(400).json(
                {error: err}
            );
        }
        else {
            res.json(result)
        }
    });




}