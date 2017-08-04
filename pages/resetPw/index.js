//index.js
//获取应用实例
var tel_third;
var sms_third;
var newpassword_third;
var evcharAppkey, openId;
var intSecond;//倒计时任务
var app = getApp();
Page({
  data: {
    leftBtn: "获取验证码",
    btnstatus: false
  },
  loginMobile: function (e) {
    tel_third = e.detail.value;
    wx.setStorageSync('tel_third', tel_third);
  },
  newpassword:function(e){
    newpassword_third = e.detail.value;
    wx.setStorageSync('newpassword_third', newpassword_third);
  },
  loginSms: function (e) {
    sms_third = e.detail.value;
    wx.setStorageSync('sms_third', sms_third);
  },
  onLoad: function (options) {
    tel_third = wx.getStorageSync('tel_third');
    evcharAppkey = wx.getStorageSync('evcharAppkey');
    openId = wx.getStorageSync('openid');
  },
  onShow: function () {
    this.setData({
      tel_third: wx.getStorageSync('tel_third'),
      sms_third: wx.getStorageSync('sms_third'),
      newpassword_third: wx.getStorageSync('newpassword_third')
    });
  },
  findPasswordPage: function () {
    wx.navigateTo({
      url: '../findpw/index'
    })
  },
  register: function () {
    wx.navigateTo({
      url: '../register/index'
    })
  },
  getSms: function () {
    var that = this;
    if (tel_third == '' || tel_third == undefined) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'loading',
        duration: 1000
      })
    } else if (tel_third.length != 11) {
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
      console.log('{"eappKey":"' + wx.getStorageSync('evcharAppkey') + '","mobile":"' + tel_third + '","smsVerifyCodeType":2}')
      wx.request({
        url: app.getHostURL()+'/userNameLoginAndRegister.php',//找回密码和注册以及发短信
        method: 'POST',
        data: {
          'evUrl': '/sms/verifycode/fetch',
          'evdata': '{"eappKey":"' + wx.getStorageSync('evcharAppkey') + '","mobile":"' + tel_third + '","smsVerifyCodeType":2}'
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
  onShareAppMessage: function () {
    return app.onShareAppMessage();
  },
  toLoginByPw:function(){
    wx.navigateTo({
      url: '../loginByPw/index'
    })
  },
  toResetPw:function(){
    wx.navigateTo({
      url: '../resetPw/index'
    })
  },
  findPW: function () {
    console.log('{"eappKey":"' + wx.getStorageSync('evcharAppkey') + '","openId":"' + wx.getStorageSync('openid') + '","password":"' + newpassword_third + '","code":"' + sms_third + '","userName":"' + tel_third + '"}')
    var patt1 = /[^a-zA-Z0-9]/;//如果出现字母和数字组合外的字符，为true
    if (newpassword_third == "" || newpassword_third == undefined) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'loading',
        duration: 1000
      })
      return;
    } else if (patt1.test(newpassword_third)) {
      wx.showToast({
        title: '密码只能为字母和数字组合',
        icon: 'loading',
        duration: 1000
      })
      return;
    }
    if (sms_third == "" || sms_third == undefined) {
      wx.showToast({
        title: '验证码不能为空',
        icon: 'loading',
        duration: 1000
      })
      return;
    }
    wx.request({
      url: app.getHostURL() + '/userNameLoginAndRegister.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/user/resetUserPassword',
        'evdata': '{"eappKey":"' + wx.getStorageSync('evcharAppkey') + '","openId":"' + wx.getStorageSync('openid') + '","password":"' + newpassword_third + '","code":"' + sms_third + '","userName":"' + tel_third + '"}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log((res))
        console.log((res.data.code))
        //找回成功后登陆成功后返回主入口重新登陆
        if (res.data.code != 0) {
          wx.showToast({
            title: res.data.msg,
            icon: 'loading',
            duration: 1000
          })
        }
        //找回成功后登陆成功后返回主入口重新登陆
        if (res.data.code == 0) {
          wx.showToast({
            title: "重置成功" + res.data.msg,
            icon: 'loading',
            duration: 1000
          })
          clearInterval(intSecond)
          console.log("开始跳转")
          wx.redirectTo({
            url: '../loginByPw/index'
          })
          console.log("结束跳转")
        }
      },
      fail: function (res) {
        console.log("获取钱包信息失败");
        wx.showToast({
          title: '重置失败，请重试',
          icon: 'loading',
          duration: 1500
        })
      }
    })
  }
})


