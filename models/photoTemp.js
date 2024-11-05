const Sequelize = require('sequelize');

// 사진을 등록할 때 단계별로 쓸 임시테이블
class PhotoTemp extends Sequelize.Model {
    
    static init(sequelize) {

        return super.init(
            {
                user_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: '유저 ID',
                },
                image_url: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                    comment: '등록할 사진의 url',
                },
                date: {
                    type: Sequelize.DATE,
                    allowNull: true,
                    comment: '사진 등록 날짜',
                },
                photobooth_id: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    comment: '포토부스 ID',
                },
                hashtag_1: {
                    type: Sequelize.STRING(30),
                    allowNull: true,
                    comment: '해시태그 1(기념일) (최대 10자)'
                },
                hashtag_2: {
                    type: Sequelize.STRING(30),
                    allowNull: true,
                    comment: '해시태그 2(이름) (최대 10자)'
                },
                hashtag_3: {
                    type: Sequelize.STRING(30),
                    allowNull: true,
                    comment: '해시태그 3(장소) (최대 10자)'
                },
                record: {
                    type: Sequelize.STRING(600),
                    allowNull: false,
                    defaultValue: '사진에 대한 기록을 추가해보세요',
                    comment: '추억 기록하기 (최대 300자)'
                },
            },
            {
                modelName: 'PhotoTemp',
                tableName: 'photoTemp',
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
                timestamps: false,
                paranoid: false,
                underscored: false, 
                sequelize,
            }
        )
    }

    // 다른 모델과의 관계 정의
    static associate(db) { }
};

module.exports = PhotoTemp;