// 注册页面逻辑
const { authAPI, setToken, isLoggedIn } = require('../../utils/api.js');

Page({
  data: {
    // 表单数据
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    email: '',
    roleIndex: 0,
    roleOptions: ['爸爸', '妈妈', '孩子', '其他家庭成员'],
    
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

  // 确认密码输入
  onConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value });
    this.clearError('confirmPassword');
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
    this.clearError('phone');
  },

  // 邮箱输入
  onEmailInput(e) {
    this.setData({ email: e.detail.value });
    this.clearError('email');
  },

  // 角色选择
  onRoleChange(e) {
    this.setData({ roleIndex: e.detail.value });
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
    const { username, password, confirmPassword, phone, email } = this.data;

    // 用户名验证
    if (!username.trim()) {
      errors.username = '请输入用户名';
    } else if (username.length < 2) {
      errors.username = '用户名至少2个字符';
    } else if (username.length > 20) {
      errors.username = '用户名不能超过20个字符';
    }

    // 密码验证
    if (!password) {
      errors.password = '请输入密码';
    } else if (password.length < 6) {
      errors.password = '密码至少6个字符';
    } else if (password.length > 20) {
      errors.password = '密码不能超过20个字符';
    }

    // 确认密码验证
    if (!confirmPassword) {
      errors.confirmPassword = '请确认密码';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }

    // 手机号验证
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      errors.phone = '请输入正确的手机号';
    }

    // 邮箱验证
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '请输入正确的邮箱地址';
    }

    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  // 注册
  async onRegister() {
    if (!this.validateForm()) {
      wx.showToast({
        title: '请检查表单信息',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      const { username, password, phone, email, roleIndex, roleOptions } = this.data;
      
      // 构建注册数据
      const registerData = {
        username: username.trim(),
        password,
        phone: phone.trim() || null,
        email: email.trim() || null,
        role: roleOptions[roleIndex]
      };

      // 调用注册API
      const result = await authAPI.register(registerData);
      
      wx.showToast({
        title: '注册成功',
        icon: 'success'
      });

      // 自动登录
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
      console.error('注册失败:', error);
      wx.showToast({
        title: '注册失败：' + (error.message || '网络错误'),
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 跳转到登录页面
  onGoToLogin() {
    wx.navigateTo({
      url: '/pages/login/index'
    });
  }
});