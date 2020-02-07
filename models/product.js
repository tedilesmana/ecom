var mongoose = require('mongoose');

var ProductSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    desc: {
        type: String
    },
    kategories: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String
    },
    qty: {
        type:Number
    },
},{
    timestamps:true

});


var Product = module.exports = mongoose.model('Product', ProductSchema);