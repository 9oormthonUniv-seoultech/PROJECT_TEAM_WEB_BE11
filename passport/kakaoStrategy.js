const passport = require('passport');
const kakaoStrategy = require('passport-kakao').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = () => {

    passport.use(new kakaoStrategy({
        callbackURL: '/auth/kakao/callback',
        clientID: process.env.KAKAO_ID,
    },

    async (accessToken, refreshToken, profile, done) => {
        // console.log('kakao profile', profile);
        try {
            const exUser = await User.findOne({
                where: { email: profile._json.kakao_account.email },  // 이메일로 중복 확인
            });

            if (exUser) {
                // 이전에 가입한 유저
                const token = jwt.sign(
                    {
                        name: exUser.name,
                        email: exUser.email,
                    },
                    process.env.JWT_SECRET
                );
                console.log('이전에 가입한 유저: ', exUser.name);
                done(null, token);
            } else {
                // 새로운 유저
                const newUser = await User.create({
                    name: profile.displayName,
                    email: profile._json && profile._json.kakao_account.email,
                });

                const token = jwt.sign(
                    {
                        name: newUser.name,
                        email: newUser.email,
                    },
                    process.env.JWT_SECRET
                );
                console.log('새로운 유저: ', newUser.name);
                done(null, token);
            }
        } catch (error) {
            console.log(error);
            done(error);
        }
    }));
};