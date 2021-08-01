import Category from "../models/category.js";
import Blog from "../models/blog.js";
import slugify from 'slugify';
import { errorHandler } from "../helpers/dbErrorHandler.js";

export const create = (req, res) => {
    const {name} = req.body;
    let slug = slugify(name).toLowerCase();

    let category = new Category({name, slug});

    category.save((err, data) => {
        if(err)
        {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        res.json(data);
    })
};

export const list = (req, res) => {
    Category.find({}).exec((err, data) => {
        if(err)
        {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        res.json(data);
    })
}

export const read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Category.findOne({slug}).exec((err, category) => {
        if(err)
        {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        Blog.find({categories: category})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username')
        .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
        .exec((err, data) => {
            if(err)
            {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json({category, blogs: data});
        });
    })
};

export const remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Category.findOneAndRemove({slug}).exec((err, data) => {
        if(err)
        {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        res.json({message: 'Category Deleted!'});
    })
}