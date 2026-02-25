// 交易页面逻辑
Page({
  data: {
    services: [
      { id: 1, name: '家务打扫', provider: 'Alice', price: 20, status: 'available' },
      { id: 2, name: '辅导作业', provider: 'Bob', price: 30, status: 'available' },
      { id: 3, name: '做饭', provider: 'Carol', price: 25, status: 'available' },
      { id: 4, name: '接送孩子', provider: 'Dave', price: 15, status: 'available' }
    ],
    bountyTasks: [
      { id: 1, name: '倒垃圾', requester: 'Alice', reward: 5, status: 'in_progress' },
      { id: 2, name: '修电脑', requester: 'Bob', reward: 30, status: 'pending' }
    ],
    transactions: [
      { id: 1, date: '03-01', sender: 'Alice', receiver: 'Bob', type: '服务', amount: -10, status: 'completed' },
      { id: 2, date: '03-01', sender: '系统', receiver: 'Carol', type: '奖励', amount: 20, status: 'completed' },
      { id: 3, date: '02-28', sender: 'Bob', receiver: 'Alice', type: '任务', amount: -5, status: 'completed' }
    ],
    currentUser: {
      role: 'admin' // 模拟当前用户是管理员
    }
  },

  // 购买服务
  onPurchaseService(e) {
    const service = this.data.services[e.currentTarget.dataset.index];
    wx.showModal({
      title: '购买服务',
      content: '确定购买 ' + service.name + '，价格: ' + service.price + ' 元？',
      showCancel: true,
      confirmText: '购买',
      success: (res) => {
        if (res.confirm) {
          // 模拟购买成功
          wx.showToast({
            title: '购买成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 发布悬赏任务
  onPostBounty() {
    wx.showModal({
      title: '发布悬赏任务',
      content: '请填写任务名称和奖励金额',
      showCancel: true,
      confirmText: '发布',
      success: (res) => {
        if (res.confirm) {
          // 模拟发布成功
          wx.showToast({
            title: '任务发布成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 查看交易详情
  onTransactionDetail(e) {
    const transaction = this.data.transactions[e.currentTarget.dataset.index];
    wx.showModal({
      title: '交易详情',
      content: '日期: ' + transaction.date + '\n' +
               '发送方: ' + transaction.sender + '\n' +
               '接收方: ' + transaction.receiver + '\n' +
               '类型: ' + transaction.type + '\n' +
               '金额: ' + transaction.amount + ' 元\n' +
               '状态: ' + (transaction.status === 'completed' ? '已完成' : '进行中'),
      showCancel: false
    });
  },

  // 筛选交易记录
  onFilterTransactions() {
    wx.showModal({
      title: '筛选交易记录',
      content: '按日期、类型或成员筛选',
      showCancel: true,
      confirmText: '筛选',
      success: (res) => {
        if (res.confirm) {
          // 模拟筛选成功
          wx.showToast({
            title: '筛选成功',
            icon: 'success'
          });
        }
      }
    });
  }
});
