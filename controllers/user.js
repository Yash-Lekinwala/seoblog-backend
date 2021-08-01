import User from "../models/user.js";
import Blog from "../models/blog.js";
import _ from 'lodash';
import formidable from 'formidable';
import fs from 'fs';
import { errorHandler } from '../helpers/dbErrorHandler.js';

export const read = (req, res) => {
    req.profile.hashed_password = undefined;
    return res.json(req.profile);
}

export const publicProfile = (req, res) => {
    let username = req.params.username;
    let user, blogs;
    
    User.findOne({username}).exec((err, userFromDB) => {
        if(err || !userFromDB)
        {
            return res.status(400).json({
                error: 'User not found.'
            });
        }
        user = userFromDB;
        let userId = user._id;
        Blog.find({postedBy: userId})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name')
        .limit(10)
        .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
        .exec((err, data) => {
            if(err)
            {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            user.photo = undefined;
            user.hashed_password = undefined;
            res.json({
                user, blogs: data
            })
        })
    })
}

export const update = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtension = true;
    form.parse(req, (err, fields, files) => { 
        console.log(fields);
        if(err)
        {
            return res.status(400).json({
                error: 'Photo could not be uploaded.'
            });
        }

        let user = req.profile;
        console.log(user);
        user = _.extend(user, fields);

        if(fields.password && fields.password.length < 6)
        {
            return res.status(400).json({
                error: 'Password should be 8 characters long.'
            });
        }

        if(files.photo)
        {
            if(files.photo.size > 10000000)
            {
                return res.status(400).json({
                    error: 'Image size should be less than 1mb.'
                });
            }

            user.photo.data = fs.readFileSync(files.photo.path);
            user.photo.contentType = files.photo.type;
        }

        user.save((err, result) => {
            if(err)
            {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            user.hashed_password = undefined;
            user.salt = undefined;
            user.photo = undefined;
            res.json(user);
        })
    })
}

export const photo = (req, res) => {
    const username = req.params.username;
    User.findOne({username}).exec((err, user) => {
        if(err || !user)
        {
            return res.status(400).json({
                error: 'User not found..'
            });
        }

        if(user.photo.data)
        {
            res.set('Content-Type', user.photo.contentType);
            res.send(user.photo.data);
        }
    })
}