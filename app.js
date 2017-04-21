App({
  //onLaunch当小程序初始化完，只触发一次
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  getHost:function(){
    return "wxtt.evchar.cn";
  },
  getHostURL:function(){
    return "https://wxtt.evchar.cn";
  },
  getApplet:function(){
    return {
      "appId":"wxef386a7c990c62ae",
      "secret":"ed3a1428062d95163e7680a97cfe7a99"
    }
  },
  getSystemInfoSync:function(){
    return wx.getSystemInfoSync();
  },
  globalData: {
    userInfo: null
  },
  loginEvchar: function () {
    console.log("验证到平台开始")
    wx.request({
      //url: app.getHostURL()+'/toEvchar.php?route=authAppSecret',
      url: this.getHostURL()+'/authAppSecret.php',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res, ress) {
        console.log(res)
        console.log("11=" + JSON.stringify(res))
        console.log("22=" + JSON.stringify(ress))
        console.log("code" + res.data.code)
        if (res.data.code == 0) {//获取成功  缓存appkey
          wx.setStorageSync('evcharAppkey', res.data.data);//缓存appkey
          console.log("appkey" + wx.getStorageSync('evcharAppkey'))
        } else {//验证到平台失败  弹窗提示
          console.log("code" + 66699)
          if (res.data.code != undefined) {
            wx.showModal({
              title: '平台验证失败',
              content: res.data.msg,
              success: function (res) {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 200
                  })
                  //console.log('用户点击确定')
                }
              }
            })
          } else {
            wx.showModal({
              title: '平台验证失败',
              content: "服务器错误",
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 200
                  })
                  //console.log('用户点击确定')
                }
              }
            })
          }

        }
      },
      fail: function (res) {
        wx.showModal({
          title: '平台验证失败',
          content: res.data.msg,
          success: function (res) {
            if (res.confirm) {
              //console.log('用户点击确定')
            }
          }
        })
        console.log(res.data) //获取openid          
      }
    })
    console.log("验证到平台结束")
  },
  EvcharHeader: function (evdata) {
    //console.log(">>>>>>>>>>>>>>>>>>> "+evdata)
    var toData = JSON.parse(evdata);	//字符串转json
    var keys = [];
    for (var k in toData) {
      if (toData.hasOwnProperty(k)) {
        keys.push(k);
      }
    }
    keys.sort();
    //console.log("key排序后: "+keys)
    var jsonValueArray = [];
    for (var i = 0; i < keys.length; i++) {
      jsonValueArray.push('' + toData[keys[i]]);
    }
    var jsonValueString = jsonValueArray.join('');

    //console.log("val排序后:"+jsonValueString);
    //console.log("取出来的时间戳"+wx.getStorageSync('timestamp'))
    //console.log("accessKey="+wx.getStorageSync('accessKey'))
    var globalStr = jsonValueString + wx.getStorageSync('timestamp') + wx.getStorageSync('accessKey');
    var globalStrdd = jsonValueString + "||" + wx.getStorageSync('timestamp') + "||" + wx.getStorageSync('accessKey');
    //console.log("拼接后字符串"+globalStrdd)
    var md5Obj = require('pages/images/md55.js');
    var md5 = md5Obj.hexMD5(globalStr);
    md5 = md5.toUpperCase();
    //console.log("加密后的字符串： "+md5);
    var returnheader = '{sign:"' + md5 + '",timestamp:"' + wx.getStorageSync('timestamp') + '"}'
    //console.log("header头部+"+returnheader)
    return returnheader;
  },
  clocktime: function (timA, tim) {
    console.log("传过来的时间戳=" + timA)
    console.log("传过来的订单时间=" + tim)
    var times = timA * 0.001 - tim * 0.001;//timA header里面的服务器时间戳  tim 订单开始时间  
    var days = Math.floor(times / 86400);
    var hourtime = times - days * 86400;
    var hours = Math.floor(hourtime / 3600);
    var mintime = hourtime - hours * 3600;
    var minutes = Math.floor(mintime / 60);
    var second = Math.floor(mintime - minutes * 60);
    if (times <= 0) {
      return "00:00:00";
    } else {
      if (days <= 0) {
        if (hours < 10) {
          hours = "0" + hours
        }
      } else if (days > 0 && days < 10) {
        hours = days * 24 + hours
      }
      if (minutes < 10) { minutes = "0" + minutes }
      if (second < 10) { second = "0" + second }
      console.log("充电时间=" + hours + ":" + minutes + ":" + second)
      if (tim == null) {
        return "00:00:00";
      }
      return hours + ":" + minutes + ":" + second;
    }
  },
  clocktimeB: function (timA, tim) {
    var times = 3600 - timA * 0.001 + tim * 0.001;//timA header里面的服务器时间戳  tim 订单创建时间  距离超时还有多少秒
    var days = Math.floor(times / 86400);
    var hourtime = times - days * 86400;
    var hours = Math.floor(hourtime / 3600);
    var mintime = hourtime - hours * 3600;
    var minutes = Math.floor(mintime / 60);
    var second = Math.floor(mintime - minutes * 60);
    if (times <= 0) {
      return "预约超时";
    } else {
      //return days+"天"+hours+"小时"+minutes+"分"+second+"秒";
      var circleCut = parseInt(minutes / 5)
      //console.log(circleCut)		
      if (hours < 10) { hours = "0" + hours }
      if (minutes < 10) { minutes = "0" + minutes }
      if (second < 10) { second = "0" + second }
      console.log("倒计时=" + hours + ":" + minutes + ":" + second)
      return hours + ":" + minutes + ":" + second;
    }
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
  BdTotencent: function (bd_lon, bd_lat) {
    var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    var x = bd_lon - 0.0065;
    var y = bd_lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    var gg_lng = z * Math.cos(theta);
    var gg_lat = z * Math.sin(theta);
    return [gg_lat, gg_lng]
  }
})