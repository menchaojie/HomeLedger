// app.js
const { isLoggedIn } = require('./utils/api.js');

App({
  onLaunch() {
    // 初始化应用
    console.log('App launched');
  },
  
  onShow() {
    // 应用显示时的逻辑
    console.log('App shown');
  },
  
  // 全局登录状态变化通知
  onLoginStatusChange() {
    // 登录状态变化时的处理
    console.log('Login status changed');
  },
  
  globalData: {
    userInfo: null
  }
})
