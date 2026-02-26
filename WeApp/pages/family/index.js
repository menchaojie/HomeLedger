// 家庭页面逻辑
const { familyAPI, authAPI } = require('../../utils/api.js');

Page({
  data: {
    family: null,
    members: [],
    currentUser: null,
    loading: true,
    isLoggedIn: false  // 登录状态
  },

  onLoad() {
    console.log('家庭页面加载，当前 token:', getToken());
    this.loadFamilyData();
  },

  onShow() {
    // 页面显示时重新检查登录状态
    console.log('家庭页面显示，当前 token:', getToken());
    this.loadFamilyData();
  },

  // 加载家庭数据
  async loadFamilyData() {
    this.setData({ loading: true });
    try {
      const loggedIn = isLoggedIn();
      this.setData({ isLoggedIn: loggedIn });
      
      if (!loggedIn) {
        // 未登录状态，不加载数据
        this.setData({ 
          family: null, 
          members: [], 
          currentUser: null 
        });
        return;
      }
      
      // 获取当前用户信息
      const userInfo = await authAPI.getCurrentUser();
      this.setData({ currentUser: userInfo });

      // 获取家庭列表
      const families = await familyAPI.getFamilies();
      if (families.length > 0) {
        const family = families[0]; // 假设用户只有一个家庭
        this.setData({ family });
        
        // 获取家庭成员列表
        const members = await familyAPI.getFamilyMembers(family.id);
        this.setData({ members });
      }
    } catch (error) {
      console.error('加载家庭数据失败:', error);
      // API调用失败时使用模拟数据
      this.useMockData();
    } finally {
      this.setData({ loading: false });
    }
  },

  // 使用模拟数据
  useMockData() {
    const mockFamily = {
      name: 'Home Name',
      id: 'HL-1234',
      memberCount: 5,
      createdAt: '2026-01-01',
      avatar: '/assets/default-family-avatar.png'
    };
    
    const mockMembers = [
      { id: 1, name: 'Alice', balance: 120, role: 'member', avatar: '/assets/default-avatar.png' },
      { id: 2, name: 'Bob', balance: 85, role: 'admin', avatar: '/assets/default-avatar.png' },
      { id: 3, name: 'Carol', balance: 60, role: 'member', avatar: '/assets/default-avatar.png' },
      { id: 4, name: 'Dave', balance: 95, role: 'member', avatar: '/assets/default-avatar.png' },
      { id: 5, name: 'Eve', balance: 70, role: 'member', avatar: '/assets/default-avatar.png' }
    ];
    
    const mockCurrentUser = {
      role: 'admin' // 模拟当前用户是管理员
    };
    
    this.setData({
      family: mockFamily,
      members: mockMembers,
      currentUser: mockCurrentUser
    });
  },

  // 点击成员头像，显示余额详情
  onMemberClick(e) {
    const member = this.data.members[e.currentTarget.dataset.index];
    wx.showModal({
      title: member.name + ' 的余额',
      content: '当前余额: ' + (member.balance || 0) + ' 元',
      showCancel: false
    });
  },

  // 创建家庭
  onCreateFamily() {
    wx.showModal({
      title: '创建家庭',
      content: '请输入家庭名称',
      editable: true,
      placeholderText: '例如：幸福之家、快乐家庭',
      showCancel: true,
      confirmText: '创建',
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            const familyName = res.content.trim();
            if (!familyName) {
              wx.showToast({
                title: '请输入家庭名称',
                icon: 'none'
              });
              return;
            }
            
            const family = await familyAPI.createFamily(familyName, '');
            wx.showToast({
              title: '家庭创建成功',
              icon: 'success'
            });
            // 重新加载数据
            this.loadFamilyData();
          } catch (error) {
            console.error('创建家庭失败:', error);
            wx.showToast({
              title: '创建失败：' + error.message,
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 加入家庭
  onJoinFamily() {
    wx.showModal({
      title: '加入家庭',
      content: '请输入家庭ID',
      showCancel: true,
      confirmText: '提交',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 假设家庭ID为1
            await familyAPI.joinFamily(1);
            wx.showToast({
              title: '申请已提交',
              icon: 'success'
            });
            // 重新加载数据
            this.loadFamilyData();
          } catch (error) {
            console.error('加入家庭失败:', error);
          }
        }
      }
    });
  },

  // 设置每月额度
  onSetMonthlyLimit() {
    if (this.data.currentUser && this.data.currentUser.role === 'admin') {
      wx.showModal({
        title: '设置每月额度',
        content: '请输入每月自由支配资金额度',
        showCancel: true,
        confirmText: '提交',
        success: async (res) => {
          if (res.confirm) {
            try {
              if (this.data.family) {
                await familyAPI.updateFamily(this.data.family.id, {
                  monthly_allowance: 1000 // 假设设置为1000元
                });
                wx.showToast({
                  title: '设置成功',
                  icon: 'success'
                });
                // 重新加载数据
                this.loadFamilyData();
              }
            } catch (error) {
              console.error('设置每月额度失败:', error);
            }
          }
        }
      });
    }
  },

  // 成员审批
  onMemberApproval() {
    if (this.data.currentUser && this.data.currentUser.role === 'admin') {
      wx.showModal({
        title: '成员审批',
        content: '查看和审批成员加入请求',
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
  }
});
