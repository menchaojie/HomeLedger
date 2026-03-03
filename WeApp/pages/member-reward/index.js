// 成员奖励页面逻辑
const { familyAPI, transactionAPI, authAPI, getToken, isLoggedIn } = require('../../utils/api.js');

Page({
  data: {
    members: [],
    selectedMemberIndex: 0,
    selectedMember: null,
    amount: '',
    description: '',
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
      selectedMember: member
    });
  },

  // 金额输入
  onAmountInput(e) {
    this.setData({ amount: e.detail.value });
  },

  // 描述输入
  onDescriptionInput(e) {
    this.setData({ description: e.detail.value });
  },

  // 提交奖励
  async submitReward() {
    const { selectedMember, amount, description, family } = this.data;

    // 验证输入
    if (!selectedMember) {
      wx.showToast({ title: '请选择成员', icon: 'none' });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      wx.showToast({ title: '请输入有效的奖励金额', icon: 'none' });
      return;
    }

    if (!description) {
      wx.showToast({ title: '请输入奖励描述', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    try {
      // 创建奖励交易
      const transactionData = {
        family_id: family.id,
        event_type: 'reward',
        amount: parseFloat(amount),
        from_member_id: null, // 奖励是系统发放，不需要来源
        to_member_id: selectedMember.id,
        description: description,
        status: 'confirmed'
      };

      const result = await transactionAPI.createTransaction(transactionData);
      
      wx.showToast({
        title: '奖励发放成功',
        icon: 'success'
      });

      // 延迟返回
      setTimeout(() => {
        this.onBack();
      }, 1500);
    } catch (error) {
      console.error('提交奖励失败:', error);
      wx.showToast({
        title: '提交失败：' + error.message,
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