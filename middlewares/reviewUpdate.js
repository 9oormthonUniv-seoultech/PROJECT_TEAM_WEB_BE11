const Photobooth = require('../models/photobooth');
const Review = require('../models/review');
const {Keyword, Keyword_list} = require('../models/keyword');
const { Sequelize } = require('sequelize');

// Photobooth테이블의 rating 업데이트
const updateRating = async (req, res, next) => {
    try {
        const { photobooth_id } = req.body;

        const reviews = await Review.findAll({
            where: { photobooth_id: photobooth_id }
        });

        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        let averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        averageRating = parseFloat(averageRating.toFixed(1));
        await Photobooth.update(
            { rating: averageRating },
            { where: { id: photobooth_id } }
        );
        next(); 
    } catch (error) {
        return res.status(500).json({ message: '평점 업데이트에 실패했습니다.' });
    }
};

// Keyword테이블 업데이트
const updateKeywords = async (req, res, next) => {
    try {
        const { photobooth_id, booth_keyword, photo_keyword, increment } = req.body;
        
        const boothKeywords = Array.isArray(booth_keyword) ? booth_keyword : booth_keyword.split(',');
        const photoKeywords = Array.isArray(photo_keyword) ? photo_keyword : photo_keyword.split(',');

        const updateKeywordCount = async (keywords) => {
            for (const keyword of keywords) {
                const keywordEntry = await Keyword_list.findOne({
                    where: { keyword: keyword.trim() }
                });

                if (keywordEntry) {
                    const [keywordRecord, created] = await Keyword.findOrCreate({
                        where: {
                            photobooth_id,
                            keyword_id: keywordEntry.id
                        },
                        defaults: { count: increment > 0 ? 1 : 0 }
                    });
                    if (!created) {
                        // 기존 레코드의 경우 count 값 증가 또는 감소
                        await keywordRecord.update({
                            count: Sequelize.literal(`count + ${increment}`)
                        });
                }}
            }
        };

        await updateKeywordCount(boothKeywords);
        await updateKeywordCount(photoKeywords);

        next();
    } catch (error) {
        console.error('키워드 업데이트 중 오류:', error);
        res.status(500).json({ message: '키워드 업데이트에 실패했습니다.' });
    }
};


module.exports = {updateRating, updateKeywords}