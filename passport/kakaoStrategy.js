const passport = require('passport');
const kakaoStrategy = require('passport-kakao').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { uploadProfileImage} = require('../services/s3Service'); 

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
                //프로필이미지 s3에 저장, s3url가져오기
                const profileImageUrl = profile._json.properties.profile_image;
                const s3Url = await uploadProfileImage(profileImageUrl);

                // 새로운 유저
                const newUser = await User.create({
                    name: profile.displayName,
                    email: profile._json && profile._json.kakao_account.email,
                    profileImage: s3Url,
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