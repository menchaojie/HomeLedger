// 家庭页面逻辑
Page({
  data: {
    family: {
      name: 'Home Name',
      id: 'HL-1234',
      memberCount: 5,
      createdAt: '2026-01-01',
      avatar: '/assets/default-family-avatar.png'
    },
    members: [
      { id: 1, name: 'Alice', balance: 120, role: 'member', avatar: '/assets/default-avatar.png' },
      { id: 2, name: 'Bob', balance: 85, role: 'admin', avatar: '/assets/default-avatar.png' },
      { id: 3, name: 'Carol', balance: 60, role: 'member', avatar: '/assets/default-avatar.png' },
      { id: 4, name: 'Dave', balance: 95, role: 'member', avatar: '/assets/default-avatar.png' },
      { id: 5, name: 'Eve', balance: 70, role: 'member', avatar: '/assets/default-avatar.png' }
    ],
    currentUser: {
      role: 'admin' // 模拟当前用户是管理员
    }
  },

  // 点击成员头像，显示余额详情
  onMemberClick(e) {
    const member = this.data.members[e.currentTarget.dataset.index];
    wx.showModal({
      title: member.name + ' 的余额',
      content: '当前余额: ' + member.balance + ' 元',
      showCancel: false
    });
  },

  // 创建家庭
  onCreateFamily() {
    wx.showModal({
      title: '创建家庭',
      content: '请填写家庭名称、ID和上传头像',
      showCancel: true,
      confirmText: '提交',
      success: (res) => {
        if (res.confirm) {
          // 模拟提交成功
          wx.showToast({
            title: '家庭创建成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 加入家庭
  onJoinFamily() {
    wx.showModal({
      title: '加入家庭',
      content: '请输入家庭ID或扫描二维码',
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

  // 设置每月额度
  onSetMonthlyLimit() {
    if (this.data.currentUser.role === 'admin') {
      wx.showModal({
        title: '设置每月额度',
        content: '请输入每月自由支配资金额度',
        showCancel: true,
        confirmText: '提交',
        success: (res) => {
          if (res.confirm) {
            // 模拟提交成功
            wx.showToast({
              title: '设置成功',
              icon: 'success'
            });
          }
        }
      });
    }
  },

  // 成员审批
  onMemberApproval() {
    if (this.data.currentUser.role === 'admin') {
      wx.showModal({
        title: '成员审批',
        content: '查看和审批成员加入请求',
        showCancel: true,
        confirmText: '查看',
        success: (res) => {
          if (res.confirm) {
            // 模拟查看审批页面
            wx.showToast({
              title: '进入审批页面',
              icon: 'success'
            });
          }
        }
      });
    }
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
            // 模拟查看审批页面
            wx.showToast({
              title: '进入审批页面',
              icon: 'success'
            });
          }
        }
      });
    }
  }
});
