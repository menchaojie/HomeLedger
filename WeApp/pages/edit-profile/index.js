// 编辑资料页面逻辑
const { authAPI } = require('../../utils/api.js');

Page({
  data: {
    formData: {
      nickname: '',
      user_name: '',
      message: '',
      avatar: '',
      phone: '',
      email: '',
      role: ''
    }
  },

  onLoad() {
    // 获取传递的用户数据
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on('userData', (data) => {
        const user = data.user;
        this.setData({
          formData: {
            nickname: user.nickname || '',
            user_name: user.user_name || '',
            message: user.message || '',
            avatar: user.avatar || '',
            phone: user.phone || '',
            email: user.email || '',
            role: user.role || ''
          }
        });
      });
    }
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  },

  // 选择头像
  onChooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        wx.showLoading({ title: '上传中...' });
        
        // 使用 wx.uploadFile 上传文件
        wx.uploadFile({
          url: 'http://127.0.0.1:8000/api/auth/me/avatar',
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            'Authorization': 'Bearer ' + wx.getStorageSync('token')
          },
          formData: {},
          success: (uploadRes) => {
            wx.hideLoading();
            if (uploadRes.statusCode === 200) {
              const data = JSON.parse(uploadRes.data);
              console.log('头像上传成功:', data);
              this.setData({
                'formData.avatar': data.avatar_url
              });
              wx.showToast({ title: '头像上传成功' });
            } else {
              console.error('头像上传失败:', uploadRes);
              wx.showToast({ title: '头像上传失败', icon: 'none' });
            }
          },
          fail: (error) => {
            wx.hideLoading();
            console.error('头像上传失败:', error);
            wx.showToast({ title: '头像上传失败', icon: 'none' });
          }
        });
      }
    });
  },

  // 昵称变化
  onNicknameChange(e) {
    console.log('昵称变化 - 事件数据:', e);
    const value = e.detail.value || e.detail;
    this.setData({
      'formData.nickname': value
    });
  },

  // 用户名变化
  onUserNameChange(e) {
    const value = e.detail.value || e.detail;
    this.setData({
      'formData.user_name': value
    });
  },

  // 留言变化
  onMessageChange(e) {
    const value = e.detail.value || e.detail;
    this.setData({
      'formData.message': value
    });
  },

  // 手机号变化
  onPhoneChange(e) {
    const value = e.detail.value || e.detail;
    this.setData({
      'formData.phone': value
    });
  },

  // 邮箱变化
  onEmailChange(e) {
    const value = e.detail.value || e.detail;
    this.setData({
      'formData.email': value
    });
  },

  // 角色变化
  onRoleChange(e) {
    const value = e.detail.value || e.detail;
    this.setData({
      'formData.role': value
    });
  },

  // 保存修改
  async onSave() {
    const formData = this.data.formData;
    
    // 处理 undefined 值，转换为空字符串
    const processedData = {
      nickname: formData.nickname || '',
      user_name: formData.user_name || '',
      message: formData.message || '',
      phone: formData.phone || '',
      email: formData.email || '',
      role: formData.role || ''
    };
    
    console.log('编辑资料 - 提交的数据:', processedData);
    
    try {
      // 调用更新用户信息 API
      console.log('编辑资料 - 准备调用 API');
      const result = await authAPI.updateUser(processedData);
      console.log('编辑资料 - API 调用成功:', result);
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('保存失败:', error);
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    }
  }
});