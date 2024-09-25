const express = require('express');
const mysql = require('mysql2/promise');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const app = express();

require('dotenv').config();
const port = process.env.PORT;

app.use(express.json());

// db 관련 설정
const db = require('./models');
db.sequelize
  .sync({force: false})
  .then(() => {
    console.log('DB 연결 성공');
  })
  .catch(err => console.log(err));

// 쿠키, 세션 설정
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// 로그인을 위한 Passport 세팅
const passportConfig = require('./passport');
passportConfig();

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// 로그인 인증 토큰 발급용 >> 수정 가능성 o
app.get('/token', (req, res) => {
  res.json(req.query);
})

// 라우트 설정
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

const reviewRouter = require('./routes/reviewRoutes');
app.use('/api/review', reviewRouter);

const userRouter = require('./routes/userRoutes');
app.use('/api/user', userRouter);

const mapRouter = require('./routes/mapRouters');
app.use('/api/map', mapRouter);

// 스웨거 세팅
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const swaggerSpec = YAML.load(path.join(__dirname, './build/swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
