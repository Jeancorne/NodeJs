const express = require('express');
const router = express.Router();
const auth = require('../helpers/auth')

router.get('/about', function(req, res) {
    res.render('../views/partials/about');
})

router.get('/index', auth.isNotAuthenticated, function(req, res) {
    //res.render('../views/partials/index');
     res.render('../Portal/index',{layout: 'Index_menu' } );
})
//http://demo.devitems.com/asbab/index.html

module.exports = router;
