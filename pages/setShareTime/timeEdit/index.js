const date = new Date()
const Hours = []
const Minutes = []

for (let i = 0; i <= 23; i++) {
  if(i<10){i="0"+i}
  Hours.push(i)
}//设置小时数

for (let i = 0; i <= 59; i++) {
  if (i < 10) { i = "0" + i }
  Minutes.push(i)
}//设置分钟数
var app = getApp();
var defaultDevId;  
var newStartTimeH, newStartTimeM;
var newEndTimeH, newEndTimeM;
Page({
  data: {
    Hours: Hours,    
    Minutes: Minutes,
    startHour: 1,//文本显示当前
    startMinute: 2,//文本显示当前
    endHour: 2,//文本显示当前
    endMinute:3,//文本显示当前
    valueOfStart: [1, 1],//初始位置
    valueOfEnd: [2, 2]//初始位置
  },
  onLoad: function (e) {
    console.log(e.defaultDevId);
    defaultDevId = e.defaultDevId;
  },
  onShow:function(){
    this.getshareTime();
  },
  bindChangeOfStart: function (e) {
    console.log(e)
    const val = e.detail.value
    newStartTimeH = this.data.Hours[val[2]];
    newStartTimeM = this.data.Minutes[val[4]]
    this.setData({
      startHour: this.data.Hours[val[2]],
      startMinute: this.data.Minutes[val[4]]
    })
  },
  bindChangeOfEnd: function (e) {
    console.log(e.detail.value)
    const val = e.detail.value
    newEndTimeH = this.data.Hours[val[2]];
    newEndTimeM = this.data.Minutes[val[4]]
    this.setData({
      endHour: this.data.Hours[val[2]],
      endMinute: this.data.Minutes[val[4]]
    })
  },
  getshareTime: function () {
    var that = this;
    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDevId + '","type":1}');
    console.log("头部信息" + evheader);
    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/device/queryDeviceTimeConfigs',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDevId + '","type":1}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        var startTimeArray = (res.data.Edata[0].data[0].startTime).split(":"); //字符分割 
        var endTimeArray = (res.data.Edata[0].data[0].endTime).split(":"); //字符分割 
        newStartTimeH = startTimeArray[0];
        newStartTimeM = startTimeArray[1];
        newEndTimeH = endTimeArray[0];
        newEndTimeM = endTimeArray[1];
        that.setData({
          valueOfStart: [0, 0, startTimeArray[0], 0, startTimeArray[1],0,0],
          valueOfEnd: [0, 0, endTimeArray[0], 0, endTimeArray[1], 0, 0]
        })
        console.log((res))
      },
      fail: function (res) {
        console.log("获取钱包信息失败")
      }
    })
  },
  cancleBtn:function(){
    wx.navigateBack({
      delta: 1
    })
  },
  saveBtn: function () {
    var that = this;
    //if (newStartTimeH < 10) { newStartTimeH = "0" + newStartTimeH};
    //if (newStartTimeM < 10) { newStartTimeM = "0" + newStartTimeM };
    //if (newEndTimeH < 10) { newEndTimeH = "0" + newEndTimeH };
    //if (newEndTimeM < 10) { newEndTimeM = "0" + newEndTimeM };
    console.log('{"accessToken":"' + wx.getStorageSync('accessToken') + '","startTime":"' + newStartTimeH + ':' + newStartTimeM + '","endTime":"' + newEndTimeH + ':' +newEndTimeM + '"}')
    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","startTime":"' + newStartTimeH + ':' + newStartTimeM + '","endTime":"' + newEndTimeH + ':' + newEndTimeM + '"}');
    console.log("头部信息" + evheader);
    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/usercenter/setSharetime',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","startTime":"' + newStartTimeH + ':' + newStartTimeM + '","endTime":"' + newEndTimeH + ':' + newEndTimeM + '"}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        console.log("新时间保存结果")
        console.log(res)
        if (res.data.Edata[0].code==0){
          wx.navigateBack({
            delta: 1
          })
        }else{
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
  }
})