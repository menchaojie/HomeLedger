// 修改密码页面逻辑
const { authAPI, isLoggedIn } = require('../../utils/api.js');

Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  },

  onLoad() {
    // 检查登录状态，如果未登录跳转到欢迎页面
    if (!isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/welcome/index'
      });
      return;
    }
  },

  onShow() {
    // 检查登录状态，如果未登录跳转到欢迎页面
    if (!isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/welcome/index'
      });
      return;
    }
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  },

  // 旧密码变化
  onOldPasswordChange(e) {
    const value = e.detail.value || e.detail;
    this.setData({
      oldPassword: value
    });
  },

  // 新密码变化
  onNewPasswordChange(e) {
    const value = e.detail.value || e.detail;
    this.setData({
      newPassword: value
    });
  },

  // 确认新密码变化
  onConfirmPasswordChange(e) {
    const value = e.detail.value || e.detail;
    this.setData({
      confirmPassword: value
    });
  },

  // 保存修改
  async onSave() {
    const { oldPassword, newPassword, confirmPassword } = this.data;
    console.log('修改密码 - 提交的数据:', { oldPassword, newPassword, confirmPassword });
    
    // 验证输入
    if (!oldPassword) {
      wx.showToast({
        title: '请输入旧密码',
        icon: 'none'
      });
      return;
    }
    
    if (!newPassword) {
      wx.showToast({
        title: '请输入新密码',
        icon: 'none'
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      wx.showToast({
        title: '两次输入的密码不一致',
        icon: 'none'
      });
      return;
    }
    
    try {
      // 调用修改密码 API
      console.log('修改密码 - 准备调用 API');
      const result = await authAPI.updatePassword(oldPassword, newPassword);
      console.log('修改密码 - API 调用成功:', result);
      
      wx.showToast({
        title: '密码修改成功',
        icon: 'success'
      });
      
      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('修改密码失败:', error);
      console.error('错误详情:', error.message);
      console.error('错误堆栈:', error.stack);
      wx.showToast({
        title: error.message || '修改密码失败，请检查旧密码是否正确',
        icon: 'none'
      });
    }
  }
});