//index.js
//获取应用实例
var tel;
var newpassword;
var sms;
var evcharAppkey, openId;
var app = getApp();
Page({
  data: {
    leftBtn: "获取验证码",
    btnstatus: false
  },
  loginMobile: function (e) {
    tel = e.detail.value;
  },
  onLoad: function (options) {
    tel = wx.getStorageSync('tel');
    evcharAppkey = wx.getStorageSync('evcharAppkey');
    openId = wx.getStorageSync('openid');
    console.log("evcharAppkey:" + evcharAppkey, "openId:" + openId);
  },
  onShow: function () {
    this.setData({
      defaultTel: tel
    });
  },
  loginPW: function (e) {
    newpassword = e.detail.value;
  },
  getSms: function () {
    var that = this;
    if (tel == '' || tel == undefined) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'loading',
        duration: 1000
      })
    } else if (tel.length != 11) {
      wx.showToast({
        title: '手机号不正确',
        icon: 'loading',
        duration: 1000
      })
    } else {//去获取验证码
      this.setData({
        btnstatus: true
      })

      var timeSecond = 59;
      intSecond = setInterval(function () {
        if (timeSecond > 0) {
          timeSecond--
          that.setData({
            leftBtn: timeSecond
          })
        } else {
          clearInterval(intSecond)
          that.setData({
            btnstatus: false,
            leftBtn: "获取验证码"
          })
        }

      }, 1000)
      console.log('{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","mobile":"' + tel + '","smsVerifyCodeType":3}')
      wx.request({
        url: app.getHostURL() + '/userNameLoginAndRegister.php',//找回密码和注册以及发短信
        method: 'POST',
        data: {
          'evUrl': '/sms/verifycode/fetch',
          'evdata': '{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","mobile":"' + tel + '","smsVerifyCodeType":3}'
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log("发送验证码返回结果")
          console.log(res)
        },
        fail: function (res) {
          console.log("发送验证码失败")
        }
      })
    }
  },
  loginWidthUsernameBtn: function () {
    wx.request({
      url: app.getHostURL() + '/userNameLoginAndRegister.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/user/login',
        'evdata': '{"appKey":"' + evcharAppkey + '","openId":"' + openId + '","password":"' + newpassword + '","userName":"' + tel + '"}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        console.log("登陆结果")
        console.log(res)
        if (res.data.code == 0) {
          //登陆成功后返回主入口重新登陆
          setTimeout(function () {
            wx.switchTab({
              url: '/pages/index/index'
            })
          }, 1000)
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'loading',
            duration: 2000
          })
        }
      },
      fail: function (res) {
        console.log("获取钱包信息失败");
        wx.showToast({
          title: '登陆失败，请重试',
          icon: 'loading',
          duration: 1500
        })
      }
    })
  },
  loginInputErr: function () {
    wx.showToast({
      title: '正在登陆',
      icon: 'loading',
      duration: 10000
    })
    var that = this;
    that.setData({
      inputStatus: false
    })
    setTimeout(function () {
      that.loginWidthUsernameBtn()
    }, 400)
  },
  onShareAppMessage: function () {
    return app.onShareAppMessage();
  }
})


