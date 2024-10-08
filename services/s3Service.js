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
    //acl: 'public-read-write', 
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
        

const uploadImage = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 파일 크기 제한
}).array('files', 5); //파일 최대 5개까지 받음


async function uploadProfileImage(imageUrl){
    try {
        // 이미지 다운로드
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

        // MIME 타입으로부터 파일 확장자 결정
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

        // S3에 업로드
        const fileName = `${uuid()}${extension}`;

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
            Body: response.data,
            ContentType: response.headers['content-type'],
        };

        await s3.putObject(params).promise();

        // 업로드된 파일의 S3 URL 반환
        const s3Url = `https://${params.Bucket}.s3.ap-northeast-2.amazonaws.com/${params.Key}`;
        return s3Url;

    } catch (error) {
        console.error('이미지 업로드 중 에러 발생:', error);
        throw error;
    }

} ;

const deleteImage = (fileKey) => {
    s3.deleteObject(
        {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey, //삭제할 파일의 S3 Key
        },
        (err, data)=>{
            if(err){
                throw err;
            } else{
                console.log('이미지가 삭제되었습니다')
            }
        }
    )
}
module.exports = {uploadImage, uploadProfileImage, deleteImage}