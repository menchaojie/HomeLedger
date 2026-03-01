// 家庭页面逻辑
const { familyAPI, authAPI, getToken, isLoggedIn } = require('../../utils/api.js');

Page({
  data: {
    show: false,
    family: null,
    members: [],
    currentUser: null,
    loading: true,
    isLoggedIn: false  // 登录状态
  },

  showPopup() {
    this.setData({ show: true });
  },

  onClose() {
    this.setData({ show: false });
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
        // 确保只显示当前用户实际加入的家庭
        // 遍历家庭列表，找到用户所在的家庭
        let userFamily = null;
        for (const family of families) {
          // 获取家庭成员列表
          const members = await familyAPI.getFamilyMembers(family.id);
          // 检查当前用户是否在成员列表中
          const currentMember = members.find(member => member.user_id === userInfo.id || member.userId === userInfo.id);
          if (currentMember) {
            userFamily = family;
            // 确保家庭数据包含必要的字段
            const processedFamily = {
              ...family,
              memberCount: members.length, // 使用成员列表长度作为成员数
              createdAt: this.formatDate(family.created_at || family.createdAt) // 处理不同的字段名并格式化时间
            };
            
            // 构建包含家庭成员角色的当前用户信息
            const currentUserWithRole = {
              ...userInfo,
              familyRole: currentMember.role // 使用家庭成员表中的角色
            };
            
            this.setData({ 
              family: processedFamily,
              members,
              currentUser: currentUserWithRole
            });
            break;
          }
        }
        
        // 如果没有找到用户所在的家庭，清空家庭信息
        if (!userFamily) {
          this.setData({ 
            family: null, 
            members: [] 
          });
        }
      } else {
        // 没有家庭数据，清空家庭信息
        this.setData({ 
          family: null, 
          members: [] 
        });
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
      createdAt: this.formatDate('2026-01-01'),
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
      role: 'admin', // 模拟用户表中的角色
      familyRole: 'admin' // 模拟家庭成员表中的角色
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
      title: member.user_name + ' 的余额',
      content: '当前余额: ' + (member.balance || 0) + ' 元',
      // content: JSON.stringify(member, null, 2),
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
      editable: true,
      placeholderText: '请输入家庭ID',
      showCancel: true,
      confirmText: '提交',
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            const familyId = res.content.trim();
            if (!familyId) {
              wx.showToast({
                title: '请输入家庭ID',
                icon: 'none'
              });
              return;
            }
            await familyAPI.joinFamily(familyId);
            wx.showToast({
              title: '加入成功',
              icon: 'success'
            });
            // 重新加载数据
            this.loadFamilyData();
          } catch (error) {
            console.error('加入家庭失败:', error);
            wx.showToast({
              title: '加入失败：' + error.message,
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 配额管理
  onQuotaManagement() {
    if (this.data.currentUser && this.data.currentUser.familyRole === 'admin') {
      wx.navigateTo({
        url: '/pages/set-quota/index'
      });
    }
  },

  // 成员审批
  onMemberApproval() {
    if (this.data.currentUser && this.data.currentUser.familyRole === 'admin') {
      wx.showModal({
        title: '成员审批',
        content: '查看和审批成员加入请求(开发中）',
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
    if (this.data.currentUser && this.data.currentUser.familyRole === 'admin') {
      wx.showModal({
        title: '奖励审批',
        content: '查看和审批奖励申请(开发中）',
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

  // 复制家庭ID
  onCopyFamilyId() {
    if (!this.data.family || !this.data.family.id) {
      wx.showToast({
        title: '家庭信息加载中',
        icon: 'none'
      });
      return;
    }

    const familyId = this.data.family.id;
    
    // 使用微信小程序的复制功能
    wx.setClipboardData({
      data: familyId,
      success: () => {
        wx.showToast({
          title: '家庭ID已复制',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('复制失败:', err);
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  },

  // 格式化时间为年月日
  formatDate(dateString) {
    if (!dateString) return '未知';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});
