var app = getApp();
var defaultDevId;
var isEnable;
Page({
  onLoad:function(e){
    console.log(e.defaultDevId);
    defaultDevId = e.defaultDevId;
  },
  onShow:function(){
    //获取当前共享时间
    this.getshareTime();
  },
  toTimeEdit: function () {
    if (isEnable==1)
    {
      wx.navigateTo({
        url: '../setShareTime/timeEdit/index?defaultDevId=' + defaultDevId
      })
    } else if (isEnable == 0){
      wx.showToast({
        title: "开启共享开关后才能编辑时间",
        icon: 'loading',
        duration: 1500,
        mask: true
      })
    }
    
  },
  getshareTime:function(){
    var that=this;
    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDevId + '","type":1}');
    console.log("头部信息" + evheader);
    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/device/queryDeviceTimeConfigs',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDevId + '","type":1}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log("获取半价电结果")
        console.log(res)
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        if (res.data.Edata[0].code == 0) {
          isEnable = res.data.Edata[0].data[0].isEnable;
          that.setData({
            startTime: res.data.Edata[0].data[0].startTime,//开始时间
            endTime: res.data.Edata[0].data[0].endTime,//结束时间
          })
        }else{
          wx.showToast({
            title: res.data.Edata[0].msg,
            icon: 'loading',
            duration: 1500,
            mask: true
          })
        }
        
        console.log((res))
      },
      fail: function (res) {
        console.log("获取钱包信息失败")
      }
    })
  }
})


