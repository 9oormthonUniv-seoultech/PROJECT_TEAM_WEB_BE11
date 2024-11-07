const Review = require('../models/review');
const Photobooth = require('../models/photobooth');
const { Keyword, Keyword_list } = require('../models/keyword');


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

    // 해당 부스의 리뷰에서 각 리뷰의 최대 4개의 이미지와 전체 사진 개수 가져오기
    const reviews = await Review.findAll({
      where: { photobooth_id: photobooth_id },
      order: [['date', 'DESC']],
      attributes: ['image_url'],
    });

    let totalImageCount = 0; 
    const reviewPhotos = [];
    
    for (const review of reviews) {
      let images = [];
      try {
        images = review.image_url ? JSON.parse(review.image_url) : []; 
      } catch (error) {
        console.error(`Failed to parse image_url for review ${review.id}:`, error);
      }
      
      totalImageCount += images.length; 

      // 최대 4개의 이미지만 추출
      reviewPhotos.push(...images.slice(0, 4));
      if (reviewPhotos.length >= 4) break;
    }

    res.status(200).json({
      rating: photobooth.rating,
      reviewPhotos: reviewPhotos.slice(0, 4),
      totalImageCount: totalImageCount, 
    });
  } catch (error) {
    console.error('부스 리뷰 사진 조회 중 오류:', error);
    res.status(500).json({ message: '데이터 조회에 실패했습니다.' });
  }
};

const getBoothModal = async (req, res) => {
  try {
    const photobooth_id = req.params.photobooth_id;

    const booth = await Photobooth.findByPk(photobooth_id, {
      attributes: ['rating'],
    });

    if (!booth) {
      return res.status(404).json({ message: '해당 부스를 찾을 수 없습니다.' });
    }

    // 부스 리뷰 개수와 첫 번째 이미지, 이미지 개수
    const reviews = await Review.findAll({
      where: { photobooth_id: photobooth_id },
      order: [['date', 'DESC']],
      attributes: ['image_url'],
      limit:4,
    });

    const reviewCount = reviews.length;
    const imageCount = reviews.reduce((count, review) => {
      const images = review.image_url ? JSON.parse(review.image_url) : [];
      return count + images.length;
    }, 0);
    const firstImage = reviews[0]?.image_url ? JSON.parse(reviews[0].image_url)[0] : null;

    // 가장 많이 사용된 키워드 두 개
    const topKeywords = await Keyword.findAll({
      where: { photobooth_id: photobooth_id },
      include: [
        {
          model: Keyword_list,
          as: 'keyword',
          attributes: ['keyword'],
        },
      ],
      order: [['count', 'DESC']],
      limit: 2,
    });

    const topKeywordsList = topKeywords.map(item => item.keyword.keyword);

    res.status(200).json({
      rating: booth.rating,
      topHashtag: topKeywordsList,
      imageCount: imageCount,
      firstImage: firstImage,
      reviewCount: reviewCount,
    });
  } catch (error) {
    console.error('부스 상세 정보 조회 중 오류:', error);
    res.status(500).json({ message: '부스 정보를 가져오는 데 실패했습니다.' });
  }
};

// 포토부스 위치 정보 가져오기
const getBoothLocation = async (req, res) => {
  try {
    const { photobooth_id } = req.params;
    
    const booth = await Photobooth.findByPk(photobooth_id, {
      attributes: ['name', 'latitude', 'longitude', 'rating'],
    });

    if (!booth) {
      res.status(404).json({ message: '해당 포토부스를 찾을 수 없습니다.' });
    }

    res.status(200).json({
      booth_name: booth.name,
      latitude: booth.latitude,
      longitude: booth.longitude,
      rating: booth.rating,
    });
  } catch (error) {
    console.error('getBoothLocation Error:', error);
    res.status(500).json({ message: '포토부스 정보를 가져오는 데 실패했습니다.' });
  }
};


module.exports = { getBoothPhotos , getBoothModal, getBoothLocation };
