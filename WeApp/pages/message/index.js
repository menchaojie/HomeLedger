// 消息中心页面逻辑
const { messageAPI, isLoggedIn } = require('../../utils/api.js');

Page({
  data: {
    messages: [],
    loading: true
  },

  onLoad() {
    // 检查登录状态，如果未登录跳转到欢迎页面
    if (!isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/welcome/index'
      });
      return;
    }
    this.loadMessages();
  },

  onShow() {
    // 检查登录状态，如果未登录跳转到欢迎页面
    if (!isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/welcome/index'
      });
      return;
    }
    // 页面显示时刷新消息
    this.loadMessages();
  },

  // 加载消息
  async loadMessages() {
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

      // 调用后端API获取消息
      const messages = await messageAPI.getMessages();
      
      // 转换消息格式
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        title: msg.title,
        content: msg.content,
        time: msg.created_at,
        formatted_time: this.formatTime(msg.created_at),
        read: msg.read
      }));
      
      console.log('格式化后的消息:', formattedMessages);
      this.setData({ messages: formattedMessages });
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
    // 通知上一页（个人中心）更新未读消息数
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.loadUnreadMessageCount) {
      prevPage.loadUnreadMessageCount();
    }
    wx.navigateBack();
  },

  // 标记消息为已读
  async markAsRead(e) {
    const messageId = e.currentTarget.dataset.id;
    try {
      // 调用后端API标记为已读
      await messageAPI.markAsRead(messageId);
      
      // 更新本地状态
      const messages = this.data.messages.map(msg => {
        if (msg.id === messageId) {
          return { ...msg, read: true };
        }
        return msg;
      });
      this.setData({ messages });
      
      // 通知上一页（个人中心）更新未读消息数
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage && prevPage.loadUnreadMessageCount) {
        prevPage.loadUnreadMessageCount();
      }
    } catch (error) {
      console.error('标记已读失败:', error);
      wx.showToast({
        title: '标记已读失败',
        icon: 'none'
      });
    }
  },

  // 格式化时间显示（精确到秒）
  formatTime(timeString) {
    if (!timeString) return '';
    
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
      
      return result;
    } catch (error) {
      console.error('时间格式化错误:', error, '原始字符串:', timeString);
      return timeString; // 如果格式化失败，返回原字符串
    }
  }
});