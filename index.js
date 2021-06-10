const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const dotenv = require('dotenv');
const https = require('https');
const { sequelize }  = require('./models/index');

dotenv.config();
const PORT = process.env.PORT;
const app = express();

//TODO: Sequelize 모델 싱크 맞추기

sequelize.sync({ force: false }).then(() => {
  console.log('DB 연결 성공')
}).catch((err) => {
  console.error(err);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const corsOptions = {
  origin: true,
  Credential: true,
  Methods: ['GET', 'POST', 'OPTIONS'],
}
app.use(cors(corsOptions));



//TODO: 라우팅 분기-controller 함수랑 연결 필요


//TODO: https서버로 만들기 위해서 공인,사설키 발급 어떻게 할 것 인지?
// module.exports = app.listen(PORT, () => {
//   console.log(`Server is running at port at ${PORT}`);
// });