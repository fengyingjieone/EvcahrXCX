//index.js
//获取应用实例
var app = getApp();
var stationType;//类型  单桩   组群
var stationId;
var dayPageNum=1;
var listArray = new Array;
var monthPageNum=1;
var dayMnthState = true;
Page({
  data: {
    dayMnth: true
  },
  toRechargeCoin: function () {
    wx.navigateTo({
      url: '../rechargeCoin/index'
    })
  },
  onShow:function(){
    var that = this;
    listArray = new Array;
    var res = wx.getSystemInfoSync()
    that.setData({
      scrollHeight:res.windowHeight - res.windowWidth / 750 * 230
    })
  },
  onLoad: function (e) {
    var that = this;
    listArray = new Array;
    console.log(e)
    stationType = e.stationType;
    stationId = e.stationId;
    if (stationType == 1 || stationType == 2)//1  充电桩   2充电站
    {
      var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + stationId + '","pageNum":1,"pageSize":25}');
      wx.request({
        url: app.getHostURL() + '/getData.php',//php上固定地址
        method: 'POST',
        data: {
          'evUrl': '/order/vPIcomeByDay',
          'evheader': evheader,
          'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + stationId + '","pageNum":1,"pageSize":25}'
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
          for (var i = 0; i < (res.data.Edata[0].data).length; i++) {
            (res.data.Edata[0].data[i]).amount = (Number((res.data.Edata[0].data[i]).amount) * 0.01).toFixed(2);
          }
          that.setData({
            deviceName: res.data.Edata[0].data[0].deviceName,
            listArray: res.data.Edata[0].data,//明细列表
            //listArray: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,2,9],//明细列表
            dayMnth: true//日月切换
          })
          console.log((res))
        },
        fail: function (res) {
          console.log("获取钱包信息失败")
        }
      })
    }
  },
  dayIncome: function (dayPageNum) {
    console.log(dayPageNum);
    dayPageNum=1;
    dayMnthState=true;
    var that = this;
    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + stationId + '","pageNum":' + dayPageNum+',"pageSize":25}');
     wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/order/vPIcomeByDay',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + stationId + '","pageNum":' + dayPageNum+',"pageSize":25}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        for (var i = 0; i < (res.data.Edata[0].data).length; i++) {
          (res.data.Edata[0].data[i]).amount = (Number((res.data.Edata[0].data[i]).amount) * 0.01).toFixed(2);
        }
        listArray = listArray.concat(res.data.Edata[0].data)
        that.setData({
          listArray: listArray,//明细列表
          dayMnth: true//日月切换
        })
      },
      fail: function (res) {
        console.log("获取钱包信息失败")
      }
    })
  },
  monthIncome: function (dayPageNum) {
    dayMnthState=false;
    dayPageNum=1;
    var that = this;
    console.log("月收益")
    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + stationId + '","pageNum":' + dayPageNum+',"pageSize":25}');
    console.log("头部信息" + evheader);
    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/order/vPIcomeByMonth',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + stationId + '","pageNum":' + dayPageNum+',"pageSize":25}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        for (var i = 0; i < (res.data.Edata[0].data).length; i++) {
          (res.data.Edata[0].data[i]).amount = (Number((res.data.Edata[0].data[i]).amount) * 0.01).toFixed(2);
        }
        listArray = listArray.concat(res.data.Edata[0].data)
        that.setData({
          listArray: res.data.Edata[0].data,//明细列表
          dayMnth: false//日月切换
        })
        console.log((res))
      },
      fail: function (res) {
        console.log("获取钱包信息失败")
      }
    })
  },
  onShareAppMessage: function () {
    return app.onShareAppMessage();
  },
  daylower:function(){
    wx.showToast({
      title: "加载中...",
      icon: 'loading',
      duration: 1500,
      mask: true
    })
    var that=this;
    dayPageNum = dayPageNum+1
    if (dayMnthState==true){
      that.dayIncome(dayPageNum);
    } else if (dayMnthState==false){
      that.monthIncome(dayPageNum)
    }
    
  }
})


