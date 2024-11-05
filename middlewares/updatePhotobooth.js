const Photobooth = require('../models/photobooth');
const Review = require('../models/review');

// rating에 대해서만 계산=> 이후 수정
const updatePhotobooth = async (req, res, next) => {
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

module.exports = {updatePhotobooth}