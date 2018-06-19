import { DataTypes } from 'sequelize'

export const SCHEMA = {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.JSON,
        defaultValue: '',
    },
    photoUrl: {
        type: DataTypes.STRING(511),
        allowNull: true,
    },
    thumbPhotoUrl: {
        type: DataTypes.STRING(511),
        allowNull: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}

export default function (sequelize) {
    const Post = sequelize.define('Post', SCHEMA)

    Post.associate = ({ User, PostLocation, PostVote, Comment }) => {
        Post.belongsTo(User, { foreignKey: 'userId' })
        Post.hasOne(PostLocation, { foreignKey: 'postId' })
        Post.hasMany(PostVote, { foreignKey: 'postId' })
        Post.hasMany(Comment, { foreignKey: 'postId' })
    }

    return Post
}
