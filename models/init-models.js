var DataTypes = require("sequelize").DataTypes;
var _Bookmark_Emojis = require("./Bookmark_Emojis");
var _Bookmarks = require("./Bookmarks");
var _Emojis = require("./Emojis");
var _SequelizeMeta = require("./SequelizeMeta");
var _Users = require("./Users");

function initModels(sequelize) {
  var Bookmark_Emojis = _Bookmark_Emojis(sequelize, DataTypes);
  var Bookmarks = _Bookmarks(sequelize, DataTypes);
  var Emojis = _Emojis(sequelize, DataTypes);
  var SequelizeMeta = _SequelizeMeta(sequelize, DataTypes);
  var Users = _Users(sequelize, DataTypes);

  Bookmark_Emojis.belongsTo(Bookmarks, { as: "emoji", foreignKey: "emojiId"});
  Bookmarks.hasMany(Bookmark_Emojis, { as: "Bookmark_Emojis", foreignKey: "emojiId"});
  Bookmark_Emojis.belongsTo(Emojis, { as: "bookmark", foreignKey: "bookmarkId"});
  Emojis.hasMany(Bookmark_Emojis, { as: "Bookmark_Emojis", foreignKey: "bookmarkId"});
  Bookmarks.belongsTo(Users, { as: "user", foreignKey: "userId"});
  Users.hasMany(Bookmarks, { as: "Bookmarks", foreignKey: "userId"});

  return {
    Bookmark_Emojis,
    Bookmarks,
    Emojis,
    SequelizeMeta,
    Users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
