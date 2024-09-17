const Review = require('../models/review');
const Photobooth = require('../models/photobooth');

const createReview = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const { photobooth_name, rating, booth_keyword, photo_keyword, content, date } = req.body;
    
    // 포토부스 이름을 통해 photobooth_id 조회
    const photobooth = await Photobooth.findOne({
        where: { name: photobooth_name }  // 입력받은 이름으로 포토부스 찾기
      });
  
      if (!photobooth) {
        return res.status(404).json({ message: '해당 이름의 포토부스를 찾을 수 없습니다.' });
      }
  
      const photobooth_id = photobooth.id;

    // 이미지가 있으면 S3에 업로드 후 URL을 저장
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.location); // S3에서 반환된 URL 저장
    }

    // 리뷰 생성
    const newReview = await Review.create({
      user_id,
      photobooth_id,
      rating,
      booth_keyword,
      photo_keyword,
      content,
      image_url: imageUrls.length > 0 ? imageUrls : null,  // S3에서 반환된 URL 저장
      date: date,
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error('리뷰 생성 중 오류:', error);
    res.status(500).json({ message: '리뷰 생성에 실패했습니다.' });
  }
};

module.exports = { createReview };