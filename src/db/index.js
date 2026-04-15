// 简单的数据库模拟实现
const db = {
  // 模拟用户数据
  users: [],
  
  // 模拟出行记录
  travelRecords: [],
  
  // 模拟积分记录
  points: [],
  
  // 模拟排行榜数据
  leaderboard: [],
  
  // 模拟添加用户
  addUser: function(user) {
    this.users.push(user);
  },
  
  // 模拟添加出行记录
  addTravelRecord: function(record) {
    this.travelRecords.push(record);
  },
  
  // 模拟添加积分
  addPoints: function(point) {
    this.points.push(point);
  },
  
  // 模拟获取排行榜
  getLeaderboard: function() {
    return this.leaderboard;
  }
};

export default db;