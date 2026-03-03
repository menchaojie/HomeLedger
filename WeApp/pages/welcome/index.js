// 欢迎页面逻辑
const { isLoggedIn } = require('../../utils/api.js');

Page({
  onLoad() {
    // 如果已经登录，跳转到个人页面
    if (isLoggedIn()) {
      wx.switchTab({
        url: '/pages/profile/index'
      });
    }
  },
  
  // 跳转到登录页面
  onLogin() {
    wx.navigateTo({
      url: '/pages/login/index'
    });
  },
  
  // 跳转到注册页面
  onRegister() {
    wx.navigateTo({
      url: '/pages/register/index'
    });
  }
})