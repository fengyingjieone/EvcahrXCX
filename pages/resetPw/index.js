//index.js
//获取应用实例
var tel;
var sms;
var newpassword;
var evcharAppkey, openId;
var intSecond;//倒计时任务
var app = getApp();
Page({
  data: {
    leftBtn: "获取验证码",
    btnstatus: false
  },
  loginMobile: function (e) {
    tel = e.detail.value;
    console.log(tel)
  },
  newpassword:function(e){
    newpassword = e.detail.value;
  },
  loginSms: function (e) {
    sms = e.detail.value;
  },
  onLoad: function (options) {
    tel = wx.getStorageSync('tel');
    evcharAppkey = wx.getStorageSync('evcharAppkey');
    openId = wx.getStorageSync('openid');
  },
  onShow: function () {
    tel=null;
    sms=null;
    newpassword=null;
    this.setData({
      defaultTel: tel
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
      console.log('{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","mobile":"' + tel + '","smsVerifyCodeType":2}')
      wx.request({
        url: app.getHostURL()+'/userNameLoginAndRegister.php',//找回密码和注册以及发短信
        method: 'POST',
        data: {
          'evUrl': '/sms/verifycode/fetch',
          'evdata': '{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","mobile":"' + tel + '","smsVerifyCodeType":2}'
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
  loginBySms: function () {
    wx.showToast({
      title: '正在登陆',
      icon: 'loading',
      duration: 10000
    })
    var that = this;
    that.setData({
      inputStatus: false
    })
    wx.request({
      url: app.getHostURL() + '/userNameLoginAndRegister.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/user/smsLogin',
        'evdata': '{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","openId":"' + wx.getStorageSync('openid') + '","code":"' + sms + '","userName":"' + tel + '"}'
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
    console.log('{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","openId":"' + wx.getStorageSync('openid') + '","password":"' + newpassword + '","code":"' + sms + '","userName":"' + tel + '"}')
    console.log(newpassword)
    var patt1 = /[^a-zA-Z0-9]/;//如果出现字母和数字组合外的字符，为true
    if (newpassword == "" || newpassword == undefined) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'loading',
        duration: 1000
      })
      return;
    } else if (patt1.test(newpassword)) {
      wx.showToast({
        title: '密码只能为字母和数字组合',
        icon: 'loading',
        duration: 1000
      })
      return;
    }
    if (sms == "" || sms == undefined) {
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
        'evdata': '{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","openId":"' + wx.getStorageSync('openid') + '","password":"' + newpassword + '","code":"' + sms + '","userName":"' + tel + '"}'
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
            url: '../login/index'
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


