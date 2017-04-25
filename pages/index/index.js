//index.js
//获取应用实例
var app = getApp();
var MareaCode = null;//区域信息
var MdeviceTypeList = "[1,2]";//筛选公私桩数组  默认全部
var Mkm = null;//筛选距离数组  无意义设定
var Mrecommend = false;//是否推荐  默认不推荐
var Msearch = null;//收索字符  默认没有
var MstatusList = "[1,2,3,4,5,6]";//筛选状态数组 默认全部

var markerId;
//120.207956,30.209658
/**
 * shanghai:31.212592 121.609184
 */
var myLatitude = 30.209658;//我的位置 计算距离用
var myLongitude = 120.207956;//我的位置 计算距离用

wx.setStorageSync('MareaCode', null);//区域信息
wx.setStorageSync('MdeviceTypeList', "[1,2]");//筛选公私桩数组  默认全部
wx.setStorageSync('Mkm', null);//筛选距离数组  无意义设定
wx.setStorageSync('centerLatitude', myLatitude);//自己所在地
wx.setStorageSync('centerLongitude', myLongitude);//自己所在地
wx.setStorageSync('Mrecommend', false);//是否推荐  默认不推荐
wx.setStorageSync('Msearch', null);//收索字符  默认没有
wx.setStorageSync('MstatusList', "[1,2,3,4,5,6]");//筛选状态数组 默认全部

var onLoadOnshowLock;
var markersArrar;//标注数组
var systemInfo = app.getSystemInfoSync();
Page({

  data: {
    searchStr: "",
    filterImg: "../images/filter2.png"
  },
  markertap(e) {
    var that = this;
    console.log("点击了标注" + e.markerId)
    markerId = e.markerId;
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'step-start'
    })
    that.animation = animation;
    animation.height("175rpx").step();
    that.setData({
      animationDataVa: animation.export()
    })

    if (wx.getStorageSync('clickItemLock') == 6)// 执行收索
    {
      var idArray = wx.getStorageSync('markersArrar')
      console.log("点击标注后的数组B")
      console.log(wx.getStorageSync('markersArrar'))
      console.log(idArray[0].markInfo)
      var devInfo = (idArray[0].markInfo).split("||")
      that.setData({
        OneDevName: devInfo[0],
        oneDevDistance: devInfo[1],
        ONeDevCount: devInfo[2],
        OneDevStatus: devInfo[3],
        OneDevId: devInfo[4]
      })
    } else {
      console.log(e)
      console.log(e.markerId)
      var idArray = wx.getStorageSync('markersArrar')
      console.log("点击标注后的数组Bc")
      wx.getStorageSync('clickItemLock')
      console.log(wx.getStorageSync('markersArrar'))

      console.log(idArray.markInfo)

      var devInfo = (idArray[e.markerId].markInfo).split("||")
      console.log(devInfo)
      that.setData({
        OneDevName: devInfo[0],
        oneDevDistance: devInfo[1],
        ONeDevCount: devInfo[2],
        OneDevStatus: devInfo[3],
        OneDevId: devInfo[4]
      })
    }
  },
  onLoad: function (e) {
    console.log("执行一次 or 执行多次")
    wx.setStorageSync('statusValA', 1);//筛选默认值
    wx.setStorageSync('statusValD', 0);//筛选默认值
    wx.setStorageSync('devTypeA', 1);//筛选默认值
    wx.setStorageSync('devTypeB', 1);//筛选默认值
    wx.setStorageSync('clickItemLock', 0);//全局缓存一个桩 选择锁
    onLoadOnshowLock = 1;
    var that = this;
    this.mapCtx = wx.createMapContext('map');
    that.setData({
      controls: [{
        id: 1009,
        iconPath: '../images/MySeat.png',
        position: {
          left: 10,
          top: systemInfo.windowHeight - 100,
          width: 40,
          height: 40
        },
        clickable: true
      }]
    })
    wx.showToast({
      title: "加载中..",
      icon: 'loading',
      duration: 20000
    })
    wx.setStorageSync('searchStr', "");//搜索的字符串 设置为空
    console.log(e.id)
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
    wx.showToast({
      title: '加载中..',
      icon: 'loading',
      duration: 10000
    })
    //获取用户openid 并全局缓存openid  开始
    wx.login({
      success: function (res) {
        if (res.code) {
          wx.request({
            url: 'https://api.weixin.qq.com/sns/jscode2session?appid='+app.getApplet().appId+'&secret='+app.getApplet().secret+'&grant_type=authorization_code&js_code=' + res.code,
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              console.log(res) //获取openid  
              if (res.errMsg == "request:ok") {
                wx.setStorageSync('openid', res.data.openid);//缓存openid
                console.log(" 从缓存中取出来" + wx.getStorageSync('openid'))
                //验证到平台和用户登录  开始
                wx.request({
                  url: app.getHostURL()+'/authAppSecret.php',
                  method: 'POST',
                  header: {
                    'content-type': 'application/json'
                  },
                  success: function (res, ress) {
                    if (res.data.code == 0) {//获取成功  缓存appkey
                      console.log("验证到平台authAppSecret==")
                      console.log(res)
                      wx.setStorageSync('evcharAppkey', res.data.data);//缓存appkey
                      console.log("去登陆");
                      wx.request({
                        url: app.getHostURL()+'/login.php',
                        method: 'POST',
                        data: {
                          'appKey': wx.getStorageSync('evcharAppkey'),
                          'openId': wx.getStorageSync('openid')
                          //'openId':'oUjNms2HzkjxvYOcJSnPTPLMlegQ'
                        },
                        header: {
                          'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        success: function (res) {
                          console.log("登陆结果")
                          console.log(res);
                          var eData = res.data.Edata[0];
                          //登陆失败
                          if (eData.code != 0){
                            console.log("登陆失败，跳转到账号密码登陆,关闭当前页面")
                            wx.redirectTo({
                              url: '/pages/login/index'
                            })
                            return;
                          }
                          wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                          wx.setStorageSync('userID', eData.data.id);//缓存用户id
                          wx.setStorageSync('accessKey', eData.data.accessKey);//缓存accessKey   加密信息用到
                          wx.setStorageSync('accessToken', eData.data.accessToken);//缓存accessToken
                          wx.setStorageSync('userMobile',eData.data.mobile);//缓存用户手机号
                          wx.setStorageSync('userNickName', eData.data.nickName);//缓存用户昵称
                          console.log("昵称")
                          //画出默认地图  开始
                          wx.getLocation({
                            type: 'wgs84',
                            success: function (res) {
                              console.log("定位点2:",res);
                              if(systemInfo.platform != "devtools"){
                                //可以获取到 经度 纬度 速度 精度
                                myLatitude = res.latitude;//我的位置 计算距离用  获取一次，不再变 getAllDevices
                                myLongitude = res.longitude;//我的位置 计算距离用  获取一次，不再变 getAllDevices 
                              }
                              wx.setStorageSync('myLatitude', myLatitude);//缓存我的位置
                              wx.setStorageSync('myLongitude', myLongitude);//缓存我的位置

                              that.setData({
                                Vlatitude: myLatitude,
                                Vlongitude: myLongitude
                              })
                              wx.setStorageSync('centerLatitude', myLatitude);
                              wx.setStorageSync('centerLongitude', myLongitude);
                              that.drawMap();
                            },
                            fail: function (res) {
                              console.log("定位失败2" + new Date().getTime())
                              console.log(res);
                              that.setData({
                                Vlatitude: myLatitude,
                                Vlongitude: myLongitude
                              })
                              that.drawMap()
                            }
                          })
                          //画出默认地图  结束
                        },
                        fail: function (res) {
                          console.log("登录失败")
                        }
                      })
                    } else {//验证到平台失败  弹窗提示                                       
                      wx.showModal({
                        title: '平台验证失败',
                        content: "服务器错误",
                        showCancel: false,
                        success: function (res) {
                          if (res.confirm) {
                            console.log("点击了确定")
                            wx.navigateBack({ delta: 200 })
                          }
                        }
                      })
                    }
                  },
                  fail: function (res) {
                    wx.showModal({
                      title: '平台验证失败',
                      content: res.data.msg,
                      success: function (res) {
                        if (res.confirm) { }//用户点击确认
                      }
                    })
                  }
                })
              }
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
    //获取用户openid 并全局缓存openid  结束
    //验证到惠充电平台，获取并缓存appkeyXXXXXXXXXXXXXXXXXXXXXXXXXXXXxx

  },
  onShow: function () {
    var that = this;
    wx.showToast({
      title: "加载中..",
      icon: 'loading',
      duration: 20000
    })
    console.log("onshow")
    console.log(wx.getStorageSync('searchStr'))
    console.log(wx.getStorageSync('clickItemLock'))
    console.log(wx.getStorageSync('filter'))
    if (wx.getStorageSync('searchStr') != "" && wx.getStorageSync('searchStr') != undefined && wx.getStorageSync('clickItemLock') == 6) {
      console.log("执行收索结果")
      console.log(wx.getStorageSync('markersArrar'))
      that.setData({
        markers: wx.getStorageSync('markersArrar'),//搜索后一个点
        searchStr: wx.getStorageSync('searchStr'),//搜索的字符串
        filterImg: "../images/cancle.png",
        Vlatitude: (wx.getStorageSync('markersArrar'))[0].latitude,
        Vlongitude: (wx.getStorageSync('markersArrar'))[0].longitude
      })
      wx.hideToast();
      //从搜索结果返回的时候  收起动画
      var animation = wx.createAnimation({
        duration: 0,
        timingFunction: 'step-start'
      })

      that.animation = animation;
      animation.height("0rpx").step();
      that.setData({
        animationDataVa: animation.export()
      })
    }
    if (wx.getStorageSync('filter') == 1) {
      console.log(12666)
      console.log("执行筛选结果")//这里要获取地图中心坐标
      that.drawMap();
      wx.setStorageSync('filter', 0);
    }
    var animation = wx.createAnimation({
      duration: 0,
      timingFunction: 'step-start'
    })

    that.animation = animation;
    animation.height("0rpx").step();
    that.setData({
      animationDataVa: animation.export()
    })
    if (wx.getStorageSync('filter') != 1 && wx.getStorageSync('clickItemLock') != 6) {
      console.log("onshow123")
      if (onLoadOnshowLock == 1) {
        console.log("是第一次")
        onLoadOnshowLock = 0
        return;
      } else {
        console.log("第一次")
        that.drawMap()
        onLoadOnshowLock = 0
      }

    }


  },
  drawMap: function () {
    console.log("画地图")

    var that = this;
    var searchCoordinate = that.qqTobd(wx.getStorageSync('centerLatitude'), wx.getStorageSync('centerLongitude'));
    var myLatLng = that.qqTobd(myLatitude, myLongitude);
    console.log(searchCoordinate)
    console.log( '{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","areaCode":' + wx.getStorageSync('MareaCode') + ',"deviceTypeList":' + wx.getStorageSync('MdeviceTypeList') + ',"km":' + wx.getStorageSync('Mkm') + ',"latitude":' + searchCoordinate[1] + ',"longitude":' + searchCoordinate[0] + ',"recommend":' + wx.getStorageSync('Mrecommend') + ',"search":' + wx.getStorageSync('Msearch') + ',"statusList":' + wx.getStorageSync('MstatusList') + ',"myLatitude":"' + myLatLng[1] + '","myLongitude":"' + myLatLng[0] + '"}')
    wx.request({
      url: app.getHostURL()+'/userNameLoginAndRegister.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/device/getAllDevices',
        'evdata': '{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","areaCode":' + wx.getStorageSync('MareaCode') + ',"deviceTypeList":' + wx.getStorageSync('MdeviceTypeList') + ',"km":' + wx.getStorageSync('Mkm') + ',"latitude":' + searchCoordinate[1] + ',"longitude":' + searchCoordinate[0] + ',"recommend":' + wx.getStorageSync('Mrecommend') + ',"search":' + wx.getStorageSync('Msearch') + ',"statusList":' + wx.getStorageSync('MstatusList') + ',"myLatitude":"' + myLatLng[1] + '","myLongitude":"' + myLatLng[0] + '"}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideToast();
        console.log("非加密接口返回的数组")
        console.log(res)
        console.log(res.data.data)
        var reqData = res.data.data;
        console.log(res.data.msg)
        if (res.data.code != 0) {
          wx.request({
            url: app.getHostURL()+'/authAppSecret.php',
            method: 'POST',
            header: {
              'content-type': 'application/json'
            },
            success: function (res, ress) {
              if (res.data.code == 0) {//获取成功  缓存appkey
                console.log("验证到平台authAppSecret==")
                console.log(res)
                wx.setStorageSync('evcharAppkey', res.data.data);//缓存appkey
              }
            },
            fail: function (res) { }
          })
        }
        markersArrar = new Array()
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
          var infoStr = reqData[i].deviceName + "||" + (reqData[i].distance).toFixed(2) + "||" + reqData[i].deviceCount + "||" + reqDevStatus + "||" + reqData[i].id + "||" + reqData[i].address;
          var resCoordinate = that.BdTotencent(Number(reqData[i].longitude), Number(reqData[i].latitude));
          if (reqData[i].deviceStatus == 6) {
            markersArrar[i] = { iconPath: "/pages/images/gray.png", id: i, latitude: resCoordinate[1], longitude: resCoordinate[0], width: 22, height: 28, markInfo: infoStr }
          } else if (reqData[i].deviceStatus == 3) {
            markersArrar[i] = { iconPath: "/pages/images/blue.png", id: i, latitude: resCoordinate[1], longitude: resCoordinate[0], width: 22, height: 28, markInfo: infoStr }
          } else if (reqData[i].deviceStatus == 2 || reqData[i].deviceStatus == 4 || reqData[i].deviceStatus == 5 || reqData[i].deviceStatus == 1) {
            markersArrar[i] = { iconPath: "/pages/images/yello.png", id: i, latitude: resCoordinate[1], longitude: resCoordinate[0], width: 22, height: 28, markInfo: infoStr }
          } else {
            markersArrar[i] = { iconPath: "/pages/images/gray.png", id: i, latitude: resCoordinate[1], longitude: resCoordinate[0], width: 22, height: 28, markInfo: infoStr }
          }
        }
        wx.setStorageSync('markersArrar', markersArrar);//本地缓存一份，用来覆盖收索结果
        console.log(markersArrar[10])
        that.setData({
          markers: markersArrar//在地图上画出
        })
        wx.hideToast();
      },
      fail: function (res) {
        console.log("获取设备信息列表失败");
        wx.hideToast();
      }
    })
  },
  scan: function () {
    var that = this;
    var setIntervalClock;
    var clockCount = 0;
    wx.scanCode({
      success: function (res) {
        console.log(res.result)
        var sn = (res.result).substr((res.result).indexOf("sn=") + 3);
        var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceSn":"' + sn + '","openType":"3"}');
        wx.request({
          url: app.getHostURL()+'/getData.php',//php上固定地址
          method: 'POST',
          data: {
            'evUrl': '/order/makeChargeOrder',
            'evheader': evheader,
            'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceSn":"' + sn + '","openType":"3"}'
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
            wx.showToast({
              title: '正在开启',
              icon: 'loading',
              duration: 20500
            })
            console.log("扫码开启后返回的结果")
            console.log(res)
            if (res.data.Edata[0].code == 0) {
              console.log("开启指令发送成功")
              setIntervalClock = setInterval(function () {
                clockCount++
                var that = this;
                var evheader = app.EvcharHeader('{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","deviceSn":"' + sn + '"}');
                wx.request({
                  url: app.getHostURL()+'/getData.php',//php上固定地址
                  method: 'POST',
                  data: {
                    'evUrl': '/device/checkIsCharging',
                    'evheader': evheader,
                    'evdata': '{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","deviceSn":"' + sn + '"}'
                  },
                  header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                  },
                  success: function (res) {
                    wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                    console.log("检查开启结果")
                    console.log(res)
                    if (res.data.Edata[0].code == 0 && res.data.Edata[0].data) {
                      console.log("开启成功，跳转到充电状态页面")
                      clearInterval(setIntervalClock);
                      wx.switchTab({
                        url: '../isCharging/index'
                      })
                    } else {
                      console.log("开启失败，继续检查" + clockCount);
                      if (clockCount == 4) {
                        clearInterval(setIntervalClock);
                        wx.showToast({
                          title: '设备开启失败，请扫码重试',
                          icon: 'loading',
                          duration: 1500
                        })
                      }
                    }
                  },
                  fail: function (res) {
                    console.log("开启后，设备没有充电")
                    wx.showToast({
                      title: '设备开启失败，请扫码重试',
                      icon: 'loading',
                      duration: 1500
                    })
                    clearInterval(setIntervalClock);
                  }
                })
              }, 2000)
            } else {
              wx.showToast({
                title: res.data.Edata[0].msg,
                icon: 'loading',
                duration: 2000
              })
            }
          },
          fail: function (res) {
            console.log("扫码开启失败")
            wx.showToast({
              title: '设备开启失败，请扫码重试',
              icon: 'loading',
              duration: 1500
            })
            wx.hideToast();
          }
        })
      },
      complete: function () {
        console.log("用户取消了扫码")
        wx.hideToast();
      }
    })
  },
  toSearch: function () {
    wx.navigateTo({
      url: '../search/index'
    })
  },
  toDevInfo: function (e) {

    console.log(e.currentTarget.id)
    wx.navigateTo({
      url: '../devInfo/index?OneDevId=' + e.currentTarget.id
    })
  },
  toFilter: function () {
    console.log("点击了")
    var that = this;
    if (wx.getStorageSync('clickItemLock') == 6)//收索关键词不为空，说明现在是在显示收索的结果
    {
      wx.setStorageSync('clickItemLock', 0);//全局缓存一个桩 选择锁
      var animation = wx.createAnimation({
        duration: 1000,
        timingFunction: 'step-start'
      })
      that.animation = animation;
      animation.height("0rpx").step();
      that.setData({
        animationDataVa: animation.export()
      })
      wx.setStorageSync('searchStr', "");//搜索的字符串 再次设置为空
      this.setData({
        searchStr: wx.getStorageSync('searchStr'),//搜索的字符串
        filterImg: "../images/filter2.png"//图片改为赛选
      })
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          //可以获取到 经度 纬度 速度 精度
          that.setData({
            Vlatitude: res.latitude,
            Vlongitude: res.longitude
          })
        }
      })
      this.drawMap()
    } else if (wx.getStorageSync('clickItemLock') != 6)//收索关键词为空 跳转到筛选
    {
      wx.navigateTo({
        url: '../filter/index'
      })
    }
  },
  handleTap1: function (e) {
    console.log("XXXXXXXXUUUUUUUU")
    var that = this;
    var animation = wx.createAnimation({
      duration: 0,
      timingFunction: 'step-start'
    })
    that.animation = animation;
    animation.height("0rpx").step();
    that.setData({
      animationDataVa: animation.export()
    })
  },
  onShareAppMessage: function () {
    return app.onShareAppMessage();
  },
  BdTotencent: function (bd_lon, bd_lat) {
    var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    var x = bd_lon - 0.0065;
    var y = bd_lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    var gg_lng = z * Math.cos(theta);
    var gg_lat = z * Math.sin(theta);
    return [gg_lng, gg_lat]
  },
  openMap: function () {
    var that = this;
    var idArray = wx.getStorageSync('markersArrar');
    //markerId

    console.log(markerId)
    console.log(idArray)
    if (idArray.length != 1) {
      var devInfo = (idArray[markerId].markInfo).split("||");
      console.log(devInfo)
      wx.openLocation({
        latitude: idArray[markerId].latitude, // 纬度，范围为-90~90，负数表示南纬
        longitude: idArray[markerId].longitude, // 经度，范围为-180~180，负数表示西经
        name: devInfo[0],
        address: devInfo[5],
        scale: 28, // 缩放比例          
      })
    } else {
      console.log("搜索后坐标下标为0")
      var devInfo = (idArray[0].markInfo).split("||");
      console.log(devInfo)
      wx.openLocation({
        latitude: idArray[0].latitude, // 纬度，范围为-90~90，负数表示南纬
        longitude: idArray[0].longitude, // 经度，范围为-180~180，负数表示西经
        name: devInfo[0],
        address: devInfo[5],
        scale: 28, // 缩放比例          
      })
    }

  },
  controltap(e) {
    //定位自己
    console.log("定位自己")
    this.mapCtx.moveToLocation()
  },
  qqTobd: function (lat, lng) {
    var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    var x = parseFloat(lng);
    var y = parseFloat(lat);
    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    lng = z * Math.cos(theta) + 0.0065;
    lat = z * Math.sin(theta) + 0.006;
    return [lng, lat]
  },
})


