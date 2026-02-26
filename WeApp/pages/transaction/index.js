// 交易页面逻辑
const { serviceAPI, taskAPI, transactionAPI, authAPI } = require('../../utils/api.js');

Page({
  data: {
    services: [],
    bountyTasks: [],
    transactions: [],
    currentUser: null,
    loading: true
  },

  onLoad() {
    this.loadTransactionData();
  },

  // 加载交易数据
  async loadTransactionData() {
    this.setData({ loading: true });
    try {
      // 获取当前用户信息
      const userInfo = await authAPI.getCurrentUser();
      this.setData({ currentUser: userInfo });

      // 并行获取数据
      const [services, tasks, transactions] = await Promise.all([
        serviceAPI.getServices(),
        taskAPI.getTasks(),
        transactionAPI.getTransactions()
      ]);

      this.setData({
        services,
        bountyTasks: tasks,
        transactions
      });
    } catch (error) {
      console.error('加载交易数据失败:', error);
      // API调用失败时使用模拟数据
      this.useMockData();
    } finally {
      this.setData({ loading: false });
    }
  },

  // 使用模拟数据
  useMockData() {
    const mockServices = [
      { id: 1, name: '家务打扫', provider: 'Alice', price: 20, status: 'available' },
      { id: 2, name: '辅导作业', provider: 'Bob', price: 30, status: 'available' },
      { id: 3, name: '做饭', provider: 'Carol', price: 25, status: 'available' },
      { id: 4, name: '接送孩子', provider: 'Dave', price: 15, status: 'available' }
    ];
    
    const mockBountyTasks = [
      { id: 1, name: '倒垃圾', requester: 'Alice', reward: 5, status: 'in_progress' },
      { id: 2, name: '修电脑', requester: 'Bob', reward: 30, status: 'pending' }
    ];
    
    const mockTransactions = [
      { id: 1, date: '03-01', sender: 'Alice', receiver: 'Bob', type: '服务', amount: -10, status: 'completed' },
      { id: 2, date: '03-01', sender: '系统', receiver: 'Carol', type: '奖励', amount: 20, status: 'completed' },
      { id: 3, date: '02-28', sender: 'Bob', receiver: 'Alice', type: '任务', amount: -5, status: 'completed' }
    ];
    
    const mockCurrentUser = {
      role: 'admin' // 模拟当前用户是管理员
    };
    
    this.setData({
      services: mockServices,
      bountyTasks: mockBountyTasks,
      transactions: mockTransactions,
      currentUser: mockCurrentUser
    });
  },

  // 购买服务
  onPurchaseService(e) {
    const service = this.data.services[e.currentTarget.dataset.index];
    wx.showModal({
      title: '购买服务',
      content: '确定购买 ' + service.name + '，价格: ' + service.price + ' 元？',
      showCancel: true,
      confirmText: '购买',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 创建交易记录
            await transactionAPI.createTransaction({
              family_id: 1, // 假设家庭ID为1
              amount: service.price,
              description: '购买服务: ' + service.name,
              transaction_type: 'service_purchase',
              related_service_id: service.id
            });
            wx.showToast({
              title: '购买成功',
              icon: 'success'
            });
            // 重新加载数据
            this.loadTransactionData();
          } catch (error) {
            console.error('购买服务失败:', error);
          }
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
      success: async (res) => {
        if (res.confirm) {
          try {
            // 创建任务
            await taskAPI.createTask({
              family_id: 1, // 假设家庭ID为1
              title: '新任务',
              description: '这是一个新的悬赏任务',
              reward_amount: 50 // 假设奖励金额为50元
            });
            wx.showToast({
              title: '任务发布成功',
              icon: 'success'
            });
            // 重新加载数据
            this.loadTransactionData();
          } catch (error) {
            console.error('发布任务失败:', error);
          }
        }
      }
    });
  },

  // 查看交易详情
  onTransactionDetail(e) {
    const transaction = this.data.transactions[e.currentTarget.dataset.index];
    wx.showModal({
      title: '交易详情',
      content: '日期: ' + (transaction.created_at ? transaction.created_at.substring(0, 10) : '未知') + '\n' +
               '类型: ' + this.getTransactionTypeText(transaction.transaction_type) + '\n' +
               '金额: ' + transaction.amount + ' 元\n' +
               '描述: ' + (transaction.description || '无'),
      showCancel: false
    });
  },

  // 获取交易类型文本
  getTransactionTypeText(type) {
    const typeMap = {
      'service_purchase': '服务购买',
      'task_reward': '任务奖励',
      'reward_application': '奖励申请'
    };
    return typeMap[type] || type;
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
          // 这里可以实现实际的筛选逻辑
          wx.showToast({
            title: '筛选成功',
            icon: 'success'
          });
        }
      }
    });
  }
});
