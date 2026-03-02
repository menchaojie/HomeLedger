// 余额变动记录页面逻辑
const { transactionAPI, isLoggedIn } = require('../../utils/api.js');

Page({
  data: {
    transactions: [],
    loading: true,
    startDate: '',
    endDate: '',
    showStartDatePicker: false,
    showEndDatePicker: false,
    minDate: new Date(2020, 0, 1).getTime(),
    maxDate: new Date(2030, 11, 31).getTime()
  },

  onLoad() {
    // 设置默认时间段为当前月
    this.setDefaultDateRange();
    this.loadTransactions();
  },

  // 设置默认日期范围（当前月）
  setDefaultDateRange() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // 月初
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    
    // 月末
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
    
    this.setData({
      startDate,
      endDate
    });
  },

  // 加载交易记录
  async loadTransactions() {
    this.setData({ loading: true });
    try {
      if (!isLoggedIn()) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
        return;
      }

      // 验证日期格式
      const startDate = this.data.startDate;
      const endDate = this.data.endDate;
      
      if (!startDate || !endDate || startDate === 'NaN-NaN-NaN' || endDate === 'NaN-NaN-NaN') {
        wx.showToast({
          title: '日期格式无效',
          icon: 'none'
        });
        this.setData({ loading: false });
        return;
      }

      // 调用后端API获取交易记录
      const transactions = await transactionAPI.getTransactions({
        start_date: startDate,
        end_date: endDate
      });
      
      if (transactions && transactions.length > 0) {
        // 只保留必要字段，减少数据传输
        const simplifiedTransactions = transactions.map(item => ({
          id: item.id,
          description: item.description,
          amount: item.amount,
          event_type: item.event_type,
          status: item.status,
          created_at: item.created_at,
          formatted_time: this.formatTime(item.created_at)
        }));
        
        this.setData({ transactions: simplifiedTransactions });
      } else {
        this.setData({ transactions: transactions || [] });
      }
    } catch (error) {
      console.error('加载交易记录失败:', error);
      wx.showToast({
        title: '加载交易记录失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 打开开始日期选择器
  openStartDatePicker() {
    this.setData({ showStartDatePicker: true });
  },

  // 关闭开始日期选择器
  closeStartDatePicker() {
    this.setData({ showStartDatePicker: false });
  },

  // 确认开始日期选择
  onConfirmStartDate(event) {
    const date = this.formatDate(event.detail);
    this.setData({
      showStartDatePicker: false,
      startDate: date
    });
  },

  // 打开结束日期选择器
  openEndDatePicker() {
    this.setData({ showEndDatePicker: true });
  },

  // 关闭结束日期选择器
  closeEndDatePicker() {
    this.setData({ showEndDatePicker: false });
  },

  // 确认结束日期选择
  onConfirmEndDate(event) {
    const date = this.formatDate(event.detail);
    this.setData({
      showEndDatePicker: false,
      endDate: date
    });
  },

  // 格式化日期为YYYY-MM-DD
  formatDate(timestamp) {
    const date = new Date(timestamp);
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.error('Invalid timestamp:', timestamp);
      return '';
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 应用日期筛选
  applyDateFilter() {
    this.loadTransactions();
  },

  // 重置日期筛选
  resetDateFilter() {
    this.setDefaultDateRange();
    this.loadTransactions();
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  },

  // 格式化时间显示（精确到秒）
  formatTime(timeString) {
    if (!timeString) return '无时间';
    
    console.log('原始时间字符串:', timeString);
    
    try {
      // 简单处理：直接替换 T 为空格，去掉毫秒部分
      let result = timeString;
      
      // 替换 T 为空格
      result = result.replace('T', ' ');
      
      // 去掉毫秒部分（如果有）
      if (result.includes('.')) {
        result = result.split('.')[0];
      }
      
      // 去掉时区部分（如果有）
      if (result.includes('+')) {
        result = result.split('+')[0];
      }
      
      console.log('格式化后的时间:', result);
      return result || '格式化失败';
    } catch (error) {
      console.error('时间格式化错误:', error, '原始字符串:', timeString);
      return '格式化错误'; // 如果格式化失败，返回错误提示
    }
  }
});