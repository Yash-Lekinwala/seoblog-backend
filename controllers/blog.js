import Blog from '../models/blog.js';
import Category from '../models/category.js';
import User from '../models/user.js';
import Tag from '../models/tag.js';
import formidable from 'formidable';
import slugify from 'slugify';
import {stripHtml} from 'string-strip-html';
import _ from 'lodash';
import fs from 'fs';
import {errorHandler} from '../helpers/dbErrorHandler.js';
import { smartTrim } from '../helpers/blog.js';

export const create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if(err)
        {
            return res.status(400).json({
                error: 'Image Could Not Upload'
            });
        }

        const {title, body, categories, tags} = fields;

        if(!title || !title.length)
        {
            return res.status(400).json({
                error: 'Title is required.'
            });
        }

        if(!body || body.length < 200)
        {
            return res.status(400).json({
                error: 'Content is too short.'
            });
        }

        if(!categories || categories.length === 0)
        {
            return res.status(400).json({
                error: 'At least one category is required.'
            });
        }

        if(!tags || tags.length === 0)
        {
            return res.status(400).json({
                error: 'At least one tag is required.'
            });
        }

        let blog = new Blog();
        blog.title = title;
        blog.body = body;
        blog.excerpt = smartTrim(body, 320, ' ', ' ...');
        blog.slug = slugify(title).toLowerCase();
        blog.metaTitle = `${title} | ${process.env.APP_NAME}`;
        blog.metaDesc = stripHtml(body.substring(0, 160));
        blog.postedBy = req.user._id;
        
        let arrayofCategories = categories && categories.split(',')
        let arrayofTags = tags && tags.split(',')

        blog.categories = arrayofCategories;
        blog.tags = arrayofTags;

        if(files.photo) 
        {
            if(files.photo.size > 10000000)
            {
                return res.status(400).json({
                    error: 'Image should be less than 1mb in size'
                });
            }
            blog.photo.data = fs.readFileSync(files.photo.path);
            blog.photo.contentType = files.photo.type;
        }

        blog.save((err, result) => {
            if(err)
            {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        })
    })
};

export const list = (req, res) => {
    Blog.find({})
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username')
    .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
    .exec((err, data) => {
        if(err)
        {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    })
}
export const listAllBlogsCategoriesTags = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    let blogs;
    let categories;
    let tags;

    Blog.find({})
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username profile')
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit)
    .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
    .exec((err, data) => {
        if(err)
        {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        blogs = data;
        Category.find({}).exec((err, c) => {
            if(err)
            {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            categories = c;

            Tag.find({}).exec((err, t) => {
                if(err)
                {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                tags = t;

                res.json({blogs, categories, tags, size: blogs.length});
            })
        })
        
    })
}
export const read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({slug})
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username')
    .select('_id title body slug metaTitle metaDesc excerpt categories tags postedBy createdAt updatedAt')
    .exec((err, data) => {
        if(err)
        {
            return res.status(400).json({
                error: err
            });
        }
        res.json(data);
    })
}
export const remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOneAndRemove({slug})
    .exec((err, data) => {
        if(err)
        {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: "Blog Deleted Successfully."
        });
    })
}
export const update = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    
    Blog.findOne({slug})
    .exec((err, oldBlog) => {
        if(err)
        {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        
        form.parse(req, (err, fields, files) => {
            if(err)
            {
                return res.status(400).json({
                    error: 'Image Could Not Upload'
                });
            }
    
            let slugBeforeMerge = oldBlog.slug;

            oldBlog = _.merge(oldBlog, fields);
            oldBlog.slug = slugBeforeMerge;

            const {body, desc, categories, tags} = fields;
    
            if(body)
            {
                oldBlog.excerpt = smartTrim(body, 320, ' ', ' ...');
                oldBlog.metaDesc = stripHtml(body.substring(0,160));
            }
    
            if(categories)
            {
                oldBlog.categories = categories.split(',');
            }
    
            if(tags)
            {
                oldBlog.tags = tags.split(',');
            }
    
            if(files.photo) 
            {
                if(files.photo.size > 10000000)
                {
                    return res.status(400).json({
                        error: 'Image should be less than 1mb in size'
                    });
                }
                oldBlog.photo.data = fs.readFileSync(files.photo.path);
                oldBlog.photo.contentType = files.photo.type;
            }
    
            oldBlog.save((err, result) => {
                if(err)
                {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json(result);
            })
        });
    });
}

export const photo = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Blog.findOne({slug})
    .select('photo')
    .exec((err, blog) => {
        if(err || !blog)
        {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }

        res.set('Content-Type', blog.photo.contentType);
        return res.send(blog.photo.data);
    })
}

export const listRelated = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 3;

    const {_id, categories} = req.body.blog;
    Blog.find({_id: {$ne: _id}, categories: {$in: categories}})
    .limit(limit)
    .populate('postedBy', '_id name username')
    .select('title slug excerpt postedBy createdAt updatedAt')
    .exec((err, blogs) => {
        if(err)
        {
            return res.status(400).json({
                error: 'Blogs not found.'
            });
        }
        res.json(blogs);
    })
}

export const listSearch = (req, res) => {
    console.log(req.query);
    const {search} = req.query;
    if(search)
    {
        Blog.find({
            $or: [{title: {$regex: search, $options: 'i'}}, {body: {$regex: search, $options: 'i'}}]
        }, (err, blogs) => {
            if(err)
            {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(blogs);
        }).select('-photo -blog');
    }
}

export const listByUser = (req, res) => {
    User.findOne({username: req.params.username}).exec((err, user) => {
        if(err)
        {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let userId = user._id;
        Blog.find({postedBy: userId})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username')
        .select('_id title slug excerpt postedBy createdAt updatedAt')
        .exec((err, data) => {
            if(err)
            {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        })
    })
}