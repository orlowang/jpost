#! javascript

var express = require('express')
var path = require('path')
var _express = express()

_express.use(express.static(path.join(__dirname, '../_web'), ['index']))

var server = _express.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port

  console.log('Jpost listening at http://%s:%s', host, port)
})
