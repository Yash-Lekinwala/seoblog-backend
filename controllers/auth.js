import User from "../models/user.js";
import Blog from '../models/blog.js';
import shortId from 'shortid';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import { errorHandler } from "../helpers/dbErrorHandler.js";
import { sendEmailWithNodemailer } from "../helpers/email.js";
import _ from 'lodash';
import {OAuth2Client} from 'google-auth-library';

export const preSignup = (req, res) => {
    const {name, email, password} = req.body;
    User.findOne({email: email.toLowerCase()}).exec((err, user) => {
        if(user)
        {
            return res.status(400).json({
                error: 'Email already taken!'
            });
        }

        const token = jwt.sign({name, email, password}, process.env.JWT_ACC_ACT, {expiresIn: '1h', algorithm: 'HS256'});

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Account Activation Link - ${process.env.APP_NAME}`,
            html: `
                <p>Please user following link to activate your account:</p>
                <p>${process.env.CLIENT_URL}/auth/account/activate/${token}</p>
                <hr/>
                <p>This email may contain sensitive information</p>`
        };

        sendEmailWithNodemailer(req, res, emailData).then(sent => {
            return res.json({
                message: `Email has been sent to ${email}. Kindly follow the given instructions. Link will be active for 1 hour.`
            });
        });
    });
}

// export const signup = (req, res) => {
//     User.findOne({email: req.body.email}).exec((err, user) => {
//         if(user)
//         {
//             return res.status(400).json({
//                 error: 'Email already taken!'
//             });
//         }

//         const {name, email, password} = req.body;
//         let username = shortId.generate();
//         let profile = `${process.env.CLIENT_URL}/profile/${username}`;

//         let newUser = new User({name, email, password, profile, username});
//         newUser.save((err, success) => {
//             if(err)
//             {
//                 return res.status(400).json({
//                     error: err
//                 });
//             }

//             res.json({
//                 message: 'Signup Success! Please SignIn.'
//             });
//         });
//     });
// };

export const signup = (req, res) => {
    const token = req.body.token;
    if(token)
    {
        jwt.verify(token, process.env.JWT_ACC_ACT, function(err, decoded) {
            if(err)
            {
                return res.status(401).json({
                    error: 'Expired Link. Sign Up Again.'
                })
            }

            const {name, email, password} = jwt.decode(token);
            let username = shortId.generate();
            let profile = `${process.env.CLIENT_URL}/profile/${username}`;

            let newUser = new User({name, email, password, profile, username});
            newUser.save((err, success) => {
                if(err)
                {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }

                res.json({
                    message: 'Signup Success! Please SignIn.'
                });
            });
        })
    }
    else
    {
        return res.status(400).json({
            error: 'Something Went Wrong. Try Again.'
        });
    }
}

export const signin = (req, res) => {
    const {email, password} = req.body;
    // check if user exist
    User.findOne({email}).exec((error, user) => {
        if(error || !user)
        {
            return res.status(400).json({
                error: 'No user found with this email.'
            });
        }
        //authenticate
        if(!user.authenticate(password))
        {
            return res.status(400).json({
                error: 'Email and Password dont match.'
            });
        }
        //generate jwt and send a client
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d', algorithm: 'HS256'});

        res.cookie('token', token, {expiresIn: '1d'});

        const {_id, username, name, email, role} = user;

        return res.json({
            token, user: {_id, username, name, email, role}
        });
    });
};

export const signout = (req, res) => {
    res.clearCookie("token");
    res.json({
        message: 'Signout Success'
    });
};

export const requireSignIn = (req, res, next) => {
    // expressJwt({secret: process.env.JWT_SECRET});
    if(req.headers.authorization)
    {
        const token = req.headers.authorization.split(" ")[1];
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
    }
    else{
        res.status(400).json({message: "Authorization Required."});
    }
    next();
};

export const authMiddileware = (req, res, next) => {
    const authUserId = req.user._id;
    User.findById({_id: authUserId}).exec((err, user) => {
        if(err || !user)
        {
            return res.status(400).json({
                error: 'User Not Found'
            })
        }
        req.profile = user;
        next();
    })
};

export const adminMiddileware = (req, res, next) => {
    const adminUserId = req.user._id;
    User.findById({_id: adminUserId}).exec((err, user) => {
        if(err || !user)
        {
            return res.status(400).json({
                error: 'User Not Found'
            })
        }

        if(user.role !== 1)
        {
            return res.status(400).json({
                error: 'Admin resource. Access Denied'
            })
        }

        req.profile = user;
        next();
    })
};

export const canUpdateDeleteBlog = (req, res, next) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({slug}).exec((err, data) => {
        if(err)
        {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if(!authorizedUser)
        {
            return res.status(400).json({
                error: 'You are not authorized.'
            });
        }
        next();
    })
}

export const forgotPassword = (req, res) => {
    const {email} = req.body;

    User.findOne({email}, (err, user) => {
        if(err || !user)
        {
            return res.status(400).json({
                error: 'User with this email not exist.'
            });
        }

        const token = jwt.sign({_id: user._id}, process.env.JWT_RESET_PASSWORD, {expiresIn: '10m'});

        // email
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Password Reset Link - ${process.env.APP_NAME}`,
            html: `
                <p>Please user following link to reset your password:</p>
                <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                <hr/>
                <p>This email may contain sensitive information</p>`
        };

        return user.updateOne({resetPasswordLink: token}, (err, success) => {
            if(err)
            {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            else
            {
                sendEmailWithNodemailer(req, res, emailData).then(sent => {
                    return res.json({
                        message: `Email has been sent to ${email}. Kindly follow the given instructions. Link will be active for 10 minutes.`
                    });
                });
            }
        });
    });
}

export const resetPassword = (req, res) => {
    const {resetPasswordLink, newPassword} = req.body;
    
    if(resetPasswordLink)
    {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function (err, decoded) {
            if(err)
            {
                return res.status(401).json({
                    error: 'Expired Link. Try Again.'
                });
            }
            User.findOne({resetPasswordLink}, (err, user) => {
                if(err || !user)
                {
                    return res.status(401).json({
                        error: 'Something went wrong. Try Later.'
                    });
                }
                const updatedFields = {password: newPassword, resetPasswordLink: ''};

                user = _.extend(user, updatedFields);

                user.save((err, result) => {
                    if(err)
                    {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    }
                    res.json({
                        message: `Great! Now you can login with new password.`
                    })
                })
            })
        })
    }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = (req, res) => {  
    const idToken = req.body.tokenId;
    client.verifyIdToken({idToken, audience: process.env.GOOGLE_CLIENT_ID}).then(response => {
        // console.log(response);
        const {email_verified, name, email, jti} = response.payload;
        if(email_verified)
        {
            User.findOne({email}).exec((err, user) => {
                if(user)
                {
                    // console.log(user);
                    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'});
                    res.cookie('token', token, {expiresIn: '1d'});
                    const {_id, email, name, role, username} = user;
                    return res.json({token, user: {_id, email, name, role, username}});
                }
                else
                {
                    let username = shortId.generate();
                    let profile = `${process.env.CLIENT_URL}/profile/${username}`;
                    let password = jti + process.env.JWT_SECRET;
                    user = new User({name, email, profile, username, password});
                    user.save((err, data) => {
                        if(err)
                        {
                            return res.status(400).json({
                                error: errorHandler(err)
                            })
                        }
                        const token = jwt.sign({_id: data._id}, process.env.JWT_SECRET, {expiresIn: '1d'});
                        res.cookie('token', token, {expiresIn: '1d'});
                        const {_id, email, name, role, username} = data;
                        return res.json({token, user: {_id, email, name, role, username}});
                    })
                }
            })
        }
        else
        {
            return res.status(400).json({
                error: 'Google login Failed. Try Again.'
            })
        }
    })
}