var app = getApp();
Page({
    onShareAppMessage: function () {
        return app.onShareAppMessage();
    },
    scanSn: function () {
      var that=this;
      wx.scanCode({
        success: function (res) {
          console.log(res.result)
          that.nextStep(res.result)    
        }
      })
    },
    nextStep: function (devicesn) {
      var that = this;
      wx.showToast({
        title: '',
        icon: 'loading',
        duration: 15000
      })
      console.log('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceSn":"' + devicesn + '"}')
      var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceSn":"' + devicesn + '"}');
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
          wx.hideToast();
          wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间        
          if (res.data.Edata[0].code == 0 && res.data.Edata[0].data.available) {
            wx.setStorageSync('activatedSN', devicesn);
            wx.navigateTo({
              url: 'perfectedData/index'
            })            
          } if (res.data.Edata[0].code == 0 && !res.data.Edata[0].data.available) {
            wx.showToast({
              title: "SN错误",
              icon: 'loading',
              duration: 1500
            })
            return;
          }else{
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
    toCheckDeviceSn:function()
    {
      wx.navigateTo({
        url: 'checkDeviceSn/index'
      })
    }
})


