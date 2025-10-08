const express = require('express')
const app = express()
const port = 3000;

const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const path = require('path');


app.use(express.static(__dirname + "/public"));



app.get('/', (req, res) => {
  res.send('Hello World!')
  res.sendFile(__dirname + "/public/index.html")
})


app.get('/customer-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'customer.html'));
});

app.get('/vendor-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'vendor.html'));
});

app.get('/customer-dashboard' , (req , res) => {
    res.sendFile(path.join(__dirname, 'public', 'customer-dashboard.html'));
})


app.get('/vendor-dashboard' , (req , res) => {
    res.sendFile(path.join(__dirname, 'public', 'vendor-dashboard.html'));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
