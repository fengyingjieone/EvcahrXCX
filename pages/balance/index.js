//index.js
//获取应用实例
var app = getApp();
var totalm = 0;
var pageNum=1;
var listArray=new Array;
Page({
  data: {
    loginMobileVal: '',//注册时的手机号，初始化为空
    loginPWVal: "",
    inputSms: "",
    loginBox: false,//已有账号密码登陆，默认隐藏
  },
  onLoad: function (e) {
    pageNum = 1;
    listArray = new Array;
    totalm = e.totalmoney;
    var that = this;
    that.setData({
      totalmoney: e.totalmoney//总金额
    })
  },
  onShow: function () {
    pageNum = 1;
    listArray = new Array;
    var that = this;
    var res = wx.getSystemInfoSync()
    that.setData({
      scrollHeight: res.windowHeight - res.windowWidth / 750 * 520
    })
    that.listUserCapitals(pageNum)
  },
  toTixian: function () {
    var Evtoday = new Date()
    console.log("获取日期")
    console.log(Evtoday.getDate())
    if (Evtoday.getDate() == 1 || Evtoday.getDate() == 15) {
      wx.navigateTo({
        url: '../tixian/index?total=' + totalm
      })
    } else {
      wx.showModal({
        title: '提示',
        content: "每月1号15号可以提现",
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            //console.log('用户点击确定')
          }
        }
      })
    }
  },
  tochongzhi: function () {
    wx.navigateTo({
      url: '../chongzhi/index?total=' + totalm
    })
  },
  onShareAppMessage: function () {
    return app.onShareAppMessage();
  },
  listUserCapitals: function (pageNum){
    var that=this;
    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","pageSize":25,"pageNum":' + pageNum+',"capitalTypeSelect":1}');
    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/capital/listUserCapitals',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","pageSize":25,"pageNum":' + pageNum+',"capitalTypeSelect":1}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        console.log("现金消费明细")
        console.log(res)
        for (var i = 0; i < (res.data.Edata[0].data).length; i++) {
          (res.data.Edata[0].data[i]).amount = (Number((res.data.Edata[0].data[i]).amount) * 0.01).toFixed(2);
        }
        listArray = listArray.concat(res.data.Edata[0].data)
        that.setData({
          listArray: listArray//明细列表
        })
      },
      fail: function (res) {
        console.log("获取钱包信息失败")
      }
    })
  },
  blancelower:function(){
    wx.showToast({
      title: "加载中...",
      icon: 'loading',
      duration: 1500,
      mask: true
    })
    pageNum = pageNum+1;
    console.log(pageNum)
    this.listUserCapitals(pageNum)
  }
})


