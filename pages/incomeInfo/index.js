//index.js
//获取应用实例
var app = getApp();
var stationType;//类型  单桩   组群
var stationId;
Page({
  data: {
    dayMnth: true
  },
  toRechargeCoin: function () {
    wx.navigateTo({
      url: '../rechargeCoin/index'
    })
  },
  onLoad: function (e) {
    var that = this;
    console.log(e)
    stationType = e.stationType;
    stationId = e.stationId;

    if (stationType == 1 || stationType == 2)//1  充电桩   2充电站
    {
      var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + stationId + '","pageNum":1,"pageSize":45}');
      console.log("头部信息" + evheader);
      wx.request({
        url: app.getHostURL() + '/getData.php',//php上固定地址
        method: 'POST',
        data: {
          'evUrl': '/order/vPIcomeByDay',
          'evheader': evheader,
          'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + stationId + '","pageNum":1,"pageSize":45}'
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
          for (var i = 0; i < (res.data.Edata[0].data).length; i++) {
            (res.data.Edata[0].data[i]).totalDegree = (Number((res.data.Edata[0].data[i]).totalDegree) * 0.01).toFixed(2);
          }
          that.setData({
            deviceName: res.data.Edata[0].data[0].deviceName,
            listArray: res.data.Edata[0].data,//明细列表
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
  dayIncome: function () {
    var that = this;
    console.log("日收益")
    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + stationId + '","pageNum":1,"pageSize":45}');
    console.log("头部信息" + evheader);
    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/order/vPIcomeByDay',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + stationId + '","pageNum":1,"pageSize":45}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        for (var i = 0; i < (res.data.Edata[0].data).length; i++) {
          (res.data.Edata[0].data[i]).totalDegree = (Number((res.data.Edata[0].data[i]).totalDegree) * 0.01).toFixed(2);
        }
        that.setData({
          listArray: res.data.Edata[0].data,//明细列表
          dayMnth: true//日月切换
        })
        console.log((res))
      },
      fail: function (res) {
        console.log("获取钱包信息失败")
      }
    })
  },
  monthIncome: function () {
    var that = this;
    console.log("月收益")
    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + stationId + '","pageNum":1,"pageSize":45}');
    console.log("头部信息" + evheader);
    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/order/vPIcomeByMonth',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + stationId + '","pageNum":1,"pageSize":45}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        for (var i = 0; i < (res.data.Edata[0].data).length; i++) {
          (res.data.Edata[0].data[i]).totalDegree = (Number((res.data.Edata[0].data[i]).totalDegree) * 0.01).toFixed(2);
        }
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
})


