const { transactionAPI, isLoggedIn } = require('../../utils/api.js');

Page({
  data: {
    transactions: [],
    loading: true,
    startDate: '',
    endDate: ''
  },

  onLoad() {
    // 检查登录状态，如果未登录跳转到欢迎页面
    if (!isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/welcome/index'
      });
      return;
    }
    this.setDefaultDateRange();
    this.loadTransactions();
  },

  onShow() {
    // 检查登录状态，如果未登录跳转到欢迎页面
    if (!isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/welcome/index'
      });
      return;
    }
    this.loadTransactions();
  },

  // 设置默认当前月
  setDefaultDateRange() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

    this.setData({
      startDate,
      endDate
    });
  },

  async loadTransactions() {
    if (!isLoggedIn()) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    const { startDate, endDate } = this.data;

    if (!startDate || !endDate) {
      wx.showToast({
        title: '日期格式无效',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      const transactions = await transactionAPI.getTransactions({
        start_date: startDate,
        end_date: endDate
      });

      const simplified = (transactions || []).map(item => ({
        id: item.id,
        description: item.description,
        amount: item.amount,
        event_type: item.event_type,
        status: item.status,
        formatted_time: this.formatTime(item.created_at)
      }));

      this.setData({
        transactions: simplified,
        loading: false
      });

    } catch (error) {
      console.error('加载交易记录失败:', error);
      wx.showToast({
        title: '加载交易记录失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  onStartDateChange(e) {
    this.setData({
      startDate: e.detail.value
    });
  },

  onEndDateChange(e) {
    this.setData({
      endDate: e.detail.value
    });
  },

  applyDateFilter() {
    this.loadTransactions();
  },

  resetDateFilter() {
    this.setDefaultDateRange();
    this.loadTransactions();
  },

  formatTime(timeString) {
    if (!timeString) return '无时间';

    try {
      let result = timeString.replace('T', ' ');
      if (result.includes('.')) result = result.split('.')[0];
      if (result.includes('+')) result = result.split('+')[0];
      return result;
    } catch (e) {
      return '格式化错误';
    }
  }
});