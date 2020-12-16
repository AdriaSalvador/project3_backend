const express = require('express');
const User = require('../models/User');
const router  = express.Router();

/* GET home page */
router.get('/', (req, res, next) => {
  res.send('Home');
});

router.post('/favoritos', (req, res)=>{
  User.findByIdAndUpdate(req.body.userID, {$push: {favoritos: req.body.gameID}})
  .then((result)=>{
    console.log(result)
  })
  .catch((err)=>{
    console.log(err)
  })
})

router.get('/getUser/:id', (req, res)=>{
  User.findById(req.params.id)
  .then((result)=>{
    res.send(result)
  })
  .catch((err)=>{
    console.log(err)
  })
})

router.post('/deleteFavGame/:id', (req, res, next) => {
  console.log(req.params.id)

  // The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
  User.findByIdAndUpdate(req.body.userID, {$pull: {favoritos: req.params.id}})
      .then((result) => {
              console.log(result)
          })
      .catch((err) => {
              console.log(err)
          })
})

module.exports = router;
