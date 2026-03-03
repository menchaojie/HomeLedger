// 成员管理页面逻辑
const { familyAPI, authAPI, getToken, isLoggedIn } = require('../../utils/api.js');

Page({
  data: {
    members: [],
    selectedMemberIndex: 0,
    selectedMember: null,
    selectedRoleIndex: 0,
    roleOptions: ['普通成员', '管理员'],
    submitting: false,
    family: null,
    currentUser: null
  },

  onLoad() {
    // 检查登录状态
    if (!isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/welcome/index'
      });
      return;
    }
    this.loadFamilyData();
  },

  // 加载家庭数据
  async loadFamilyData() {
    try {
      // 获取当前用户信息
      const userInfo = await authAPI.getCurrentUser();
      this.setData({ currentUser: userInfo });

      // 获取家庭列表
      const families = await familyAPI.getFamilies();
      if (families.length > 0) {
        // 找到用户所在的家庭
        for (const family of families) {
          const members = await familyAPI.getFamilyMembers(family.id);
          const currentMember = members.find(member => member.user_id === userInfo.id || member.userId === userInfo.id);
          if (currentMember) {
            this.setData({ family: family });
            
            // 构建成员列表，添加displayName字段
            const membersWithDisplayName = members.map(member => ({
              ...member,
              displayName: member.nickname || member.user_name || member.name || '未知成员'
            }));
            
            this.setData({ 
              members: membersWithDisplayName,
              selectedMember: membersWithDisplayName[0],
              selectedMemberIndex: 0
            });
            
            // 设置初始角色选择
            if (membersWithDisplayName[0]) {
              this.setData({
                selectedRoleIndex: membersWithDisplayName[0].role === 'admin' ? 1 : 0
              });
            }
            break;
          }
        }
      }
    } catch (error) {
      console.error('加载家庭数据失败:', error);
      wx.showToast({
        title: '加载数据失败',
        icon: 'none'
      });
    }
  },

  // 成员选择变化
  onMemberChange(e) {
    const index = e.detail.value;
    const member = this.data.members[index];
    this.setData({ 
      selectedMemberIndex: index,
      selectedMember: member,
      selectedRoleIndex: member.role === 'admin' ? 1 : 0
    });
  },

  // 角色选择变化
  onRoleChange(e) {
    const index = parseInt(e.detail.value);
    console.log('角色选择变化:', index);
    this.setData({ selectedRoleIndex: index });
    console.log('更新后的selectedRoleIndex:', this.data.selectedRoleIndex);
  },

  // 更新成员角色
  async updateMemberRole() {
    const { selectedMember, selectedRoleIndex, family } = this.data;

    if (!selectedMember) {
      wx.showToast({ title: '请选择成员', icon: 'none' });
      return;
    }

    console.log('更新成员角色:', selectedMember.displayName);
    console.log('当前角色:', selectedMember.role);
    console.log('selectedRoleIndex:', selectedRoleIndex);

    this.setData({ submitting: true });

    try {
      // 确定新角色
      const newRole = selectedRoleIndex === 1 ? 'admin' : 'member';
      console.log('新角色:', newRole);
      
      // 调用API更新角色
      await familyAPI.updateMemberRole(
        family.id,
        selectedMember.id,
        newRole,
        selectedMember.monthly_quota || selectedMember.monthlyQuota || 0
      );
      
      wx.showToast({
        title: '角色更新成功',
        icon: 'success'
      });

      // 刷新数据
      setTimeout(() => {
        this.loadFamilyData();
      }, 1500);
    } catch (error) {
      console.error('更新角色失败:', error);
      console.error('错误详情:', error.message, error.stack);
      wx.showToast({
        title: '更新失败：' + error.message,
        icon: 'none'
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  // 返回
  onBack() {
    wx.navigateBack();
  }
});