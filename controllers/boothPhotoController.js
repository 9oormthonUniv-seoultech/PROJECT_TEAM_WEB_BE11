const Review = require('../models/review');
const Photobooth = require('../models/photobooth');

// 부스에 대한 rating, 각 리뷰 첫 번째 사진, 부스의 전체 사진 개수 가져오기
const getBoothPhotos = async (req, res) => {
  try {
    const photobooth_id = req.params.photobooth_id;

    // 부스의 rating 가져오기
    const photobooth = await Photobooth.findOne({
      where: { id: photobooth_id },
      attributes: ['rating'],
    });

    if (!photobooth) {
      return res.status(404).json({ message: '해당 부스를 찾을 수 없습니다.' });
    }

    // 해당 부스의 리뷰에서 각 리뷰 첫 번째 사진과 전체 사진 개수 가져오기
    const reviews = await Review.findAll({
      where: { photobooth_id: photobooth_id },
      attributes: ['image_url'],
    });

    let totalImageCount = 0; // 부스의 전체 사진 개수를 계산할 변수
    const reviewPhotos = reviews.map((review) => {
      let images = [];
      try {
        images = review.image_url ? JSON.parse(review.image_url) : []; // image_url을 배열로 변환
      } catch (error) {
        console.error(`Failed to parse image_url for review ${review.id}:`, error);
      }
      
      totalImageCount += images.length; // 각 리뷰의 이미지 개수를 총합에 추가

      return {
        Image: images[0] || null, // 첫 번째 이미지 URL (없으면 null)
      };
    });

    res.status(200).json({
      rating: photobooth.rating,
      reviewPhotos: reviewPhotos,
      totalImageCount: totalImageCount, // 부스의 전체 사진 개수
    });
  } catch (error) {
    console.error('부스 리뷰 사진 조회 중 오류:', error);
    res.status(500).json({ message: '데이터 조회에 실패했습니다.' });
  }
};

module.exports = { getBoothPhotos };
