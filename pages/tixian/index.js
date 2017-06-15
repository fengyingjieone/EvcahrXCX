//index.js
//获取应用实例
var app = getApp();
var bankUsername = "";
var bankId = "";
var bankName = "";
var bankNameInfo = "";//支行信息
var bankMoney = "";
var yue = 0;
Page({
  getUsername: function (e) {
    bankUsername = e.detail.value;
  },
  getBankid: function (e) {
    bankId = e.detail.value;
  },
  getBankname: function (e) {
    bankName = e.detail.value;
  },
  getBankNameInfo:function(e){
    bankNameInfo = e.detail.value;
  },
  getBankmoney: function (e) {
    bankMoney = e.detail.value;
  },
  onLoad: function (e) {
    var that = this;
    that.setData({
      totalmoney: e.total
    })
    yue = e.total;
  },
  onShow: function () {
    bankUsername = "";
    bankId = "";
    bankName = "";
    bankMoney = "";
    bankNameInfo = "";
  },
  tiXian: function () {
    console.log("点击提现按钮");
    console.log("余额=" + yue)
    console.log("提现金额=" + bankMoney)
    if (bankUsername == "") {
      wx.showToast({
        title: '姓名不能为空',
        icon: 'loading',
        duration: 1000
      })

    } else if (bankId == "") {
      wx.showToast({
        title: '银行卡号不能为空',
        icon: 'loading',
        duration: 1000
      })
    } else if (bankName == "") {
      wx.showToast({
        title: '银行名不能为空',
        icon: 'loading',
        duration: 1000
      })
    } else if (bankNameInfo == "") {
      wx.showToast({
        title: '支行信息不能为空',
        icon: 'loading',
        duration: 1000
      })
    } else if (bankMoney == "") {
      wx.showToast({
        title: '提现金额不能为空',
        icon: 'loading',
        duration: 1000
      })
    } else if (Number(bankMoney)  > Number(yue)) {
      console.log(bankMoney)
      console.log(yue)
      wx.showToast({
        title: '余额不足',
        icon: 'loading',
        duration: 1000
      })
    } else if (bankMoney < 50) {
      wx.showToast({
        title: '提现数额必须大于50元',
        icon: 'loading',
        duration: 1000
      })
    } else {
      bankName = bankName + bankNameInfo;
      var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","amount":' + Math.floor(bankMoney * 100) + ',"appId":"1003","bankName":"' + bankName + '","bankNo":"' + bankId + '","realName":"' + bankUsername + '"}');

      console.log('{"accessToken":"' + wx.getStorageSync('accessToken') + '","amount":' + Math.floor(bankMoney * 100) + ',"appId":"1003","bankName":"' + bankName + '","bankNo":"' + bankId + '","realName":"' + bankUsername + '"}')
      wx.request({
        url: app.getHostURL() + '/getData.php',//php上固定地址
        method: 'POST',
        data: {
          'evUrl': '/withdraw/createWithdraw',
          'evheader': evheader,
          'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","amount":' + Math.floor(bankMoney * 100) + ',"appId":"1003","bankName":"' + bankName + '","bankNo":"' + bankId + '","realName":"' + bankUsername + '"}'
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
          console.log("提现返回结果");
          console.log(res)
          if (res.data.Edata[0].code == 0) {
            wx.showModal({
              title: '提示',
              content: "提现成功，将在十个工作日内到账",
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 2
                  })
                }
              }
            })
          }else{
            wx.showToast({
              title: res.data.Edata[0].msg,
              icon: 'loading',
              duration: 1000
            })
          }
        },
        fail: function (res) {
          console.log("获取钱包信息失败")
        }
      })
    }



  },
  onShareAppMessage: function () {
    return app.onShareAppMessage();
  },



})


