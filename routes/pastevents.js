var express = require('express');
var router = express.Router();

/*GET past event site */
router.get('/', function(req, res, next) {
  res.render('pastevents', { title: 'Past events' });
});
/* GET past events listing. */
router.get('/list', function(req, res) {
    var db = req.db;
    var collection = db.get('pastevents');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});
module.exports = router;
