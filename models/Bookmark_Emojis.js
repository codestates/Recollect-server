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
      allowNull: true
    },
    emojiId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Emojis',
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
        name: "bookmarkId",
        using: "BTREE",
        fields: [
          { name: "bookmarkId" },
        ]
      },
      {
        name: "emojiId",
        using: "BTREE",
        fields: [
          { name: "emojiId" },
        ]
      },
    ]
  });
};
