Page({
  data: {
    // 方式1: 单个日期选择
    singleDate: '2026-03-01',
    showSinglePicker: false,
    
    // 方式2: 日期范围选择
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    showRangePicker: false,
    
    // 方式3: 自定义日期输入
    customStartDate: '',
    customEndDate: '',
    
    // 方式4: 快速选择
    quickSelection: 'today',
    
    // 方式5: 日历选择器
    calendarDate: '',
    showCalendar: false,
    
    // 显示结果
    selectionResult: ''
  },

  // 方式1: 单个日期选择器
  onDisplaySingle() {
    this.setData({ showSinglePicker: true });
  },
  onCloseSingle() {
    this.setData({ showSinglePicker: false });
  },
  onConfirmSingle(event) {
    const date = this.formatDate(event.detail);
    this.setData({
      showSinglePicker: false,
      singleDate: date,
      selectionResult: `单个日期: ${date}`
    });
  },

  // 方式2: 日期范围选择器
  onDisplayRange() {
    this.setData({ showRangePicker: true });
  },
  onCloseRange() {
    this.setData({ showRangePicker: false });
  },
  onConfirmRange(event) {
    const [start, end] = event.detail;
    const startStr = this.formatDate(start);
    const endStr = this.formatDate(end);
    this.setData({
      showRangePicker: false,
      startDate: startStr,
      endDate: endStr,
      selectionResult: `日期范围: ${startStr} - ${endStr}`
    });
  },

  // 方式3: 自定义日期输入
  onCustomStartChange(event) {
    this.setData({
      customStartDate: event.detail,
      selectionResult: `自定义: ${event.detail} - ${this.data.customEndDate}`
    });
  },
  onCustomEndChange(event) {
    this.setData({
      customEndDate: event.detail,
      selectionResult: `自定义: ${this.data.customStartDate} - ${event.detail}`
    });
  },

  // 方式4: 快速选择
  onQuickSelection(event) {
    const type = event.currentTarget.dataset.type;
    const now = new Date();
    let startDate, endDate, result;

    switch(type) {
      case 'today':
        startDate = endDate = this.formatDate(now);
        result = `今天: ${startDate}`;
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        startDate = endDate = this.formatDate(yesterday);
        result = `昨天: ${startDate}`;
        break;
      case 'thisWeek':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        startDate = this.formatDate(weekStart);
        endDate = this.formatDate(weekEnd);
        result = `本周: ${startDate} - ${endDate}`;
        break;
      case 'thisMonth':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        startDate = this.formatDate(monthStart);
        endDate = this.formatDate(monthEnd);
        result = `本月: ${startDate} - ${endDate}`;
        break;
    }

    this.setData({
      quickSelection: type,
      selectionResult: result
    });
  },

  // 方式5: 日历选择器
  onDisplayCalendar() {
    this.setData({ showCalendar: true });
  },
  onCloseCalendar() {
    this.setData({ showCalendar: false });
  },
  onConfirmCalendar(event) {
    const date = this.formatDate(event.detail);
    this.setData({
      showCalendar: false,
      calendarDate: date,
      selectionResult: `日历选择: ${date}`
    });
  },

  // 通用方法
  formatDate(date) {
    date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});
