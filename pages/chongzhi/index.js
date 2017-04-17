//index.js
//获取应用实例
var app = getApp()
Page({
  moneyA:function(e)//50元
  {
      var evheader=app.EvcharHeader('{"money":5000,"type":3,"bizType":1,"accessToken":"'+wx.getStorageSync('accessToken')+'"}');
      wx.request({
          url: 'https://wx.chongdian.club/getData.php',//php上固定地址
          method:'POST',
          data: {
            'evUrl':'/order/weixin/makeRechargeOrder',
            'evheader':evheader,
            'evdata':'{"money":5000,"type":3,"bizType":1,"accessToken":"'+wx.getStorageSync('accessToken')+'"}'
          },  
          header: { 
            'Content-Type': 'application/x-www-form-urlencoded'
          },  
          success: function(res) {
            wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
            console.log("充值返回结果");
            console.log(res);
            wx.requestPayment({
              'timeStamp': res.data.Edata[0].data.timeStamp,
              'nonceStr': res.data.Edata[0].data.nonceStr,
              'package': res.data.Edata[0].data.package,
              'signType': 'MD5',
              'paySign': res.data.Edata[0].data.paySign,
              'success':function(res){
                wx.switchTab({
                                  url: '../usercenter/index'
                                }) 
              },
              'fail':function(res){
                wx.showModal({
                          title: '提示',
                          content: "充值失败",
                          showCancel:false,
                          success: function(res) {
                            if (res.confirm) {
                                wx.switchTab({
                                  url: '../usercenter/index'
                                })
                            }
                          }
                }) 
                console.log(res)
              }
            })
          },
          fail: function(res) {  
            console.log("获取钱包信息失败")        
          }
      }) 
  },
  moneyB:function(e)//100元
  {
      var evheader=app.EvcharHeader('{"money":10000,"type":3,"bizType":1,"accessToken":"'+wx.getStorageSync('accessToken')+'"}');
      wx.request({
          url: 'https://wx.chongdian.club/getData.php',//php上固定地址
          method:'POST',
          data: {
            'evUrl':'/order/weixin/makeRechargeOrder',
            'evheader':evheader,
            'evdata':'{"money":10000,"type":3,"bizType":1,"accessToken":"'+wx.getStorageSync('accessToken')+'"}'
          },  
          header: { 
            'Content-Type': 'application/x-www-form-urlencoded'
          },  
          success: function(res) {
            wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
            console.log("充值返回结果");
            console.log(res);
            wx.requestPayment({
              'timeStamp': res.data.Edata[0].data.timeStamp,
              'nonceStr': res.data.Edata[0].data.nonceStr,
              'package': res.data.Edata[0].data.package,
              'signType': 'MD5',
              'paySign': res.data.Edata[0].data.paySign,
              'success':function(res){
                wx.switchTab({
                                  url: '../usercenter/index'
                                })
              },
              'fail':function(res){
                wx.showModal({
                          title: '提示',
                          content: "充值失败",
                          showCancel:false,
                          success: function(res) {
                            if (res.confirm) {
                                console.log("充值1分钱")
                                wx.switchTab({
                                  url: '../usercenter/index'
                                })
                            }
                          }
                }) 
                console.log(res)
              }
            })
          },
          fail: function(res) {  
            console.log("获取钱包信息失败")        
          }
      }) 
  },
  moneyC:function(e)//200元
  {
      var evheader=app.EvcharHeader('{"money":20000,"type":3,"bizType":1,"accessToken":"'+wx.getStorageSync('accessToken')+'"}');
      wx.request({
          url: 'https://wx.chongdian.club/getData.php',//php上固定地址
          method:'POST',
          data: {
            'evUrl':'/order/weixin/makeRechargeOrder',
            'evheader':evheader,
            'evdata':'{"money":20000,"type":3,"bizType":1,"accessToken":"'+wx.getStorageSync('accessToken')+'"}'
          },  
          header: { 
            'Content-Type': 'application/x-www-form-urlencoded'
          },  
          success: function(res) {
            wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
            console.log("充值返回结果");
            console.log(res);
            wx.requestPayment({
              'timeStamp': res.data.Edata[0].data.timeStamp,
              'nonceStr': res.data.Edata[0].data.nonceStr,
              'package': res.data.Edata[0].data.package,
              'signType': 'MD5',
              'paySign': res.data.Edata[0].data.paySign,
              'success':function(res){
                wx.switchTab({
                                  url: '../usercenter/index'
                                })
              },
              'fail':function(res){
                wx.showModal({
                          title: '提示',
                          content: "充值失败",
                          showCancel:false,
                          success: function(res) {
                            if (res.confirm) {
                                console.log("充值1分钱")
                                wx.switchTab({
                                  url: '../usercenter/index'
                                })
                            }
                          }
                }) 
                console.log(res)
              }
            })
          },
          fail: function(res) {  
            console.log("获取钱包信息失败")        
          }
      }) 
  },
  moneyD:function(e)//500元
  {
      var evheader=app.EvcharHeader('{"money":50000,"type":3,"bizType":1,"accessToken":"'+wx.getStorageSync('accessToken')+'"}');
      wx.request({
          url: 'https://wx.chongdian.club/getData.php',//php上固定地址
          method:'POST',
          data: {
            'evUrl':'/order/weixin/makeRechargeOrder',
            'evheader':evheader,
            'evdata':'{"money":50000,"type":3,"bizType":1,"accessToken":"'+wx.getStorageSync('accessToken')+'"}'
          },  
          header: { 
            'Content-Type': 'application/x-www-form-urlencoded'
          },  
          success: function(res) {
            wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
            console.log("充值返回结果");
            console.log(res);
            wx.requestPayment({
              'timeStamp': res.data.Edata[0].data.timeStamp,
              'nonceStr': res.data.Edata[0].data.nonceStr,
              'package': res.data.Edata[0].data.package,
              'signType': 'MD5',
              'paySign': res.data.Edata[0].data.paySign,
              'success':function(res){
                wx.switchTab({
                                  url: '../usercenter/index'
                                })
              },
              'fail':function(res){
                wx.showModal({
                          title: '提示',
                          content: "充值失败",
                          showCancel:false,
                          success: function(res) {
                            if (res.confirm) {
                                wx.switchTab({
                                  url: '../usercenter/index'
                                })
                            }
                          }
                }) 
                console.log(res)
              }
            })
          },
          fail: function(res) {  
            console.log("获取钱包信息失败")        
          }
      }) 
  },
  onShareAppMessage: function () { 
    return { 
      title: '惠充电，新能源汽车充电平台', 
      desc: '实现居住地、工作地、目的地充电桩的查询、预约、充电、支付等便捷功能。', 
      path: '/pages/index/index' 
    } 
  }

})


