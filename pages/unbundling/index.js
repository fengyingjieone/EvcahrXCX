var sms="";
var intSecond;
var nowDeviceId;
var app = getApp();
var devArray = new Array;
Page({
  data: {
    leftBtn: "获取验证码",
    btnstatus: false,
    maskHidden:true
  },
  onShow:function(){
    this.setData({
      defaultSms: sms,
      maskHidden: true
    })
  },
  onLoad: function (e) {
    this.listDevice();
  },
  listDevice: function (e) {
    var that = this;
    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '"}');
    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/device/listDevicesByOwner',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '"}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        console.log("设置返回数据")
        console.log(res.data.Edata[0].data)
        console.log((res))
        devArray = res.data.Edata[0].data;
        that.setData({
          devArray: res.data.Edata[0].data//明细列表
        })
      },
      fail: function (res) {
        console.log("获取钱包信息失败")
      }
    })
  },
  listBtn:function(e){
    console.log(e.currentTarget.id);
    nowDeviceId = e.currentTarget.id
    this.setData({
      defaultSms:"",
      maskHidden:false
    })
  },
  maskBtn: function (e) {
    this.setData({
      maskHidden: true
    })
  },
  getSmsVal: function (e) {
    console.log(e.detail.value);
    sms = e.detail.value;
  },
  getSms: function () {
    var that = this;
    //去获取验证码
    this.setData({
        btnstatus: true
    })
    var timeSecond = 59;
    intSecond = setInterval(function () {
        console.log(timeSecond)
        if (timeSecond > 0) {
          timeSecond--
          that.setData({
            leftBtn: timeSecond
          })
        } else {
          clearInterval(intSecond);
          that.setData({
            btnstatus: false,
            leftBtn: "获取验证码"
          })
        }
      }, 1000)
      console.log("appkey" + wx.getStorageSync('evcharAppkey'));
      console.log("参数");
      console.log('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"'+nowDeviceId+'"}')
      var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"'+nowDeviceId+'"}');
      console.log("头部信息" + evheader)
      wx.request({
        url: app.getHostURL() + '/getData.php',//找回密码和注册以及发短信
        method: 'POST',
        data: {
          'evUrl': '/activation/getRemoveBindInfoValidationCode',
          'evheader': evheader,
          'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"'+nowDeviceId+'"}'
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
          console.log("发送验证码返回结果")
          console.log((res));
          if (res.data.Edata[0].code != 0) {
            //发送不成功
            wx.showToast({
              title: res.data.Edata[0].msg,
              icon: 'loading',
              duration: 1000
            })
            clearInterval(intSecond)
            that.setData({
              btnstatus: false,
              leftBtn: "获取验证码"
            })
          } else {
            //发送成功
            that.setData({
              btnstatus: true
            })
          }
        },
        fail: function (res) {
          console.log("获取钱包信息失败")
        }
      })
  },
  unbundling:function(){
    var that=this;
    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + nowDeviceId+'","validationCode":"' + sms+'"}');
    console.log("头部信息" + evheader)
    wx.request({
      url: app.getHostURL() + '/getData.php',//找回密码和注册以及发短信
      method: 'POST',
      data: {
        'evUrl': '/activation/removeBindInfo',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + nowDeviceId+'","validationCode":"'+sms+'"}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        console.log("解绑返回结果")
        console.log((res));
        if (res.data.Edata[0].code == 0) {
          //解绑成功
          wx.showToast({
            title: "解绑成功",
            icon: 'loading',
            duration: 1000
          })          
          that.listDevice();
          clearInterval(intSecond);
          that.setData({
            btnstatus: false,
            maskHidden: true,
            leftBtn: "获取验证码"
          })

        }else{
            //解绑不成功
            wx.showToast({
              title: res.data.Edata[0].msg,
              icon: 'loading',
              duration: 1000
            })
            that.listDevice();    
            clearInterval(intSecond);  
            that.setData({
              btnstatus: false,
              maskHidden: true,
              leftBtn: "获取验证码"
            })
        }
      },
      fail: function (res) {
        console.log("解绑失败")
        this.listDevice();
        clearInterval(intSecond);
        that.setData({
          leftBtn: "获取验证码",
          btnstatus: false
        })
      }
    })
  }


})


