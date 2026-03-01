// 设置每月额度页面逻辑
const { familyAPI, authAPI, isLoggedIn } = require('../../utils/api.js');

Page({
  data: {
    family: null,
    members: [],
    loading: false
  },

  onLoad(options) {
    this.loadData();
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
  }
});