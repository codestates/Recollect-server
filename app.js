const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const logger = require('morgan');
const dotenv = require('dotenv');

const routes = require('./routes/index');

dotenv.config();
const PORT = process.env.PORT;

//express 패키지를 호출해서 app 변수 객체를 만들고, 각종 기능 연결
const app = express();

//app.use를 통해서 익스프레스에 미들웨어를 연결
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//TODO: 환경설정 필요 
app.use(
  session({
  secret: '@collecting',
  resave: false,
  saveUninitialized: true
}));
app.use(cookieParser());
const corsOptions = {
  origin: true,
  Credential: true,
  Methods: ['GET', 'POST', 'OPTIONS'],
}
app.use(cors(corsOptions));


//TODO: 라우팅 분기-controller 함수랑 연결 필요
app.use('/', routes);


module.exports = app.listen(PORT, () => {
  console.log(`🚀 Server is starting on ${PORT}`);
});