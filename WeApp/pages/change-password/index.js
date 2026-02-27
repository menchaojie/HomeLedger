// 修改密码页面逻辑
const { authAPI } = require('../../utils/api.js');

Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  },

  // 旧密码变化
  onOldPasswordChange(e) {
    this.setData({
      oldPassword: e.detail.value
    });
  },

  // 新密码变化
  onNewPasswordChange(e) {
    this.setData({
      newPassword: e.detail.value
    });
  },

  // 确认新密码变化
  onConfirmPasswordChange(e) {
    this.setData({
      confirmPassword: e.detail.value
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
      wx.showToast({
        title: '修改密码失败，请检查旧密码是否正确',
        icon: 'none'
      });
    }
  }
});