module.exports = function(sequelize, DataTypes) {
  return sequelize.define('teams', {
  teamID:         {type: DataTypes.INTEGER, primaryKey: true},
  Name:          {type: DataTypes.INTEGER, primaryKey: true}
});
}