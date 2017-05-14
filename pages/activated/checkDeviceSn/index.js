var devicesn;
var app = getApp();
Page({
    onShareAppMessage: function () {
        return app.onShareAppMessage();
    },
    onShow:function(){
      //devicesn="";
    },
    inputSN:function (e){
        devicesn = e.detail.value;
        console.log(devicesn)
    },
    nextStep:function(){
      var that = this;
      wx.showToast({
        title: "",
        icon: 'loading',
        duration: 15000
      })
      console.log('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceSn":"' + devicesn + '"}')
      var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceSn":"' +devicesn+'"}');
      wx.request({
        url: app.getHostURL() + '/getData.php',//php上固定地址
        method: 'POST',
        data: {
          'evUrl': '/activation/validationSn',
          'evheader': evheader,
          'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceSn":"' + devicesn + '"}'
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          //wx.hideToast();activatedSN available
          wx.hideToast();
          wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间        
          console.log(res)
          wx.setStorageSync('activatedSN', devicesn);
          if (res.data.Edata[0].code == 0 && res.data.Edata[0].data.available) {
            console.log("验证sn成功")
            wx.navigateTo({
              url: '../perfectedData/index'
            })  
          } else {
            wx.showToast({
              title: res.data.Edata[0].msg,
              icon: 'loading',
              duration: 1500
            })
            return;
          }
        },
        fail: function (res) {
          wx.hideToast();
          console.log("获取钱包信息失败")
        }
      })//查看当前开关状态
    },
    scanSn: function () {
      wx.scanCode({
        success: function (res) {
          console.log(res.result)
          wx.setStorageSync('activatedSN', res.result);//缓存时间戳
          wx.navigateTo({
            url: '../wallet/index'
          })
          //var sn = (res.result).substr((res.result).indexOf("sn=") + 3);
          
        }
      })
    },
})


