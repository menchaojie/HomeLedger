// 支出记账页面逻辑
const { transactionAPI, familyAPI, isLoggedIn } = require('../../utils/api.js');

Page({
  data: {
    amount: '',
    description: '',
    families: [],
    selectedFamilyId: '',
    selectedMemberId: '',
    loading: false,
    submitting: false
  },

  onLoad() {
    // 检查登录状态，如果未登录跳转到欢迎页面
    if (!isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/welcome/index'
      });
      return;
    }
    console.log('Expense record page loaded');
    // 恢复加载家庭的逻辑
    this.loadFamilies();
  },

  onShow() {
    // 检查登录状态，如果未登录跳转到欢迎页面
    if (!isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/welcome/index'
      });
      return;
    }
  },

  // 加载用户的家庭列表
  async loadFamilies() {
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

      // 获取用户的家庭列表
      console.log('Loading families...');
      const families = await familyAPI.getFamilies();
      console.log('Families:', families);
      
      this.setData({ families });
      
      // 如果有家庭，默认选择第一个
      if (families.length > 0) {
        console.log('Selecting first family:', families[0].id);
        this.setData({ selectedFamilyId: families[0].id });
        // 加载家庭成员
        this.loadFamilyMembers(families[0].id);
      } else {
        console.error('No families found');
        wx.showToast({
          title: '您还没有加入任何家庭',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (error) {
      console.error('加载家庭列表失败:', error);
      wx.showToast({
        title: '加载家庭列表失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载家庭成员
  async loadFamilyMembers(familyId) {
    try {
      console.log('Loading family members for family:', familyId);
      const members = await familyAPI.getFamilyMembers(familyId);
      console.log('Family members:', members);
      
      // 找到当前用户对应的家庭成员
      const currentUserMember = members.find(member => member.is_current_user);
      console.log('Current user member:', currentUserMember);
      
      if (currentUserMember) {
        this.setData({ selectedMemberId: currentUserMember.id });
        console.log('Selected member ID:', currentUserMember.id);
      } else {
        // 如果没有找到当前用户，使用第一个成员
        if (members.length > 0) {
          this.setData({ selectedMemberId: members[0].id });
          console.log('Using first member as selected:', members[0].id);
        } else {
          console.error('No members found in this family');
        }
      }
    } catch (error) {
      console.error('加载家庭成员失败:', error);
    }
  },

  // 家庭选择变化
  async onFamilyChange(e) {
    const familyId = e.detail.value;
    this.setData({ selectedFamilyId: familyId });
    // 加载对应家庭的成员
    this.loadFamilyMembers(familyId);
  },

  // 金额输入
  onAmountInput(e) {
    this.setData({ amount: e.detail.value });
  },

  // 描述输入
  onDescriptionInput(e) {
    this.setData({ description: e.detail.value });
  },

  // 提交支出记录
  async submitExpense() {
    const { amount, description, selectedFamilyId, selectedMemberId } = this.data;
    
    // 验证输入
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      wx.showToast({
        title: '请输入有效的金额',
        icon: 'none'
      });
      return;
    }
    
    if (!description) {
      wx.showToast({
        title: '请输入支出描述',
        icon: 'none'
      });
      return;
    }
    
    if (!selectedFamilyId) {
      wx.showToast({
        title: '请选择家庭',
        icon: 'none'
      });
      return;
    }
    
    if (!selectedMemberId) {
      wx.showToast({
        title: '请选择成员',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ submitting: true });
    try {
      // 创建支出交易记录
      const transaction = await transactionAPI.createTransaction({
        family_id: selectedFamilyId,
        event_type: 'expense',
        amount: parseFloat(amount),
        from_member_id: selectedMemberId,
        to_member_id: null, // 支出没有收款方
        description: description
      });
      
      wx.showToast({
        title: '支出记录成功',
        icon: 'success'
      });
      
      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('提交支出失败:', error);
      wx.showToast({
        title: error.message || '提交失败',
        icon: 'none'
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  }
});