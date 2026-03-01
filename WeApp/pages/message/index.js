// 消息中心页面逻辑
const { messageAPI, isLoggedIn } = require('../../utils/api.js');

Page({
  data: {
    messages: [],
    loading: true
  },

  onLoad() {
    this.loadMessages();
  },

  onShow() {
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
        read: msg.read
      }));
      
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
  }
});