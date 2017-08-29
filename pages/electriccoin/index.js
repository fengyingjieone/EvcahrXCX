//index.js
//获取应用实例
var app = getApp();
var electriccoinNum=1;
var listArray=new Array;
Page({
  onLoad: function (e) {
    electriccoinNum = 1;
    listArray = new Array
    var that = this;
    that.setData({
      totalBatteryCoin: e.totalBatteryCoin//总金额
    })   
    that.listUserCapitals(electriccoinNum) ;
  },
  onShow:function(){
    electriccoinNum = 1;
    listArray = new Array;
    var res = wx.getSystemInfoSync()
    this.setData({
      scrollHeight: res.windowHeight - res.windowWidth / 750 * 520
    })
  },
  toRechargeCoin: function () {
    wx.navigateTo({
      url: '../rechargeCoin/index'
    })
  },
  onShareAppMessage: function () {
    return app.onShareAppMessage();
  },
  electriccoinlower:function(){
    wx.showToast({
      title: "加载中...",
      icon: 'loading',
      duration: 1500,
      mask: true
    })
    var that=this;
    electriccoinNum = electriccoinNum+1
    that.listUserCapitals(electriccoinNum);
  },
  listUserCapitals: function (electriccoinNum){
    var that=this;
    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","pageSize":25,"pageNum ":' + electriccoinNum+',"capitalTypeSelect":2}');
    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/capital/listUserCapitals',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","pageSize":25,"pageNum ":' + electriccoinNum+',"capitalTypeSelect":2}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        for (var i = 0; i < (res.data.Edata[0].data).length; i++) {
          if ((res.data.Edata[0].data[i]).capitalType > 0) {
            (res.data.Edata[0].data[i]).amount = String((Number((res.data.Edata[0].data[i]).amount) * 0.01).toFixed(2));
          } else {
            (res.data.Edata[0].data[i]).amount = String((Number((res.data.Edata[0].data[i]).amount) * 0.01).toFixed(2));
          }
        }
        listArray = listArray.concat(res.data.Edata[0].data)
        that.setData({
          listArray: res.data.Edata[0].data//明细列表
        })
      },
      fail: function (res) {
        console.log("获取钱包信息失败")
      }
    })
  }
})
