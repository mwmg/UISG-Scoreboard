var express = require('express');
var router = express.Router();

/*GET live event site */
router.get('/', function(req, res, next) {
  res.render('liveevents', { title: 'Live events' });
});
/* GET live events listing. */
router.get('/list', function(req, res) {
    var db = req.db;
    var collection = db.get('liveevents');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});
/*GET event site */
router.get('/event/:id',function(req, res) {
	var db = req.db;
    var collection = db.get('liveevents');
    collection.find({'room': req.params.id},{},function(e,docs){
        var sport = docs[0].sport;
        res.render(sport)
    });
});
module.exports = router;
