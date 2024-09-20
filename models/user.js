const Sequelize = require('sequelize');

class User extends Sequelize.Model {

    static init(sequelize) {

        return super.init(
            {
                name: {
                    type: Sequelize.STRING(20),
                    allowNull: false,
                    unique: false,
                    comment: '닉네임(이름)',
                },
                email: {
                    type: Sequelize.STRING(100),
                    allowNull: false,
                    unique: true,
                    comment: '이메일',
                },
                profileImage: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                    comment: '프로필 사진',
                },
            },
            {
                modelName: 'User',  // 모델 이름
                tableName: 'users',  // DB의 테이블 이름
                charset: 'utf8mb4',  // 인코딩
                collate: 'utf8mb4_general_ci',
                timestamps: false,  // 기록 생성, 수정 일시를 자동으로 입력하는 옵션 : 해제
                paranoid: false,  // 지운 시각 기록하는 옵션 : 해제
                underscored: false,  // 카멜 표기법을 스네이크 표기법으로 바꾸는 옵션 : 해제
                sequelize,
            }
        )
    }

    // 다른 모델과의 관계 정의
    static associate(db) {
        
        // 다대다 관계
        this.belongsToMany(db.Photobooth, {
            through: 'Photobooth_like',
            foreignKey: 'user_id',
            otherKey: 'photobooth_id',
            as: 'likedBooths',
            timestamps: false,
        });
    }
};

module.exports = User;