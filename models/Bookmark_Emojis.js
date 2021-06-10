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
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "Bookmark_Emojis_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bookmarkId" },
          { name: "emojiId" },
        ]
      },
      {
        name: "Bookmark_Emojis_Bookmark",
        using: "BTREE",
        fields: [
          { name: "emojiId" },
        ]
      },
    ]
  });
};
