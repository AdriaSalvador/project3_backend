const express = require('express');
const User = require('../models/User');
const router  = express.Router();

/* GET home page */
router.get('/', (req, res, next) => {
  res.send('Home');
});

/* Crear Usuario Nuevo */
router.get('/new-user', (req, res)=>{
  User.create(req.body)
  .then((result)=>{
    res.send(result)
  })
  .catch((err)=>{
    res.send(err)
  })
})

module.exports = router;
