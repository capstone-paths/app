const oauth = require('../models/oauth');
const express = require('express');
const router = express.Router();
const utils = require('../utils');
const User = require('../models/User');


router.use((req, res, next)=>{
  res.set({
    'Access-Control-Allow-Origin':'*', // Allow AJAX access from any domain
    'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,OPTIONS',// Allow methods for 'preflight'
    'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Headers',// Allow headers for 'preflight
  });

  if(req.method == 'OPTIONS'){// if this is a preflight, we're done and can send the response with our headers
    return res.status(200).end();
  }
  next();
})


router.post('/signup',(req, res)=>{
  oauth.signUp(req.body.name, req.body.email, req.body.password)
    .then((user)=>{

      let params = {
        userID: user.id,
        firstname: '',
        lastname: '',
        username: user.name,
        email: user.username,
        bio: ''
      }
      const neo4j_user = new User(params);
      const session = utils.getDBSession(req);
      neo4j_user.signup(session);

      res.status(201).json(user);
    })
    .catch((err)=>{
      res.status(400).json({error: err.message})
    })
})


router.post('/signin',(req, res)=>{
  oauth.signIn(req.body.username, req.body.password)
    .then((user)=>{
      res.json(user)
    })
    .catch((err)=>{
      res.status(401).json({error: err.message})
    })
})


router.delete('/delete',(req, res)=>{
  oauth.deleteUser(req.body.username, req.body.password)
    .then((user)=>{
      res.json(user)
    })
    .catch((err)=>{
      res.status(401).json({error: err.message})
    })
})


router.put('/changepassword',(req, res)=>{
  oauth.changePassword(req.body.username, req.body.prev_password, req.body.new_password)
    .then((user)=>{
      res.status(200).end();
    })
    .catch((err)=>{
      res.status(401).json({error: err.message})
    })
})


router.put('/forgotpassword', (req, res)=>{
  oauth.forgotPassword(req.body.username)
    .then((user)=>{
      res.status(200).end()
    })
    .catch((err)=>{
      res.status(400).end()
    })
})


router.put('/confirmforgotpassword', (req, res)=>{
  oauth.confirmForgotPassword(req.body.username, req.body.new_password, req.body.code)
    .then((user)=>{
      res.status(200).end()
    })
    .catch((err)=>{
      res.status(400).end()
    })
})

module.exports = router
