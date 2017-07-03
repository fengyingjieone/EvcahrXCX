//index.js
//获取应用实例
var defaultDevId;
var app = getApp()

var startTime;
var startSwitch;
var momentSwitch;
var endTime;
var endSwitch;

var isEnableState=1;
Page({
  data: {
    deviceCount: false,//设 默认只有一个设备
    disabledState:true,//按钮状态 是否可以点击 默认不能点击
    openCheckedState:false,//按钮状态 是开还是关   默认关
    closeCheckedState: false,//按钮状态 是开还是关   默认关
    momentCheckedState: false//区间检测
  },
  onLoad: function (e) {
    console.log(e.defaultDevId);
    defaultDevId = e.defaultDevId;    
  },
  onShow: function (e) {
    this.getHalfpriceTime();
  },
  getHalfpriceTime:function(){
    var that = this;
    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDevId + '"}');
    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/device/getTimingTimeInfo',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDevId + '"}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log("获取半价电结果")
        console.log(res)
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        if (res.data.Edata[0].code == 0) {
          isEnableState = res.data.Edata[0].data.isEnable;
          startTime = res.data.Edata[0].data.startTime;
          startSwitch = res.data.Edata[0].data.startTimeSwitch;
          momentSwitch = res.data.Edata[0].data.momentSwitch;
          endTime = res.data.Edata[0].data.endTime;
          endSwitch = res.data.Edata[0].data.endTimeSwitch;
          
          that.setData({
            startTime: res.data.Edata[0].data.startTime,//开始时间
            endTime: res.data.Edata[0].data.endTime,//结束时间
            disabledState: false,//按钮是否可以点
            openCheckedState: res.data.Edata[0].data.startTimeSwitch,//开关状态   开启还是关闭
            closeCheckedState: res.data.Edata[0].data.endTimeSwitch,//开关状态   开启还是关闭
            momentCheckedState: res.data.Edata[0].data.momentSwitch
          })
        } else {
          editLock = res.data.Edata[0].data.isEnable;
          wx.showToast({
            title: res.data.Edata[0].msg,
            icon: 'loading',
            duration: 1500,
            mask: true
          })
        }
      },
      fail: function (res) {
        console.log("获取钱包信息失败")
      }
    })
  },
  setHalfpriceTime:function(e){
    console.log(e.currentTarget.id)
    console.log(e.detail.value);
    console.log(isEnableState)
    var btnName = e.currentTarget.id;
    var btnState = e.detail.value;
    if (isEnableState == 0) {
      wx.showToast({
        title:"请在个人中心打开定时开关",
        icon: 'loading',
        duration: 1500,
        mask: true
      })
      if (btnState){
        if (btnName == "open") {
          this.setData({         
            openCheckedState: false//开关状态   开启还是关闭          
          })
        } else if (btnName == "close") {
          this.setData({  
            closeCheckedState:false//开关状态   开启还是关闭
          })
        } else if (btnName == "moment") {
          this.setData({
            momentCheckedState:false
          })
        }
      }else{
        if (btnName == "open") {
          this.setData({
              openCheckedState: true//开关状态   开启还是关闭         
          })
        } else if (btnName == "close") {
          this.setData({
           closeCheckedState: true//开关状态   开启还是关闭
          })
        } else if (btnName == "moment") {
          this.setData({
            momentCheckedState: true
          })
        }
      }
      return;
    }
    if (btnName=="open"){
      var startSwitchInside = btnState;
      var endSwitchInside = endSwitch;
      var momentSwitchInside = momentSwitch;
    } else if (btnName == "close"){
      var startSwitchInside = startSwitch;
      var endSwitchInside = btnState;
      var momentSwitchInside = momentSwitch;
    } else if (btnName == "moment"){
      var startSwitchInside = startSwitch;
      var endSwitchInside = endSwitch;
      var momentSwitchInside = btnState;
    }
    var that = this;
    console.log('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":' + defaultDevId + ',"startTime":"' + startTime + '","startSwitch":"' + startSwitchInside + '","momentSwitch":' + momentSwitchInside + ',"endTime":"' + endTime + '","endSwitch":' + endSwitchInside + '}');

    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":' + defaultDevId + ',"startTime":"' + startTime + '","startSwitch":' + startSwitchInside + ',"momentSwitch":' + momentSwitchInside + ',"endTime":"' + endTime + '","endSwitch":' + endSwitchInside+'}');
    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/usercenter/setTimingTime',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":' + defaultDevId + ',"startTime":"' + startTime + '","startSwitch":' + startSwitchInside + ',"momentSwitch":' + momentSwitchInside + ',"endTime":"' + endTime + '","endSwitch":' + endSwitchInside + '}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log("设置半价电结果")
        console.log(res)
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        if (res.data.Edata[0].code == 0) {
          that.getHalfpriceTime();
          //startSwitch = startSwitchInside;
          //endSwitch = endSwitchInside;
          //momentSwitch = momentSwitchInside;
          wx.showToast({
            title: "设置成功",
            icon: 'loading',
            duration: 1500,
            mask: true
          })
        } else {
          wx.showToast({
            title: res.data.Edata[0].msg,
            icon: 'loading',
            duration: 1500,
            mask: true
          })
        }
      },
      fail: function (res) {
        that.getHalfpriceTime();
        console.log("获取钱包信息失败")
      }
    })
  },
  onShareAppMessage: function () {
    return app.onShareAppMessage();
  },
  toTimeEdit: function () {
    if (isEnableState == 0){
      wx.showToast({
        title: "请在个人中心打开定时开关",
        icon: 'loading',
        duration: 1500,
        mask: true
      })
      return;
    }
    wx.navigateTo({
      url: '../halfPriceTime/timeEdit/index?timeCode=startTime&defaultDevId=' + defaultDevId
    })
  },
  toTimeEditEnd: function () {
    if (isEnableState == 0) {
      wx.showToast({
        title: "请在个人中心打开定时开关",
        icon: 'loading',
        duration: 1500,
        mask: true
      })
      return;
    }
    wx.navigateTo({
      url: '../halfPriceTime/timeEdit/index?timeCode=endTime&defaultDevId=' + defaultDevId
    })
  }
})


