const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const uuid = require('uuid4');
const path = require('path');
const axios = require('axios');

// AWS S3 설정
AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2',
    });

const s3 = new AWS.S3();

const allowedExtensions =['.png', '.jpg', '.jpeg', '.bmp']

const storage = multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        if(!allowedExtensions.includes(extension)){
            return callback(new Error('허용된 파일 확장자가 아닙니다'))
        }
        //파일이름을 고유하게 생성
        callback(null, `${uuid()}_${file.originalname}`);
    },
});
        

const uploadFiveImages = (req, res, next) => {
    multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 }, // 파일 크기 제한
    }).array('files', 5)(req, res, (err) => { // 파일 크기,개수 제한
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        //S3에서 반환된 URL들을 저장하여 반환
        if (req.files && req.files.length > 0) {
            const imageUrls = req.files.map(file => file.location);
            req.body.imageUrls = imageUrls; // 이미지 URL을 req.body에 저장
        } else {
            req.body.imageUrls = null; 
        }
        next();
    });
};


const saveUploadOneImage = async (req, res, next) => {
    const imageUrl = req.body.imageUrl; 
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

        const mimeType = response.headers['content-type'];
        let extension = '';
        if (mimeType === 'image/jpeg') {
            extension = '.jpg';
        } else if (mimeType === 'image/png') {
            extension = '.png';
        } else if (mimeType === 'image/bmp') {
            extension = '.bmp';
        } else {
            throw new Error('허용된 파일 형식이 아닙니다');
        }

        const fileName = `${uuid()}${extension}`;
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
            Body: response.data,
            ContentType: response.headers['content-type'],
        };
        await s3.putObject(params).promise();

        return `https://${params.Bucket}.s3.ap-northeast-2.amazonaws.com/${params.Key}`; 
        next(); 
    } catch (error) {
        console.error('이미지 업로드 중 에러 발생:', error);
        return res.status(500).json({ message: '이미지 업로드 중 에러 발생', error: error.message });
    }
};



const deleteImages = async (imageUrls) => {
    try {
        const deletePromises = imageUrls.map(imageUrl => {
            return new Promise((resolve, reject) => {
                const urlParts = imageUrl.split('/');
                const fileKey = urlParts.slice(3).join('/');

                const params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: fileKey
                };

                s3.deleteObject(params, (err, data) => {
                    if (err) {
                        return reject(new Error('s3에서 이미지 삭제 실패'));
                    }
                    resolve();
                });
            });
        });

        await Promise.all(deletePromises);
        console.log("s3에서 이미지 삭제 성공");
    } catch (err) {
        console.log('s3에서 이미지 삭제 오류', err);
        throw new Error('s3에서 이미지 삭제 실패');
    }
};

module.exports = {uploadFiveImages, saveUploadOneImage, deleteImages}