// app.js
const { isLoggedIn } = require('./utils/api.js');

App({
  onLaunch() {
    // 初始化时检查登录状态并设置tabBar
    this.updateTabBar();
  },
  
  onShow() {
    // 每次显示时更新tabBar状态
    this.updateTabBar();
  },
  
  // 更新tabBar显示状态
  updateTabBar() {
    const loggedIn = isLoggedIn();
    
    if (loggedIn) {
      // 已登录：显示完整的tabBar
      setTimeout(() => {
        wx.showTabBar({
          animation: true
        });
      }, 100);
    } else {
      // 未登录：隐藏tabBar，只保留个人页面
      setTimeout(() => {
        wx.hideTabBar({
          animation: true
        });
      }, 100);
    }
  },
  
  // 全局登录状态变化通知
  onLoginStatusChange() {
    this.updateTabBar();
  },
  
  globalData: {
    userInfo: null
  }
})
