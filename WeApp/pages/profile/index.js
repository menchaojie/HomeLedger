// 个人页面逻辑
Page({
  data: {
    user: {
      name: 'Alice',
      message: '今天也要赚钱',
      avatar: '/assets/default-avatar.png',
      balance: 120
    },
    currentUser: {
      role: 'admin' // 模拟当前用户是管理员
    }
  },

  // 编辑个人资料
  onEditProfile() {
    wx.showModal({
      title: '编辑资料',
      content: '修改昵称和留言',
      showCancel: true,
      confirmText: '保存',
      success: (res) => {
        if (res.confirm) {
          // 模拟保存成功
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 查看余额变动记录
  onBalanceHistory() {
    wx.showModal({
      title: '余额变动记录',
      content: '显示余额的历史变动',
      showCancel: false
    });
  },

  // 提交奖励申请
  onSubmitReward() {
    wx.showModal({
      title: '提交奖励申请',
      content: '请填写奖励申请详情',
      showCancel: true,
      confirmText: '提交',
      success: (res) => {
        if (res.confirm) {
          // 模拟提交成功
          wx.showToast({
            title: '申请已提交',
            icon: 'success'
          });
        }
      }
    });
  },

  // 奖励审批
  onRewardApproval() {
    if (this.data.currentUser.role === 'admin') {
      wx.showModal({
        title: '奖励审批',
        content: '查看和审批奖励申请',
        showCancel: true,
        confirmText: '查看',
        success: (res) => {
          if (res.confirm) {
            // 模拟进入审批页面
            wx.showToast({
              title: '进入审批页面',
              icon: 'success'
            });
          }
        }
      });
    }
  },

  // 修改昵称
  onEditName() {
    wx.showModal({
      title: '修改昵称',
      content: '输入新昵称',
      showCancel: true,
      confirmText: '保存',
      success: (res) => {
        if (res.confirm) {
          // 模拟保存成功
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 修改头像
  onEditAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 模拟上传成功
        wx.showToast({
          title: '头像更新成功',
          icon: 'success'
        });
      }
    });
  },

  // 通知设置
  onNotificationSettings() {
    wx.showModal({
      title: '通知设置',
      content: '设置通知偏好',
      showCancel: false
    });
  },

  // 系统设置
  onSystemSettings() {
    wx.showModal({
      title: '系统设置',
      content: '系统相关设置',
      showCancel: false
    });
  },

  // 微信登录
  onWechatLogin() {
    wx.showModal({
      title: '微信登录',
      content: '使用微信账号登录',
      showCancel: true,
      confirmText: '登录',
      success: (res) => {
        if (res.confirm) {
          // 模拟登录成功
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      showCancel: true,
      confirmText: '退出',
      success: (res) => {
        if (res.confirm) {
          // 模拟退出成功
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  }
});
