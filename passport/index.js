// 인증 전략 등록
const passport = require('passport');
const kakao = require('./kakaoStrategy');

const User = require('../models/user');

module.exports = () => {

    passport.serializeUser((user, done) => {
        console.log(user.id);
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findOne({ where: {id} })
            .then(user => done(null, user))
            .catch(err => done(err));
    });

    kakao();
}