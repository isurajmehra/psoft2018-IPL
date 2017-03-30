module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
  userID:       {type: DataTypes.INTEGER, primaryKey: true},
  name:         DataTypes.STRING,
  email:        DataTypes.STRING,
  password:     DataTypes.STRING,
  avatar_image: DataTypes.STRING,
  auth_key:     DataTypes.STRING,
  points:       DataTypes.INTEGER
});
}