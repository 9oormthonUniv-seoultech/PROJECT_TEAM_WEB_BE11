const Sequelize = require('sequelize');

class Photo extends Sequelize.Model {

    static init(sequelize) {

        return super.init(
            {
                user_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: '유저 ID (foreign key)',
                    references: { // FK 설정
                        model: 'users',
                        key: 'id',
                    },
                    onDelete: 'CASCADE', // 유저가 삭제되면 사진도 삭제
                },
                photobooth_id: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    comment: '포토부스 ID (foreign key)',
                    references: { // FK 설정
                        model: 'photobooth',
                        key: 'id',
                    },
                    onDelete: 'SET NULL', // 포토부스 삭제되면 photobooth_id를 NULL로 설정
                },
                image_url: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                    comment: '등록한 사진 url',
                },
                date: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    comment: '사진 등록 날짜',
                },
                record: {
                    type: Sequelize.STRING(600),
                    allowNull: false,
                    defaultValue: '사진에 대한 기록을 추가해보세요',
                    comment: '추억 기록하기 (최대 300자)'
                },
                photo_like: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                    comment: '사진 즐겨찾기'
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
            },
            {
                modelName: 'Photo',
                tableName: 'photo',
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
                timestamps: true,
                paranoid: false,
                underscored: false, 
                sequelize,
            }
        )
    }

    // 다른 모델과의 관계 정의
    static associate(db) {
        // User 테이블과의 관계 (1:n)
        this.belongsTo(db.User, {
            foreignKey: 'user_id',
            targetKey: 'id',
            onDelete: 'CASCADE', // 유저가 삭제되면 사진도 삭제
        });

        // Photobooth 테이블과의 관계 (1:n)
        this.belongsTo(db.Photobooth, {
            foreignKey: 'photobooth_id',
            targetKey: 'id',
            onDelete: 'SET NULL', // 포토부스가 삭제되면 photobooth_id를 NULL로 설정
        });
    }
};

module.exports = Photo;