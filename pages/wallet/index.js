//index.js
//获取应用实例
var app = getApp()
var totalmoney;
var totalBatteryCoin;
Page({
  data: {
    loginMobileVal: '',//注册时的手机号，初始化为空
    loginPWVal: "",
    inputSms: "",
    loginBox: false,//已有账号密码登陆，默认隐藏
  },

  onShow: function () {
    var that = this;
    var nowCapacity;//设备功率 0低功率  1高功率

    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '"}');
    console.log("头部信息" + evheader)

    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/capital/getUserWalletInfo',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '"}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        that.setData({
          batteryCoin: ((res.data.Edata[0].data.batteryCoin) * 0.01).toFixed(2),//电量币
          couponCount: res.data.Edata[0].data.couponCount,//优惠券
          money: ((res.data.Edata[0].data.money) * 0.01).toFixed(2)//余额
        })
        totalmoney = (res.data.Edata[0].data.money * 0.01).toFixed(2);
        totalBatteryCoin = (res.data.Edata[0].data.batteryCoin * 0.01).toFixed(2);
        console.log(res)
      },
      fail: function (res) {
        console.log("获取钱包信息失败")
      }
    })
  },
  toElectriccoin: function () {
    wx.navigateTo({
      url: '../electriccoin/index?totalBatteryCoin=' + totalBatteryCoin
    })
  },
  toCoupon: function () {
    wx.navigateTo({
      url: '../coupon/index'
    })
  },
  toBalance: function () {
    wx.navigateTo({
      url: '../balance/index?totalmoney=' + totalmoney//用户钱
    })
  },
  onShareAppMessage: function () {
    return app.onShareAppMessage();
  },
})


