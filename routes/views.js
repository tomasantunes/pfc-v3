var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

router.get('/home', (req, res) => {
  console.log(req.session.isLoggedin);
  if(req.session.isLoggedIn) {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  }
  else {
    res.redirect('/login');
  }
});

router.get('/bpi', (req, res) => {
  if(req.session.isLoggedIn) {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  }
  else {
    res.redirect('/login');
  }
});

router.get('/paypal', (req, res) => {
  if(req.session.isLoggedIn) {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  }
  else {
    res.redirect('/login');
  }
});

router.get('/trading212', (req, res) => {
  if(req.session.isLoggedIn) {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  }
  else {
    res.redirect('/login');
  }
});

router.get('/coinbase', (req, res) => {
  if(req.session.isLoggedIn) {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  }
  else {
    res.redirect('/login');
  }
});

router.get('/binance', (req, res) => {
  if(req.session.isLoggedIn) {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  }
  else {
    res.redirect('/login');
  }
});

router.get('/polymarket', (req, res) => {
  if(req.session.isLoggedIn) {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  }
  else {
    res.redirect('/login');
  }
});

router.get('/santander', (req, res) => {
  if(req.session.isLoggedIn) {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  }
  else {
    res.redirect('/login');
  }
});

router.get('/savings', (req, res) => {
  if(req.session.isLoggedIn) {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  }
  else {
    res.redirect('/login');
  }
});

router.get('/revolut', (req, res) => {
  if(req.session.isLoggedIn) {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  }
  else {
    res.redirect('/login');
  }
});

module.exports = router;