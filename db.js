var express = require('express');
var app = express();
app.use(express.static('./public')); // Tất cả Request khách hàng gửi lên thì vào thư mục này

app.set('view engine','ejs');
app.set('views','./views')

var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(1000, function () {
  console.log('Example app listening on port 1000!')
})

// ---- Connect mongodb with mongoose
// 1. require mongoose
const mongoose = require('mongoose');
// 2. connect
mongoose.connect('mongodb://localhost/words');
// 3. tao schema
const wordsSchema = new mongoose.Schema({})
// 4. tao model
const words = mongoose.model('messages', wordsSchema);
// 5. them sua xoa
words.find().exec((error, words) => {
   // console.log(words);
})
// ---- End connect mongodb with mongoose

io.on('connection', function(socket){ /* connection là lắng nghe sự kiện người dùng kết nối lên server*/
  console.log('- Có người vừa kết nối tới SERVER ' + socket.id);

  socket.on('client-search', function(value_search) {
    var rs_words = [];
    words.find({ 'romaji': {'$regex': value_search} }, function (err, rs_words) {
        if (rs_words!='') {
          console.log('Có dữ liệu');
          console.log(rs_words);
          socket.emit('server-result-search', rs_words);
        }
        else {
          console.log('Không có dữ liệu');
          socket.emit('server-result-search-empty');
        }
    }); //

  }); //----------------


  socket.on('client-send-keyword', function(value_keyword) {
    var rs_keyword = [];
    words.find({ 'romaji': {'$regex': value_keyword} }, function (err, rs_keyword) {
        if (rs_keyword!='') {
          console.log('Có dữ liệu');
          console.log(rs_keyword);
          socket.emit('server-result-search-keyword', rs_keyword);
        }
        else {
          console.log('Không có dữ liệu');
          socket.emit('server-result-search-empty');
        }
    }); //

  }); //----------------




});

/*
Emit là phát tín hiệu
On là lắng nghe

io.sockets.emit -- đứng từ phía server, câu lệnh này giúp trả tín hiệu cho tất cả người kết nối
socket.emit -- server chỉ trả về tín hiệu cho người tác gửi
socket.broadcast.emit -- server trả tín hiệu về cho tất cả ngoại trừ người gửi
io.to('socket_id').emit();
*/

app.get('/', function(req, res) {
  res.render('index');
})
