const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const logger = require("morgan");
const dotenv = require("dotenv");
const methodOverride = require('method-override');

const routes = require("./routes/index");
const { addVisitCountsController } = require('./controller/bookmarkController');
const { updateBookmarkController } = require('./controller/mypageControllers');
const {  editProfileController } = require('./controller/profileController');

dotenv.config();
const PORT = process.env.PORT;

//express 패키지를 호출해서 app 변수 객체를 만들고, 각종 기능 연결
const app = express();

//app.use를 통해서 익스프레스에 미들웨어를 연결
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//TODO: Cookie 환경설정 필요 
app.use(
  session({
    secret: "@collecting",
    resave: false,
    saveUninitialized: true,
    unset: 'keep',
    cookie: {
      sameSite: 'none',
      maxAge: 24 * 6 * 60 * 10000,
      httpOnly: true,
      secure: true
    }
  })
);
app.use(cookieParser());
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE', 'OPTIONS'],
  exposedHeaders: ['*', 'Authorization']
}
app.use(cors(corsOptions));
app.use(methodOverride('_method'));
app.use(methodOverride('X-HTTP-Method-Override'));

//TODO: 라우팅 분기-controller 함수랑 연결 필요
app.use("/", routes);
app.put('/bookmark', (req, res, next) => {
  addVisitCountsController (req, res);
});
app.put('/mypage', (req, res, next) => {
  updateBookmarkController(req, res);
});
app.patch('/profile', (req, res, next) => {
  editProfileController(req,res);
  next();

});

let server;
if (fs.existsSync("./key.pem") && fs.existsSync("./cert.pem")) {
  server = https
    .createServer(
      {
        key: fs.readFileSync(__dirname + `/` + 'key.pem', 'utf-8'),
        cert: fs.readFileSync(__dirname + `/` + 'cert.pem', 'utf-8'),
      },
      app
    )
    .listen(PORT);
} else {
  server = app.listen(PORT)
}

module.exports = server;