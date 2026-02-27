// API 工具类
// 微信小程序开发阶段使用本地后端，生产环境使用真实域名
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// 存储 token
let token = '';

// 设置 token
export function setToken(newToken) {
  token = newToken;
  console.log('设置 token:', newToken);
  wx.setStorageSync('token', newToken);
  console.log('存储 token 成功');
}

// 获取 token
export function getToken() {
  if (!token) {
    token = wx.getStorageSync('token') || '';
    console.log('从存储获取 token:', token);
  }
  return token;
}

// 检查是否已登录
export function isLoggedIn() {
  return !!getToken();
}

// 通用请求方法
async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // 添加认证 token
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('API 请求 - URL:', `${API_BASE_URL}${url}`);
  console.log('API 请求 - 方法:', options.method || 'GET');
  console.log('API 请求 - 数据:', options.data);
  console.log('API 请求 - 头部:', headers);

  try {
    const response = await new Promise((resolve, reject) => {
      wx.request({
        url: `${API_BASE_URL}${url}`,
        method: options.method || 'GET',
        data: options.data,
        header: headers,
        success: resolve,
        fail: reject
      });
    });
    
    console.log('API 响应 - 状态码:', response.statusCode);
    console.log('API 响应 - 数据:', response.data);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.data;
    } else if (response.statusCode === 401) {
      // 未授权，清除 token 并跳转到登录页
      setToken('');
      wx.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/profile/index'
        });
      }, 1500);
      throw new Error('未授权');
    } else {
      throw new Error(response.data.detail || '请求失败');
    }
  } catch (error) {
    wx.showToast({
      title: error.message || '网络错误',
      icon: 'none'
    });
    throw error;
  }
}

// 认证相关 API
export const authAPI = {
  // 登录
  async login(username, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      data: { username, password }
    });
    setToken(data.access_token);
    return data;
  },

  // 注册
  async register(registerData) {
    const data = await request('/auth/register', {
      method: 'POST',
      data: registerData
    });
    setToken(data.access_token);
    return data;
  },

  // 获取当前用户信息
  async getCurrentUser() {
    return request('/auth/me');
  },

  // 更新用户信息
  async updateUser(info) {
    return request('/auth/me', {
      method: 'PUT',
      data: info
    });
  },

  // 修改密码
  async updatePassword(oldPassword, newPassword) {
    return request('/auth/me/password', {
      method: 'PUT',
      data: { old_password: oldPassword, new_password: newPassword }
    });
  },

  // 登出
  logout() {
    setToken('');
  }
};

// 家庭相关 API
export const familyAPI = {
  // 获取家庭列表
  async getFamilies() {
    return request('/families');
  },

  // 创建家庭
  async createFamily(name, description) {
    return request('/families', {
      method: 'POST',
      data: { name, description }
    });
  },

  // 获取家庭详情
  async getFamilyDetail(familyId) {
    return request(`/families/${familyId}`);
  },

  // 更新家庭信息
  async updateFamily(familyId, info) {
    return request(`/families/${familyId}`, {
      method: 'PUT',
      data: info
    });
  },

  // 删除家庭
  async deleteFamily(familyId) {
    return request(`/families/${familyId}`, {
      method: 'DELETE'
    });
  },

  // 加入家庭
  async joinFamily(familyId) {
    return request(`/families/${familyId}/join`, {
      method: 'POST'
    });
  },

  // 获取家庭成员列表
  async getFamilyMembers(familyId) {
    return request(`/families/${familyId}/members`);
  },

  // 更新成员角色
  async updateMemberRole(familyId, memberId, role) {
    return request(`/families/${familyId}/members/${memberId}`, {
      method: 'PUT',
      data: { role }
    });
  },

  // 移除家庭成员
  async removeMember(familyId, memberId) {
    return request(`/families/${familyId}/members/${memberId}`, {
      method: 'DELETE'
    });
  }
};

// 交易相关 API
export const transactionAPI = {
  // 获取交易记录
  async getTransactions() {
    return request('/transactions');
  },

  // 创建交易记录
  async createTransaction(data) {
    return request('/transactions', {
      method: 'POST',
      data
    });
  },

  // 获取交易详情
  async getTransactionDetail(transactionId) {
    return request(`/transactions/${transactionId}`);
  },

  // 更新交易记录
  async updateTransaction(transactionId, data) {
    return request(`/transactions/${transactionId}`, {
      method: 'PUT',
      data
    });
  },

  // 删除交易记录
  async deleteTransaction(transactionId) {
    return request(`/transactions/${transactionId}`, {
      method: 'DELETE'
    });
  }
};

// 任务相关 API
export const taskAPI = {
  // 获取任务列表
  async getTasks() {
    return request('/tasks');
  },

  // 创建任务
  async createTask(data) {
    return request('/tasks', {
      method: 'POST',
      data
    });
  },

  // 获取任务详情
  async getTaskDetail(taskId) {
    return request(`/tasks/${taskId}`);
  },

  // 更新任务状态
  async updateTask(taskId, data) {
    return request(`/tasks/${taskId}`, {
      method: 'PUT',
      data
    });
  },

  // 删除任务
  async deleteTask(taskId) {
    return request(`/tasks/${taskId}`, {
      method: 'DELETE'
    });
  }
};

// 奖励相关 API
export const rewardAPI = {
  // 获取奖励列表
  async getRewards() {
    return request('/rewards');
  },

  // 创建奖励申请
  async createReward(data) {
    return request('/rewards', {
      method: 'POST',
      data
    });
  },

  // 获取奖励详情
  async getRewardDetail(rewardId) {
    return request(`/rewards/${rewardId}`);
  },

  // 更新奖励状态
  async updateReward(rewardId, data) {
    return request(`/rewards/${rewardId}`, {
      method: 'PUT',
      data
    });
  },

  // 删除奖励申请
  async deleteReward(rewardId) {
    return request(`/rewards/${rewardId}`, {
      method: 'DELETE'
    });
  }
};

// 服务相关 API
export const serviceAPI = {
  // 获取服务列表
  async getServices() {
    return request('/services');
  },

  // 创建服务
  async createService(data) {
    return request('/services', {
      method: 'POST',
      data
    });
  },

  // 获取服务详情
  async getServiceDetail(serviceId) {
    return request(`/services/${serviceId}`);
  },

  // 更新服务信息
  async updateService(serviceId, data) {
    return request(`/services/${serviceId}`, {
      method: 'PUT',
      data
    });
  },

  // 删除服务
  async deleteService(serviceId) {
    return request(`/services/${serviceId}`, {
      method: 'DELETE'
    });
  }
};