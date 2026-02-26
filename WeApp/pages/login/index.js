// 登录页面逻辑
const { authAPI, setToken, isLoggedIn } = require('../../utils/api.js');

Page({
  data: {
    // 表单数据
    username: '',
    password: '',
    
    // 状态
    loading: false,
    errors: {}
  },

  onLoad() {
    // 如果已经登录，跳转到首页
    if (isLoggedIn()) {
      wx.switchTab({
        url: '/pages/family/index'
      });
    }
  },

  // 用户名输入
  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
    this.clearError('username');
  },

  // 密码输入
  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
    this.clearError('password');
  },

  // 清除错误
  clearError(field) {
    const errors = { ...this.data.errors };
    delete errors[field];
    this.setData({ errors });
  },

  // 表单验证
  validateForm() {
    const errors = {};
    const { username, password } = this.data;

    // 用户名验证
    if (!username.trim()) {
      errors.username = '请输入用户名';
    }

    // 密码验证
    if (!password) {
      errors.password = '请输入密码';
    }

    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  // 登录
  async onLogin() {
    if (!this.validateForm()) {
      wx.showToast({
        title: '请检查表单信息',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      const { username, password } = this.data;
      
      // 调用登录API
      const result = await authAPI.login(username, password);
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      // 设置token
      setToken(result.access_token);
      
      // 跳转到个人页面（登录后的状态）
      setTimeout(() => {
        // 先关闭当前页面，再跳转到个人页面
        wx.navigateBack({
          delta: 1
        });
        
        // 延迟刷新个人页面数据
        setTimeout(() => {
          const pages = getCurrentPages();
          const profilePage = pages.find(page => page.route === 'pages/profile/index');
          if (profilePage && profilePage.loadUserData) {
            profilePage.loadUserData();
          }
        }, 500);
      }, 1500);

    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({
        title: '登录失败：' + (error.message || '用户名或密码错误'),
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 跳转到注册页面
  onGoToRegister() {
    wx.navigateTo({
      url: '/pages/register/index'
    });
  }
});