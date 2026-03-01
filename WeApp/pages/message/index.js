// 消息中心页面逻辑
const { authAPI } = require('../../utils/api.js');

Page({
  data: {
    messages: [],
    loading: true
  },

  onLoad() {
    this.loadMessages();
  },

  // 加载消息
  async loadMessages() {
    this.setData({ loading: true });
    try {
      // 这里应该调用后端API获取消息
      // 暂时使用模拟数据
      this.setData({
        messages: [
          {
            id: 1,
            type: 'quota',
            title: '配额发放通知',
            content: '您的2026年3月配额1000元已发放',
            time: '2026-03-01 00:00',
            read: false
          },
          {
            id: 2,
            type: 'system',
            title: '系统通知',
            content: '欢迎使用HomeLedger家庭账本系统',
            time: '2026-02-28 10:00',
            read: true
          }
        ]
      });
    } catch (error) {
      console.error('加载消息失败:', error);
      wx.showToast({
        title: '加载消息失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  },

  // 标记消息为已读
  markAsRead(e) {
    const messageId = e.currentTarget.dataset.id;
    const messages = this.data.messages.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, read: true };
      }
      return msg;
    });
    this.setData({ messages });
  }
});