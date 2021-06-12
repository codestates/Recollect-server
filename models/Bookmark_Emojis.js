const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Bookmark_Emojis', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    bookmarkId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Emojis',
        key: 'id'
      }
    },
    emojiId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Bookmarks',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'Bookmark_Emojis',
    timestamps: false,
  });
};
