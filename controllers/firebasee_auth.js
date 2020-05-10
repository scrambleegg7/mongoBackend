const jwt = require('jsonwebtoken');
require('dotenv').config();
const expressJwt = require('express-jwt');
const User = require('../models/user');
const _ = require('lodash');
const { OAuth2Client } = require('google-auth-library');
const { sendEmail } = require('../helpers');


//  firebases settings
const { admin } = require('../config/fbConfig')

const actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for
    // this URL must be whitelisted in the Firebase Console.
    url: 'http://localhost:3030',
    // This must be true for email link sign-in.
    handleCodeInApp: true,
    //iOS: {
    //  bundleId: 'com.example.ios'
    //},
    //android: {
    //  packageName: 'com.example.android',
    //  installApp: true,
    //  minimumVersion: '12'
    //},
    // FDL custom domain.
    //dynamicLinkDomain: 'coolapp.page.link'
};

const getAuthToken = (req, res, next) => {
    if (req.headers.authorization && 
        req.headers.authorization.split(' ')[0] === "Bearer"
        ) 
    {
        req.authToken = req.headers.authorization.split(' ')[1]
        console.log("*** getAuthToken req.userId from signIn screen --> ", req.authToken)

        console.log()
    }
    else {
        req.authToken = null
    }
    next();
}


exports.signup = async (req, res) => {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists)
        return res.status(403).json({
            error: 'お使いのEmailは登録されています!'
        });
    const user = await new User(req.body);

    console.log("signup req.body data --> ", req.body)

    admin.auth().createUser({
        email : req.body.email,
        password : req.body.password,
        //emailVerified: true,
        displayName: `${req.body.firstName} ${req.body.lastName}`,
    })
    .then(
        (userRecord) => {
            console.log('Successfully created new user (firebase authentication):', userRecord.uid);
            const useremail = req.body.email;
                
            admin.auth().generateEmailVerificationLink(useremail, actionCodeSettings)
            .then((link) => {
              // Construct email verification template, embed the link and send
              // using custom SMTP server.
              //return sendCustomVerificationEmail(useremail, displayName, link);
              const emailData = {
                from: 'noreply@node-react.com',
                to: useremail,
                subject: 'Emailアドレスを有効化します。',
                text: `お使いのEmailを有効化するため下記リンクをクリックしてください。(text): ${link}`,
                html: `<p>お使いのEmailを有効化するため下記リンクをクリックしてください:</p><br/> <p>${link}</p>`
                };
                sendEmail(emailData);

                console.log("** admin.auth().generateEmailVerificationLink --> ",link)
            })
            .catch((error) => {
                console.log("** generateEmailVerification error --> ",error)
              // Some error occurred.
            });
          
        }
    )
    .catch((err) => {
        console.log('Error creating new user:', err);
        return res.status(403).json({
            error: 'firebase admin createuser error!'
        });
    });

    await user.save();
    res.status(200).json({ message: 'Signup success! Please login.' });
};

exports.signin = (req, res) => {
    // find the user based on email
    const { email, password, idToken, uid } = req.body;
    User.findOne({ email }, (err, user) => {
        // if err or no user
        if (err || !user) {
            return res.status(401).json({
                error: 'User with that email does not exist. Please signup.'
            });
        }


        //console.log("** signIn received Token", idToken)
        //admin.auth().createCustomToken(uid)
        //admin.auth().verifyIdToken(idToken)
        //.then( (decodedToken) => {
        //    console.log("** decodedToken from  --> ",decodedToken)
        //})
        //.catch( (error) => {
        //    console.log("verifyIdToken = decodedToken Error --> ", error)
        //    return res.status(403).json({
        //        err: error
        //    });    
        //})        
        // if user is found make sure the email and password match
        // create authenticate method in model and use here
        //if (!user.authenticate(password)) {
        //    return res.status(401).json({
        //        error: 'Email and password do not match'
        //    });
        //}
        // generate a token with user id and secret
// persist the token as 't' in cookie with expiry date
        // retrun response with user and token to frontend client
        
        //admin.auth().createCustomToken("" + _id)        
        //.then( (customToken) => {
        //    console.log("** customToken based in user._id --> ",customToken)
        
        //    console.log("controller auth returned data:", user )    
            // 
            //req.user_model = user
        //})
        //.catch( (error) => {
        //    console.log("customToken Error --> ", error)
        //    return res.status(403).json({
        //        err: error
        //    });    
        //})
        
        //const idToken = customToken;
        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
        const { _id, name, email, role } = user;
        res.cookie('t', token, { expire: new Date() + 9999 });

        return res.json({   token: token, 
                            user: { _id, email, name, role } 
        });

    });
};

exports.signout = (req, res) => {
    res.clearCookie('t');
    return res.json({ message: 'Signout success!' });
};

exports.checkIfAuthenticated = (req, res, next) => {

    getAuthToken(req, res, async () => {
        try {
            const { authToken, user_model } = req;
            const decodedToken = await admin.auth().verifyIdToken(authToken);


            console.log("*** checkAuthentication decodedToken", decodedToken)
            if (decodedToken.uid) {
                req.auth = user_model
                //console.log("** req.auth --> ", )
                return next()
            }

            return new Error("** Unauthorized from checkIfAuthenticated.")
        } 
        catch (e) {
            return res.status(401).json({
                error: '** Unauthorized checkIfAuthenticated!'
            })
        }
    })

    //return next();
    //return res.send({error : "error "})
}


exports.requireSignin = expressJwt({

    // if token is validated, expressjwt appends into verfied user 
    secret: process.env.JWT_SECRET,
    userProperty: 'auth'
});



exports.forgotPassword = (req, res) => {
    if (!req.body) return res.status(400).json({ message: 'No request body' });
    if (!req.body.email) return res.status(400).json({ message: 'No Email in request body' });

    console.log('forgot password finding user with that email');
    const { email } = req.body;
    console.log('signin req.body', email);
    // find the user based on email
    User.findOne({ email }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.status('401').json({
                error: 'User with that email does not exist!'
            });

        // generate a token with user id and secret
        const token = jwt.sign({ _id: user._id, iss: process.env.APP_NAME }, process.env.JWT_SECRET);

        // email data
        const emailData = {
            from: 'noreply@node-react.com',
            to: email,
            subject: 'Password Reset Instructions',
            text: `Please use the following link to reset your password: ${
                process.env.CLIENT_URL
            }/reset-password/${token}`,
            html: `<p>Please use the following link to reset your password:</p> <p>${
                process.env.CLIENT_URL
            }/reset-password/${token}</p>`
        };

        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if (err) {
                return res.json({ message: err });
            } else {
                sendEmail(emailData);
                return res.status(200).json({
                    message: `Email has been sent to ${email}. Follow the instructions to reset your password.`
                });
            }
        });
    });
};

// to allow user to reset password
// first you will find the user in the database with user's resetPasswordLink
// user model's resetPasswordLink's value must match the token
// if the user's resetPasswordLink(token) matches the incoming req.body.resetPasswordLink(token)
// then we got the right user

exports.resetPassword = (req, res) => {
    const { email, newPassword } = req.body;
    //console.log("resetPassword body -> ",email, newPassword)
    //User.findOne({ resetPasswordLink }, (err, user) => {

    User.findOne({ email }, (err, user) => {
        // if err or no user

        if (err || !user)
            return res.status('401').json({
                error: 'Invalid Link!' + ":" + err
            });

        console.log("** resetPassword findOne with resetPasswordLink -> ", user)
        const updatedFields = {
            password: newPassword,
            //resetPasswordLink: ''
        };

        user = _.extend(user, updatedFields);
        user.updated = Date.now();

        user.save((err) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json({
                message: `Great! Now you can login with your new password.`
            });
        });
    });
};

const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);

exports.socialLogin = async (req, res) => {
    const idToken = req.body.tokenId;
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.REACT_APP_GOOGLE_CLIENT_ID });
    // console.log('ticket', ticket);
    const { email_verified, email, name, picture, sub: googleid } = ticket.getPayload();

    if (email_verified) {
        console.log(`email_verified > ${email_verified}`);

        const newUser = { email, name, password: googleid };
        // try signup by finding user with req.email
        let user = User.findOne({ email }, (err, user) => {
            if (err || !user) {
                // create a new user and login
                user = new User(newUser);
                req.profile = user;
                user.save();
                // generate a token with user id and secret
                const token = jwt.sign({ _id: user._id, iss: process.env.APP_NAME }, process.env.JWT_SECRET);
                res.cookie('t', token, { expire: new Date() + 9999 });
                // return response with user and token to frontend client
                const { _id, name, email } = user;
                return res.json({ token, user: { _id, name, email } });
            } else {
                // update existing user with new social info and login
                req.profile = user;
                user = _.extend(user, newUser);
                user.updated = Date.now();
                user.save();
                // generate a token with user id and secret
                const token = jwt.sign({ _id: user._id, iss: process.env.APP_NAME }, process.env.JWT_SECRET);
                res.cookie('t', token, { expire: new Date() + 9999 });
                // return response with user and token to frontend client
                const { _id, name, email } = user;
                return res.json({ token, user: { _id, name, email } });
            }
        });
    }
};

// exports.socialLogin = (req, res) => {
//     console.log('social login req.body', req.body);

// // try signup by finding user with req.email
// let user = User.findOne({ email: req.body.email }, (err, user) => {
//     if (err || !user) {
//         // create a new user and login
//         user = new User(req.body);
//         req.profile = user;
//         user.save();
//         // generate a token with user id and secret
//         const token = jwt.sign({ _id: user._id, iss: process.env.APP_NAME }, process.env.JWT_SECRET);
//         res.cookie('t', token, { expire: new Date() + 9999 });
//         // return response with user and token to frontend client
//         const { _id, name, email } = user;
//         return res.json({ token, user: { _id, name, email } });
//     } else {
//         // update existing user with new social info and login
//         req.profile = user;
//         user = _.extend(user, req.body);
//         user.updated = Date.now();
//         user.save();
//         // generate a token with user id and secret
//         const token = jwt.sign({ _id: user._id, iss: process.env.APP_NAME }, process.env.JWT_SECRET);
//         res.cookie('t', token, { expire: new Date() + 9999 });
//         // return response with user and token to frontend client
//         const { _id, name, email } = user;
//         return res.json({ token, user: { _id, name, email } });
//     }
// });
// };
