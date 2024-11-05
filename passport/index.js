// 인증 전략 등록
const passport = require('passport');
const kakao = require('./kakaoStrategy');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

module.exports = () => {

    passport.serializeUser((token, done) => {
        done(null, token);
    });

    passport.deserializeUser((token, done) => {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.id;

        User.findByPk(user_id)
            .then(user => done(null, user))
            .catch(err => done(err));
    });

    kakao();
}