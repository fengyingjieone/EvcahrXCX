//index.js
//获取应用实例
var app = getApp();
var statusValA = 1;//默认是设备全部
var statusValD = 0;//可用为待选项
var devTypeA = 1;
var devTypeB = 1;

var devDistanceA = 0;
var devDistanceB = 0;
var devDistanceC = 0;
var devDistanceD = 1;

var devdistance = "";
Page({
  data: {
    ListCutBgStatusA: statusValA,
    ListCutBgStatusD: statusValD,
    ListCutBgTypeA: devTypeA,
    ListCutBgTypeB: devTypeB,
    ListCutBgDistanceA: devDistanceA,
    ListCutBgDistanceB: devDistanceB,
    ListCutBgDistanceC: devDistanceC,
    ListCutBgDistanceD: devDistanceD,
    StatusImgA: "../images/blue.png",
    StatusImgB: "../images/gray.png"
  },
  onLoad: function (e) {
    var that = this;
    setTimeout(function () {
      that.setData({
        ListCutBgStatusA: statusValA,
        ListCutBgStatusD: statusValD,
        ListCutBgTypeA: devTypeA,
        ListCutBgTypeB: devTypeB,
        ListCutBgDistanceA: devDistanceA,
        ListCutBgDistanceB: devDistanceB,
        ListCutBgDistanceC: devDistanceC,
        ListCutBgDistanceD: devDistanceD
      })
    }, 500)
  },
  onShow: function () {
    console.log(statusValA)
    console.log(statusValD)
    statusValA = wx.getStorageSync('statusValA')
    statusValD = wx.getStorageSync('statusValD')
    devTypeB = wx.getStorageSync('devTypeB')
    devTypeA = wx.getStorageSync('devTypeA')
    if (wx.getStorageSync('statusValA') == 1) {
      this.setData({
        StatusImgA: "../images/blue.png",
        StatusImgB: "../images/gray.png"
      })
    } else {
      this.setData({
        StatusImgA: "../images/gray.png",
        StatusImgB: "../images/blue.png"
      })
    }
    //if(wx.getStorageSync('devTypeA')=1){}
    //ListCutBgTypeA
    console.log("公共 个人")
    console.log(wx.getStorageSync('devTypeA'))

    this.setData({
      ListCutBgStatusA: wx.getStorageSync('statusValA'),
      ListCutBgStatusD: wx.getStorageSync('statusValD'),
      ListCutBgTypeA: wx.getStorageSync('devTypeA'),
      ListCutBgTypeB: wx.getStorageSync('devTypeB'),
      ListCutBgDistanceA: wx.getStorageSync('devDistanceA'),
      ListCutBgDistanceB: wx.getStorageSync('devDistanceB'),
      ListCutBgDistanceC: wx.getStorageSync('devDistanceC'),
      ListCutBgDistanceD: wx.getStorageSync('devDistanceD'),
    })
  },
  devStatrs: function (e) {
    var that = this;
    var Wname = e.currentTarget.id
    if (e.currentTarget.id == "ListCutBgStatusA") {
      statusValA = 1;
      statusValD = 0;
      that.setData({
        StatusImgA: "../images/blue.png",
        StatusImgB: "../images/gray.png"
      })
    } else if (e.currentTarget.id == "ListCutBgStatusD") {
      statusValD = 1;
      statusValA = 0;
      that.setData({
        StatusImgA: "../images/gray.png",
        StatusImgB: "../images/blue.png"
      })
    } else if (e.currentTarget.id == "ListCutBgTypeA") {
      devTypeA == 1 ? devTypeA = 0 : devTypeA = 1; console.log(devTypeA)
    } else if (e.currentTarget.id == "ListCutBgTypeB") {
      devTypeB == 1 ? devTypeB = 0 : devTypeB = 1; console.log(devTypeB)
    } else if (e.currentTarget.id == "ListCutBgDistanceA") {
      devDistanceA == 1 ? devDistanceA = 0 : devDistanceA = 1; console.log(devDistanceA)
      devDistanceB = 0;
      devDistanceC = 0;
      devDistanceD = 0;
      wx.setStorageSync('Mkm', 5);
    } else if (e.currentTarget.id == "ListCutBgDistanceB") {
      devDistanceB == 1 ? devDistanceB = 0 : devDistanceB = 1; console.log(devDistanceB)
      devDistanceA = 0;
      devDistanceC = 0;
      devDistanceD = 0;
      wx.setStorageSync('Mkm', 10);
    } else if (e.currentTarget.id == "ListCutBgDistanceC") {
      devDistanceC == 1 ? devDistanceC = 0 : devDistanceC = 1; console.log(devDistanceC)
      devDistanceA = 0;
      devDistanceB = 0;
      devDistanceD = 0;
      wx.setStorageSync('Mkm', 50);
    } else if (e.currentTarget.id == "ListCutBgDistanceD") {
      devDistanceD == 1 ? devDistanceD = 0 : devDistanceD = 1; console.log(devDistanceD)
      devDistanceA = 0;
      devDistanceB = 0;
      devDistanceC = 0;
      wx.setStorageSync('Mkm', null);
    }
    this.setData({
      ListCutBgStatusA: statusValA,
      ListCutBgStatusD: statusValD,
      ListCutBgTypeA: devTypeA,
      ListCutBgTypeB: devTypeB,
      ListCutBgDistanceA: devDistanceA,
      ListCutBgDistanceB: devDistanceB,
      ListCutBgDistanceC: devDistanceC,
      ListCutBgDistanceD: devDistanceD,
    })
  },
  filterBtn: function () {
    wx.setStorageSync('filter', 1);
    wx.setStorageSync('statusValA', statusValA);
    wx.setStorageSync('statusValD', statusValD);
    wx.setStorageSync('devTypeA', devTypeA);
    wx.setStorageSync('devTypeB', devTypeB);
    wx.setStorageSync('devDistanceA', devDistanceA);
    wx.setStorageSync('devDistanceB', devDistanceB);
    wx.setStorageSync('devDistanceC', devDistanceC);
    wx.setStorageSync('devDistanceD', devDistanceD);
    var devstatus = "";
    var devtype = "";
    var devdistance = "";
    if (statusValA) { devstatus = devstatus + "123456" }
    if (statusValD) { devstatus = devstatus + "3" }
    devstatus = devstatus.split("")
    devstatus = "[" + devstatus.join(",") + "]";
    console.log(devstatus)
    wx.setStorageSync('MstatusList', devstatus);//筛选状态数组 默认全部

    if (devTypeA) { devtype = devtype + "1" }
    if (devTypeB) { devtype = devtype + "2" }
    devtype = devtype.split("")
    devtype = "[" + devtype.join(",") + "]";
    console.log(devtype)
    wx.setStorageSync('MdeviceTypeList', devtype);//筛选公私桩数组  默认全部
    console.log("状态数组")
    console.log(devstatus)
    console.log("设备类型")
    console.log(devtype)
    wx.navigateBack({
      delta: 1
    })

  },
  onShareAppMessage: function () {
    return app.onShareAppMessage();
  },

})


