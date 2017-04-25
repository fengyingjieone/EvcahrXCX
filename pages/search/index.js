//index.js
//获取应用实例
var app = getApp();
var searchStr;
var searchMark = new Array();
var totalm = 0;
var centerLatitude = wx.getStorageSync('centerLatitude');
var centerLongitude = wx.getStorageSync('centerLongitude');
var myLatitude = wx.getStorageSync('myLatitude');
var myLongitude = wx.getStorageSync('myLongitude');
var evcharAppkey = wx.getStorageSync('evcharAppkey');
var MareaCode = wx.getStorageSync('MareaCode');
var MdeviceTypeList = wx.getStorageSync('MdeviceTypeList');
var Mkm = wx.getStorageSync('Mkm');
var Mrecommend = wx.getStorageSync('Mrecommend');
var MstatusList = wx.getStorageSync('MstatusList');
Page({
  onLoad: function (e) {
    console.log(e)
  },
  onShow: function () {
    wx.setStorageSync('clickItemLock', 0);//全局缓存一个桩 选择锁
  },
  searchBtn: function () {
    wx.showToast({
      title: '查询中',
      icon: 'loading',
      duration: 10500
    })
    wx.setStorageSync('searchStr', searchStr);//全局缓存一个桩的mark信息  数组
    var that = this;
    if (searchStr == undefined) {
      wx.showToast({
        title: '请输入搜索关键字',
        icon: 'loading',
        duration: 1000
      })
      return;
    }
    var searchCoordinate = app.qqTobd(centerLatitude, centerLongitude);
    var myLatLng = app.qqTobd(myLatitude, myLongitude);
    var evdata = '{"appKey":"' + evcharAppkey + '","areaCode":' + MareaCode + ',"deviceTypeList":' + MdeviceTypeList + ',"km":' + Mkm + ',"latitude":"' + searchCoordinate[1] + '","longitude":"' + searchCoordinate[0] + '","recommend":' + Mrecommend + ',"search":"' + searchStr + '","statusList":' + MstatusList + ',"myLatitude":"' + myLatLng[1] + '","myLongitude":"' + myLatLng[0] + '"}';
    var evheader = app.EvcharHeader(evdata);
    console.log("头部信息" + evheader)
    console.log(evdata);

    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/device/getAllDevices',
        'evheader': evheader,
        'evdata': evdata
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        wx.hideToast();
        console.log("搜索结果")
        console.log(res)
        var reqData = res.data.Edata[0].data;
        var resArrar = new Array();
        for (var i = 0; i < reqData.length; i++) {
          var reqDevStatus;
          if (reqData[i].deviceType == 1 && reqData[i].deviceStatus == 3) {
            reqDevStatus = "可用";
          } else if (reqData[i].deviceType == 1 && reqData[i].deviceStatus == 2) {
            reqDevStatus = "被预约";
          } else if (reqData[i].deviceType == 1 && reqData[i].deviceStatus == 4) {
            reqDevStatus = "充电中";
          } else if (reqData[i].deviceType == 1 && reqData[i].deviceStatus == 5) {
            reqDevStatus = "插枪";
          } else if (reqData[i].deviceType == 1 && reqData[i].deviceStatus == 1) {
            reqDevStatus = "不可用";
          } else if (reqData[i].deviceType == 1 && reqData[i].deviceStatus == 6) {
            reqDevStatus = "不在线";
          } else if (reqData[i].deviceType == 2 && reqData[i].deviceStatus == 3) {
            reqDevStatus = "可用";
          } else if (reqData[i].deviceType == 2 && reqData[i].deviceStatus == 5) {
            reqDevStatus = "插枪";
          } else if (reqData[i].deviceType == 2 && reqData[i].deviceStatus == 6) {
            reqDevStatus = "不在线";
          } else if (reqData[i].deviceType == 2 && reqData[i].deviceStatus == 4) {
            reqDevStatus = "充电中";
          } else if (reqData[i].deviceType == 2 && reqData[i].deviceStatus == 1) {
            reqDevStatus = "不可用";
          } else {
            reqDevStatus = "不可用";
          }
          var resCoordinate = app.BdTotencent(Number(reqData[i].longitude), Number(reqData[i].latitude));
          //resArrar数组 用于循环列出收索结果列表
          resArrar[i] = {
            deviceName: reqData[i].deviceName,
            distance: (reqData[i].distance).toFixed(2),
            address: reqData[i].address,
            devstatusTxt: reqDevStatus
          }
          //resArrar数组 用于循环列出收索结果列表

          //searchMark数组  用于点击收索结果列表后画出地图
          var infoStr = reqData[i].deviceName + "||" + (reqData[i].distance).toFixed(2) + "||" + reqData[i].deviceCount + "||" + reqDevStatus + "||" + reqData[i].id;
          searchMark[i] = { iconPath: "/pages/images/gray.png", id: i, latitude: Number(resCoordinate[0]), longitude: Number(resCoordinate[1]), width: 22, height: 28, markInfo: infoStr };
          if (reqData[i].deviceStatus == 6) {
            searchMark[i].iconPath = "/pages/images/gray.png";
          } else if (reqData[i].deviceStatus == 3) {
            searchMark[i].iconPath = "/pages/images/blue.png";
          } else if (reqData[i].deviceStatus == 1 || reqData[i].deviceStatus == 2 || reqData[i].deviceStatus == 4 || reqData[i].deviceStatus == 5) {
            searchMark[i].iconPath = "/pages/images/yello.png";
          } else {
            searchMark[i].iconPath = "/pages/images/gray.png";
          }
          //searchMark数组  用于点击收索结果列表后画出地图
        }
        that.setData({
          listArray: resArrar//收索结果列表
        })
      },
      fail: function (res) {
        console.log("获取钱包信息失败")
        wx.hideToast();
        console.log(res);
      }
    })
  },
  searchInput: function (e) {
    console.log(searchStr)
    searchStr = e.detail.value;
    console.log(e.detail.value)
  },
  clickItem: function (e) {
    console.log(e.currentTarget.id)
    wx.setStorageSync('clickItemLock', 6);//全局缓存一个桩 选择锁
    var searchArray = new Array(searchMark[e.currentTarget.id])
    console.log("clickItem event currentTarget.id:", e.currentTarget.id);
    wx.setStorageSync('markersArrar', searchArray);//全局缓存一个桩的mark信息  数组
    console.log(wx.getStorageSync('searchArray'))
    wx.navigateBack({
      delta: 1
    })
  },
  onShareAppMessage: function () {
    return app.onShareAppMessage();
  },

})


