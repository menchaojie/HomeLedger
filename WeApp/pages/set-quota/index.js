// 设置每月额度页面逻辑
const { familyAPI, authAPI, isLoggedIn } = require('../../utils/api.js');

Page({
  data: {
    family: null,
    members: [],
    loading: false
  },

  onLoad(options) {
    // 检查登录状态，如果未登录跳转到欢迎页面
    if (!isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/welcome/index'
      });
      return;
    }
    this.loadData();
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

  // 加载数据
  async loadData() {
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

      // 获取当前用户信息
      const userInfo = await authAPI.getCurrentUser();

      // 获取家庭列表
      const families = await familyAPI.getFamilies();
      if (families.length > 0) {
        // 找到用户所在的家庭
        for (const family of families) {
          const members = await familyAPI.getFamilyMembers(family.id);
          const isMember = members.some(member => 
            member.user_id === userInfo.id || member.userId === userInfo.id
          );
          if (isMember) {
            this.setData({
              family,
              members: members.map(member => ({
                ...member,
                monthly_quota: member.monthly_quota || 0
              }))
            });
            break;
          }
        }
      }

      if (!this.data.family) {
        wx.showToast({
          title: '您还没有加入家庭',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      wx.showToast({
        title: '加载失败：' + error.message,
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 额度变更
  onQuotaChange(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const members = [...this.data.members];
    members[index].monthly_quota = parseFloat(value) || 0;
    this.setData({ members });
  },

  // 保存设置
  async onSave() {
    if (!this.data.family) return;

    this.setData({ loading: true });
    try {
      // 遍历成员，更新每月额度
      const updatePromises = this.data.members.map(async (member) => {
        try {
          // 调用更新成员的API
          await familyAPI.updateMemberRole(
            this.data.family.id,
            member.id || member.user_id || member.userId,
            member.role,
            member.monthly_quota
          );
        } catch (error) {
          console.error(`更新成员 ${member.name} 额度失败:`, error);
          // 继续处理其他成员
        }
      });

      // 等待所有更新完成
      await Promise.all(updatePromises);

      wx.showToast({
        title: '设置成功',
        icon: 'success'
      });

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('保存设置失败:', error);
      wx.showToast({
        title: '保存失败：' + error.message,
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 返回
  onBack() {
    wx.navigateBack();
  },

  // 手动发放配额 - 一次性发放所有成员
  onManualQuotaAllocation() {
    if (!this.data.family || this.data.members.length === 0) {
      wx.showToast({
        title: '家庭信息加载中',
        icon: 'none'
      });
      return;
    }

    // 检查本月是否已经发放过配额
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // 检查成员中是否有已经发放过配额的
    const alreadyAllocatedMembers = this.data.members.filter(member => {
      // 这里可以根据需要检查交易记录，暂时简单处理
      // 实际项目中应该从API获取发放状态
      return false; // 暂时返回false，实际应该根据后端返回的状态
    });

    // 计算总配额金额
    const totalQuota = this.data.members.reduce((sum, member) => {
      return sum + (parseFloat(member.monthly_quota) || 0);
    }, 0);

    // 显示确认对话框
    let content = `确定要一次性为所有 ${this.data.members.length} 名家庭成员发放配额吗？\n总金额：${totalQuota} 元`;
    
    if (alreadyAllocatedMembers.length > 0) {
      content += `\n\n注意：有 ${alreadyAllocatedMembers.length} 名成员本月已发放过配额，将跳过这些成员。`;
    }

    wx.showModal({
      title: '确认发放配额',
      content: content,
      showCancel: true,
      confirmText: '确认发放',
      success: async (res) => {
        if (res.confirm) {
          try {
            this.setData({ loading: true });
            
            // 调用批量发放配额API
            const transactionAPI = require('../../utils/api.js').transactionAPI;
            const result = await transactionAPI.allocateQuotaToAllMembers(this.data.family.id);
            
            // 根据后端返回的状态显示不同的提示
            if (result && result.status === 'no_allocation_needed') {
              wx.showModal({
                title: '配额发放',
                content: result.message || '本月配额已发放过，没有成员需要发放配额。',
                showCancel: false,
                confirmText: '确定'
              });
            } else if (result && result.status === 'success') {
              wx.showModal({
                title: '配额发放成功',
                content: result.message || `配额发放成功，共为 ${result.allocated_count} 名成员发放配额。`,
                showCancel: false,
                confirmText: '确定'
              });
            } else {
              wx.showToast({
                title: '配额发放成功',
                icon: 'success'
              });
            }
            
            // 刷新数据
            this.loadData();
          } catch (error) {
            console.error('配额发放失败:', error);
            
            // 检查是否是重复发放的错误
            if (error.message && error.message.includes('already received')) {
              wx.showModal({
                title: '配额发放失败',
                content: '本月配额已发放过，不能重复发放。',
                showCancel: false,
                confirmText: '确定'
              });
            } else {
              wx.showToast({
                title: '发放失败：' + error.message,
                icon: 'none'
              });
            }
          } finally {
            this.setData({ loading: false });
          }
        }
      }
    });
  }
});