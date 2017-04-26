//index.js
//获取应用实例
var userName;
var password;
var evcharAppkey, openId;
var app = getApp();
Page({
  loginMobile: function (e) {
    userName = e.detail.value;
  },
  onLoad: function (options) {
    userName = wx.getStorageSync('userName');
    password = wx.getStorageSync('password');
    evcharAppkey = wx.getStorageSync('evcharAppkey');
    openId = wx.getStorageSync('openid');
    console.log("evcharAppkey:" + evcharAppkey, "openId:" + openId);
  },
  onShow: function () {
    this.setData({
      defaultTel: userName,
      defaultPwd: password
    });
  },
  loginPW: function (e) {
    password = e.detail.value;
  },
  loginWidthUsernameBtn: function () {
    wx.request({
      url: app.getHostURL() + '/userNameLoginAndRegister.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/user/login',
        'evdata': '{"appKey":"' + evcharAppkey + '","openId":"' + openId + '","password":"' + password + '","userName":"' + userName + '"}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        wx.setStorage({
          key: 'userName',
          value: userName
        });
        wx.setStorage({
          key: 'password',
          value: password
        });
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
  },
})


