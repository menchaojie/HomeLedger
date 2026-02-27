// 个人页面逻辑
const { authAPI, rewardAPI, isLoggedIn, setToken } = require('../../utils/api.js');

Page({
  data: {
    user: null,
    currentUser: null,
    loading: true,
    isLoggedIn: false,  // 登录状态
    groupStates: {
      personal: true,    // 个人信息分组默认展开
      app: false,        // 应用设置分组默认收起
      account: false     // 账户操作分组默认收起
    }
  },

  onLoad() {
    this.loadUserData();
  },

  onShow() {
    // 页面显示时重新检查登录状态
    this.loadUserData();
  },

  // 加载用户数据
  async loadUserData() {
    this.setData({ loading: true });
    try {
      const loggedIn = isLoggedIn();
      this.setData({ isLoggedIn: loggedIn });
      
      if (loggedIn) {
        // 获取当前用户信息
        const userInfo = await authAPI.getCurrentUser();
        // 处理用户数据
        const processedUser = this.processUserData(userInfo);
        
        this.setData({
          user: processedUser,
          currentUser: processedUser
        });
      } else {
        // 未登录状态
        this.setData({
          user: null,
          currentUser: null
        });
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
      // API调用失败时使用模拟数据
      this.useMockData();
    } finally {
      this.setData({ loading: false });
    }
  },

  // 处理用户数据，添加默认值
  processUserData(userData) {
    if (!userData) return null;
    
    // 复制用户数据，避免修改原始数据
    const processedUser = { ...userData };
    
    // 如果头像为空或无效，使用默认头像
    if (!processedUser.avatar || processedUser.avatar === '' || processedUser.avatar === 'null') {
      processedUser.avatar = '/assets/default-avatar.png';
    }
    
    // 如果昵称为空或无效，使用默认昵称
    if (!processedUser.name || processedUser.name === '' || processedUser.name === 'null') {
      processedUser.name = '未设置昵称';
    }
    
    // 如果留言为空或无效，使用默认留言
    if (!processedUser.message || processedUser.message === '' || processedUser.message === 'null') {
      processedUser.message = '今天也要赚钱';
    }
    
    return processedUser;
  },

  // 使用模拟数据
  useMockData() {
    const mockUser = {
      name: 'Alice',
      message: '今天也要赚钱',
      avatar: '', // 模拟空头像，将使用默认头像
      balance: 120
    };
    
    const mockCurrentUser = {
      role: 'admin' // 模拟当前用户是管理员
    };
    
    // 处理用户数据
    const processedUser = this.processUserData(mockUser);
    
    this.setData({
      user: processedUser,
      currentUser: mockCurrentUser
    });
  },

  // 切换分组展开/收起状态
  toggleGroup(e) {
    const group = e.currentTarget.dataset.group;
    const currentState = this.data.groupStates[group];
    
    // 切换当前分组的状态
    this.setData({
      [`groupStates.${group}`]: !currentState
    });
  },

  // 编辑个人资料
  onEditProfile() {
    const user = this.data.user;
    
    wx.navigateTo({
      url: '/pages/edit-profile/index',
      success: (res) => {
        // 传递用户数据给编辑页面
        res.eventChannel.emit('userData', {
          user: user
        });
      }
    });
  },

  // 修改密码
  onChangePassword() {
    wx.navigateTo({
      url: '/pages/change-password/index'
    });
  },

  // 查看余额变动记录
  onBalanceHistory() {
    wx.showModal({
      title: '余额变动记录',
      content: '显示余额的历史变动',
      showCancel: false
    });
  },

  // 提交奖励申请
  onSubmitReward() {
    wx.showModal({
      title: '提交奖励申请',
      content: '请填写奖励申请详情',
      showCancel: true,
      confirmText: '提交',
      success: async (res) => {
        if (res.confirm) {
          try {
            await rewardAPI.createReward({
              family_id: 1, // 假设家庭ID为1
              amount: 100,
              reason: '完成重要任务',
              description: '详细说明奖励原因'
            });
            wx.showToast({
              title: '申请已提交',
              icon: 'success'
            });
          } catch (error) {
            console.error('提交奖励申请失败:', error);
          }
        }
      }
    });
  },

  // 奖励审批
  onRewardApproval() {
    if (this.data.currentUser && this.data.currentUser.role === 'admin') {
      wx.showModal({
        title: '奖励审批',
        content: '查看和审批奖励申请',
        showCancel: true,
        confirmText: '查看',
        success: (res) => {
          if (res.confirm) {
            wx.showToast({
              title: '进入审批页面',
              icon: 'success'
            });
          }
        }
      });
    }
  },

  // 修改昵称
  onEditName() {
    wx.showModal({
      title: '修改昵称',
      content: '输入新昵称',
      showCancel: true,
      confirmText: '保存',
      success: async (res) => {
        if (res.confirm) {
          try {
            await authAPI.updateUser({
              nickname: '新昵称'
            });
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            });
            // 重新加载数据
            this.loadUserData();
          } catch (error) {
            console.error('修改昵称失败:', error);
          }
        }
      }
    });
  },

  // 修改头像
  onEditAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 这里可以实现头像上传逻辑
        wx.showToast({
          title: '头像更新成功',
          icon: 'success'
        });
      }
    });
  },

  // 通知设置
  onNotificationSettings() {
    wx.showModal({
      title: '通知设置',
      content: '正在开发中',
      showCancel: false
    });
  },

  // 系统设置
  onSystemSettings() {
    wx.showModal({
      title: '系统设置',
      content: '正在开发中',
      showCancel: false
    });
  },
  // 系统设置
  onAboutApp() {
    wx.showModal({
      title: '关于',
      content: '正在开发中',
      showCancel: false
    });
  },

  // 登录
  onWechatLogin() {
    wx.navigateTo({
      url: '/pages/login/index'
    });
  },

  // 注册
  onRegister() {
    wx.navigateTo({
      url: '/pages/register/index'
    });
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      showCancel: true,
      confirmText: '退出',
      success: (res) => {
        if (res.confirm) {
          authAPI.logout();
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
          
          // 通知全局应用更新tabBar状态
          const app = getApp();
          if (app && app.onLoginStatusChange) {
            app.onLoginStatusChange();
          }
          
          // 更新登录状态并重新加载数据
          this.setData({ isLoggedIn: false });
          this.loadUserData();
        }
      }
    });
  }
});
