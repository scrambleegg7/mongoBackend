exports.createPostValidator = (req, res, next) => {

    req.check('title', "Write a title").notEmpty()
    req.check('title', 'Title must be between 4 to 150 chars (createPostValidator) ').isLength({
        min:4, 
        max:150
    })

    req.check("body", "Write a body").notEmpty();
    req.check('body', 'Title must be between 4 to 2000 chars (createPostValidator)').isLength({
        min:4, 
        max:2000
    })


    const errors = req.validationErrors();

    if (errors) {
        const firstError = errors.map( (err) => err.msg )[0]
        return res.status(400).json({error:firstError})
    }
    // check for erros

    next();
}

