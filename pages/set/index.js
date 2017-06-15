//index.js
//获取应用实例
var defaultDevId;
var app = getApp()
var devArray = new Array;
var devArrayAll;
Page({
  data: {
    deviceCount: false,//设 默认只有一个设备
    owner:false,
    array: ['美国', '中国', '巴西', '日本'],    
    date: '2016-09-01',
    time: '12:01'
  },
  onLoad: function (e) {
    devArray = new Array();
    var that = this;
    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '"}');
    console.log("头部信息" + evheader)

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
        if(res.data.Edata[0].data==null){
          that.setData({
            array: devArray,
            devName: '',
            deviceCount: false//没有桩，不显示切换充电桩
          })
          return;
        }else
        {
          that.setData({
            owner: true//是桩主
          })
        }
        if (res.data.Edata[0].data.length > 1) {
          console.log("这位大人有" + res.data.Edata[0].data.length + "个桩");
          var defaultDevName;
          devArrayAll = res.data.Edata[0].data;
          for (var i = 0; i < res.data.Edata[0].data.length; i++) {
            console.log(i)
            if (res.data.Edata[0].data[i].defaultFlag) {
              defaultDevName = res.data.Edata[0].data[i].deviceName;
              defaultDevId = res.data.Edata[0].data[i].id;
            }
            devArray[i] = res.data.Edata[0].data[i].deviceName;
          }
          console.log("要推送到前台的数据");
          console.log(devArray)
          that.setData({
            array: devArray,
            devName: defaultDevName,
            deviceCount: true//设 默认只有一个设备
          })
        } else if (res.data.Edata[0].data.length == 1) {
          //有一个桩
          var defaultDevName;
          defaultDevName = res.data.Edata[0].data[0].deviceName;
          defaultDevId = res.data.Edata[0].data[0].id;
          devArray[0] = res.data.Edata[0].data[0].deviceName;
          that.setData({
            array: devArray,
            devName: defaultDevName,
            deviceCount: false//设 默认只有一个设备  不应该显示切换充电桩栏
          })
        } 

      },
      fail: function (res) {
        console.log("获取钱包信息失败")
      }
    })
  },
  onShow: function (e) {
    devArray = new Array();
    var that = this;
    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '"}');
    console.log("头部信息" + evheader)

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
        if (res.data.Edata[0].data == null) {
          that.setData({
            array: devArray,
            devName: '',
            deviceCount: false//设 默认只有一个设备
          })
          return;
        } else {
          that.setData({
            owner: true//是桩主
          })
        }
        if (res.data.Edata[0].data.length > 1) {
          console.log("这位大人有" + res.data.Edata[0].data.length + "个桩");
          var defaultDevName;
          devArrayAll = res.data.Edata[0].data;
          for (var i = 0; i < res.data.Edata[0].data.length; i++) {
            console.log(i)
            if (res.data.Edata[0].data[i].defaultFlag) {
              defaultDevName = res.data.Edata[0].data[i].deviceName;
              defaultDevId = res.data.Edata[0].data[i].id;
            }
            devArray[i] = res.data.Edata[0].data[i].deviceName;
          }
          console.log("要推送到前台的数据");
          console.log(devArray)
          console.log(defaultDevName)
          that.setData({
            array: devArray,
            devName: defaultDevName,
            deviceCount: true//设 默认只有一个设备
          })
        } else if (res.data.Edata[0].data.length == 1){
          //有一个桩
          var defaultDevName;
          defaultDevName = res.data.Edata[0].data[0].deviceName;
          defaultDevId = res.data.Edata[0].data[0].id;
          devArray[0] = res.data.Edata[0].data[0].deviceName;
          that.setData({
            array: devArray,
            devName: defaultDevName,
            deviceCount: false//设 默认只有一个设备  不应该显示切换充电桩栏
          })
        }

      },
      fail: function (res) {
        console.log("获取钱包信息失败")
      }
    })
  },
  bindPickerChange: function (e) {
    wx.showToast({
      title: '正在设置',
      icon: 'loading',
      duration: 10000
    })
    var that = this;
    console.log('picker发送选择改变，携带值为', e.detail.value)
    console.log(devArray[e.detail.value])
    console.log(devArrayAll[e.detail.value].deviceName)
    that.setData({
      devName: devArrayAll[e.detail.value].deviceName
    })

    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + devArrayAll[e.detail.value].id + '"}');
    console.log("头部信息" + evheader)

    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/device/setDefaultDevice',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + devArrayAll[e.detail.value].id + '"}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        console.log("设置默认桩")
        console.log((res))
        if (res.data.Edata[0].code == 0) {
          wx.showToast({
            title: '设置成功',
            icon: 'loading',
            duration: 1000
          })
        } else {
          wx.showToast({
            title: '设置失败',
            icon: 'loading',
            duration: 1000
          })
        }

      },
      fail: function (res) {
        console.log("获取钱包信息失败");
        wx.showToast({
          title: '设置失败',
          icon: 'loading',
          duration: 1000
        })
      }
    })
  },
  toAboutUs: function () {
    wx.navigateTo({
      url: '../aboutUs/index'
    })
  },
  onShareAppMessage: function () {
    return app.onShareAppMessage();
  },
  dophone: function () {
    wx.showModal({
      title: '提示',
      content: "确认拨打电话：4007569360吗?",
      confirmText: "拨打",
      success: function (res) {
        if (res.confirm) {
          console.log("点击了确定")
          wx.makePhoneCall({
            phoneNumber: '4007569360' //仅为示例，并非真实的电话号码
          })
        }
      }
    })

  },
  toMessageSet: function () {
    wx.navigateTo({
      url: '../messageSet/index'
    })
  },
  logout:function(){
    wx.showModal({
      title: '提示',
      content: "退出当前账号",
      confirmText: "确定",
      cancelText:"取消",
      success: function (res) {
        if (res.confirm) {
          var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '"}');
          wx.request({
            url: app.getHostURL() + '/getData.php',//php上固定地址
            method: 'POST',
            data: {
              'evUrl': '/user/logout',
              'evheader': evheader,
              'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '"}'
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {        
              console.log("退出结果")      
              console.log(res)              
              if(res.data.Edata[0].code==0){
                wx.setStorageSync('logout', 1);//区域信息
                wx.setStorageSync('tel_index', '');//退出后清空缓存
                wx.setStorageSync('sms_index', '');//退出后清空缓存
                wx.setStorageSync('userName_second', '');//退出后清空缓存
                wx.setStorageSync('password_second', '');//退出后清空缓存
                wx.setStorageSync('tel_third', '');//退出后清空缓存
                wx.setStorageSync('newpassword_third', '');//退出后清空缓存
                wx.setStorageSync('sms_third', '');//退出后清空缓存
                wx.switchTab({
                  url: '../index/index'
                })                
              }else{
                wx.showToast({
                  title: '退出失败',
                  icon: 'loading',
                  duration: 1000
                })
              }                
            },
            fail: function (res) {
              console.log("获取钱包信息失败");
              wx.showToast({
                title: '退出失败',
                icon: 'loading',
                duration: 1000
              })
            }
          })
        }
      }
    })
  },
  toActivated:function (){
    wx.navigateTo({
      url: '../activated/index'
    })
  },toUnbundling:function(){
    console.log(123456789);
    wx.navigateTo({
      url: '../unbundling/index'
    })
  },
  toSetShareTime: function () {
    wx.navigateTo({
      url: '../setShareTime/index?defaultDevId=' + defaultDevId
    })
  }
})


