var mongoose = require('mongoose');

var KategoriesSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String
    }

});

var Kategories = module.exports = mongoose.model('Kategories', KategoriesSchema);