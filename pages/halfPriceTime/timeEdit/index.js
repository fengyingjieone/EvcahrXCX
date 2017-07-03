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
var timeCode;  

var startTime;
var startSwitch;
var momentSwitch;
var endTime;
var endSwitch;

var newStartTimeH, newStartTimeM;
Page({
  data: {
    Hours: Hours,    
    Minutes: Minutes,
    startHour: 1,//文本显示当前
    startMinute: 2,//文本显示当前
    valueOfStart: [1, 1],//初始位置
  },
  onLoad: function (e) {
    console.log(e);
    timeCode = e.timeCode;
    if (timeCode =="startTime"){
      this.setData({
        titleTxt: "编辑定时开启时间"
      })
    }else{
      this.setData({
        titleTxt: "编辑定时关闭时间"
      })
    }
    defaultDevId = e.defaultDevId;
  },
  onShow:function(){
    this.getHalfpriceTime();//初次进来这个页面，要查询半价电时间
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
  getHalfpriceTime: function () {
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
        console.log(res)
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        if (res.data.Edata[0].code==0){
          startTime = res.data.Edata[0].data.startTime;
          startSwitch = res.data.Edata[0].data.startTimeSwitch;
          momentSwitch = res.data.Edata[0].data.momentSwitch;
          endTime = res.data.Edata[0].data.endTime;
          endSwitch = res.data.Edata[0].data.endTimeSwitch;

          if (timeCode=="startTime"){
            var startTimeArray = (res.data.Edata[0].data.startTime).split(":"); //字符分割 
            newStartTimeH = startTimeArray[0];
            newStartTimeM = startTimeArray[1];
            that.setData({
              valueOfStart: [0, 0, startTimeArray[0], 0, startTimeArray[1], 0, 0]
            })
          } else if (timeCode == "endTime"){
            var startTimeArray = (res.data.Edata[0].data.endTime).split(":"); //字符分割 
            newStartTimeH = startTimeArray[0];
            newStartTimeM = startTimeArray[1];
            that.setData({
              valueOfStart: [0, 0, startTimeArray[0], 0, startTimeArray[1], 0, 0]
            })
          }
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
  },
  cancleBtn:function(){
    wx.navigateBack({
      delta: 1
    })
  },
  saveBtn: function () {
    var that = this;

    if (timeCode == "startTime"){
      var parameter = '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDevId + '","startTime":"' + newStartTimeH + ':' + newStartTimeM+'","startSwitch":"' + startSwitch + '","momentSwitch":"' + momentSwitch + '","endTime":"' + endTime + '","endSwitch":' + endSwitch + '}'
    } else if (timeCode == "endTime"){
      var parameter = '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDevId + '","startTime":"' + startTime + '","startSwitch":"' + startSwitch + '","momentSwitch":"' + momentSwitch + '","endTime":"' + newStartTimeH + ':' + newStartTimeM + '","endSwitch":' + endSwitch + '}'
    }
    console.log(parameter);
    var evheader = app.EvcharHeader(parameter);

    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/usercenter/setTimingTime',
        'evheader': evheader,
        'evdata': parameter
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        console.log("新时间保存结果")
        console.log(res)
        if (res.data.Edata[0].code==0){
          //wx.navigateBack({
            //delta: 1
          //})
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