//index.js
//获取应用实例
var app = getApp();
var orderDevId;//正在充电的桩的id
var orderDevSn;//正在充电的桩的sn
var orderDevOrderId;//正在充电的桩的sn
var setIntervalClockB;//onshow定时任务  开启成功时 取消时  需要清除
var setIntervalClockC;//devOn checkIsCharging检查开启状态 开启成功时，超出次数时，需要清除
var setIntervalClockCA;//devOn  开启成功时定时显示次订单的信息，超出次数时，需要清除
var setIntervalClockD;//getOrderListt  getChargeOrderStatusList 2秒一次 结束充电时
var setIntervalClockE;//devOff checkIsCharging检查关闭状态 定时任务
var setIntervalClockF;//cancleOrder 开启成功时 取消时  需要清除
var setIntervalClockG;//从订单列表里选择一个具体订单时 定时任务  开启成功时 取消时  需要清除

//下面是自走计时全局变量
var yuyueDsaojishi; //开启充电 取消订单的时候应该取消
var chongdianDsaojishi;//关闭充电的时候应取消

var surperSetInterval;//超级定时器，开启一个定时器之前必须关闭在他前面的所有定时器
var orderSetInterval;//订单状态轮询
var controlSetInterval;//开启或关闭后的3次轮询

Page({
  data: {
  },
  onShow: function () {
    wx.showToast({
              title: '加载中..',
              icon: 'loading',
              duration: 10000,
        mask:true
          })
    clearInterval(surperSetInterval);
    clearInterval(orderSetInterval);
    clearInterval(controlSetInterval);
    var that=this;
      console.log(wx.getStorageSync('openid'))
      var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'","pageSize":40,"pageNum":1}');
      wx.request({
          url: app.getHostURL()+'/getData.php',//php上固定地址
          method:'POST',
          data: {
              'evUrl':'/order/getChargeOrderStatusList',
              'evheader':evheader,
              'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'","pageSize":40,"pageNum":1}'
          },
          header: {
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function(res)
          {
              wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
              wx.hideToast();
              if(res.data.Edata[0].data.length==0)//无订单
              {
                  console.log("没有订单")
                  that.setData({
                      orderLength:0//订单数量
                  })
              }else if(res.data.Edata[0].data.length>1)//多个订单
              {
                  console.log("多个订单")
                  that.setData({
                      orderLength:3,//订单数量
                      listArray:res.data.Edata[0].data//列出列表
                  })

              }else if(res.data.Edata[0].data.length==1)
              {
                  //只有一个订单的情况  先请求一次，后面再定时请求 开始
                  var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'","orderId":"'+res.data.Edata[0].data[0].orderId+'"}');
                  console.log("请求头"+evheader)
                  wx.request({
                      url: app.getHostURL()+'/getData.php',//php上固定地址
                      method:'POST',
                      data: {
                          'evUrl':'/order/getChargeOrderStatus',
                          'evheader':evheader,
                          'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'","orderId":"'+res.data.Edata[0].data[0].orderId+'"}'
                      },
                      header: {
                          'Content-Type': 'application/x-www-form-urlencoded'
                      },
                      success: function(res) {
                          wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                          console.log("充电状态返回")
                          console.log(res)
                          if(res.data.Edata[0].data.deviceName!=undefined)
                          {
                              that.setData({
                                          deviceTitle:res.data.Edata[0].data.deviceName
                                    })
                          }
                          if(res.data.Edata[0].data.orderStatus==1)//预约单
                          {
                              console.log("预约单");
                              orderDevOrderId=res.data.Edata[0].data.orderId;
                              orderDevId=res.data.Edata[0].data.deviceId;
                              orderDevSn=res.data.Edata[0].data.deviceSn;
                              var tim=res.data.Edata[0].data.createTime;
                              that.canvasDaojishi(res.data.timestamp-res.data.Edata[0].data.createTime)//画布显示 当前服务器时间—创建时间
                              console.log("创建时间="+tim)

                              var nowTime=res.data.timestamp;
                              clearInterval(surperSetInterval);
                              surperSetInterval=setInterval(function(){
                                  console.log(1)
                                    nowTime=Number(nowTime)+1000;
                                    var showTime=app.clocktimeB(nowTime,tim)
                                    that.setData({
                                          timeeB:showTime
                                    })
                                },1000);//预约自读倒计时
                                
                              that.setData({
                                  orderLength:6
                              })
                          }else
                          {
                              orderDevId=res.data.Edata[0].data.deviceId;
                              orderDevSn=res.data.Edata[0].data.deviceSn;
                              var tim=res.data.Edata[0].data.startTime;
                              //var showTime;

                              var nowTime=res.data.timestamp;
                              clearInterval(surperSetInterval);
                              surperSetInterval=setInterval(function(){
                                  if(tim==null){
                                      clearInterval(chongdianDsaojishi)
                                      chongdianDsaojishi=null
                                  }
                                  console.log(2)
                                    nowTime=Number(nowTime)+1000;
                                    var showTime=app.clocktime(nowTime,tim)
                                    that.setData({
                                          timee:showTime
                                    })
                                },1000);//充电中自读计时
                              that.setData({
                                  orderLength:1,
                                  electricity:((res.data.Edata[0].data.electricity)*0.01).toFixed(2),//已充电量
                                  money:((res.data.Edata[0].data.money)*0.01).toFixed(2),//共享金额
                                  voltage:((res.data.Edata[0].data.voltage)*0.01).toFixed(0),
                                  gonglv:((res.data.Edata[0].data.voltage*res.data.Edata[0].data.current)*0.0000001).toFixed(1)
                              })
                          }
                      },
                      fail: function(res) {
                          console.log("获取充电信息")
                      }
                  })
                  //只有一个订单的情况 判断是预约单/开始单  先请求一次，后面再定时请求 结束
                  clearInterval(orderSetInterval);
                  orderSetInterval=setInterval(function(){
                      var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'","orderId":"'+res.data.Edata[0].data[0].orderId+'"}');
                      //console.log("请求头"+evheader)
                      wx.request({
                          url: app.getHostURL()+'/getData.php',//php上固定地址
                          method:'POST',
                          data: {
                              'evUrl':'/order/getChargeOrderStatus',
                              'evheader':evheader,
                              'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'","orderId":"'+res.data.Edata[0].data[0].orderId+'"}'
                          },
                          header: {
                              'Content-Type': 'application/x-www-form-urlencoded'
                          },
                          success: function(res)
                          {
                              wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                              //console.log("充电状态返回")
                              //console.log(res)
                              if(res.data.Edata[0].data.orderStatus==1)//预约单
                              {
                                  //console.log("预约单");
                                  orderDevOrderId=res.data.Edata[0].data.orderId;
                                  orderDevId=res.data.Edata[0].data.deviceId;
                                  orderDevSn=res.data.Edata[0].data.deviceSn;
                                  var tim=res.data.Edata[0].data.createTime;
                                  //var showTime=app.clocktimeB(res.data.timestamp,tim);
                                  that.canvasDaojishi(res.data.timestamp-res.data.Edata[0].data.createTime)//画布显示 当前服务器时间—创建时间
                                  that.setData({
                                          orderLength:6
                                  })
                              }else if(res.data.Edata[0].data.orderStatus==12)//用户把枪
                              {                                  
                                  that.getOrderListt();
                              }else  if(res.data.Edata[0].data.orderStatus==4)//正在充电
                              {
                                  orderDevId=res.data.Edata[0].data.deviceId;
                                  orderDevSn=res.data.Edata[0].data.deviceSn;
                                  var tim=res.data.Edata[0].data.startTime;                                
                                  that.setData({
                                    orderLength:1,
                                    electricity:((res.data.Edata[0].data.electricity)*0.01).toFixed(2),//订单数量
                                    money:((res.data.Edata[0].data.money)*0.01).toFixed(2),//共享金额
                                    voltage:((res.data.Edata[0].data.voltage)*0.01).toFixed(0),
                                    gonglv:((res.data.Edata[0].data.voltage*res.data.Edata[0].data.current)*0.0000001).toFixed(1)
                                    })
                              }
                          },
                          fail: function(res) {
                                console.log("获取充电信息")
                          }
                      })
                  },4051)
              }
          },
          fail: function(res) {
              console.log(" 获取订单列表失败")
          }
      })
  },















  devOff:function()
  {
      var that=this;
      wx.showModal({
          content: '确定结束充电',
          success: function(res) {
              if (res.confirm) {                  
                  var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'","deviceId":"'+orderDevId+'"}');
                  wx.request({
                      url: app.getHostURL()+'/getData.php',//php上固定地址
                      method:'POST',
                      data: {
                          'evUrl':'/device/operateOff',//开关设备
                          'evheader':evheader,
                          'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'","deviceId":"'+orderDevId+'"}'
                      },
                      header: {
                          'Content-Type': 'application/x-www-form-urlencoded'
                      },
                      success: function(res) {
                          wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                          console.log("关机指令下发成功，下面应该去确认有没有关闭成功")
                          var checkTimes=0;
                          clearInterval(controlSetInterval);
                          controlSetInterval=setInterval(function(){
                              var evheader=app.EvcharHeader('{"appKey":"'+wx.getStorageSync('evcharAppkey')+'","deviceSn":"'+orderDevSn+'"}');
                              wx.request({
                                  url: app.getHostURL()+'/getData.php',//php上固定地址
                                  method:'POST',
                                  data: {
                                      'evUrl':'/device/checkIsCharging',
                                      'evheader':evheader,
                                      'evdata':'{"appKey":"'+wx.getStorageSync('evcharAppkey')+'","deviceSn":"'+orderDevSn+'"}'
                                  },
                                  header: {
                                      'Content-Type': 'application/x-www-form-urlencoded'
                                  },
                                  success: function(res) {
                                      console.log("关机后的电桩状态")
                                      console.log(res)
                                      wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                                      checkTimes=checkTimes+1;
                                      if(res.data.Edata[0].code==0&&!res.data.Edata[0].data)
                                      {
                                          console.log("接口状态码是0，设备状态是false，说明关机成功，下面取消定时器，下面获取设备列表")
                                          wx.hideToast();
                                          console.log("延迟6秒")
                                          that.getOrderListt();

                                      }else
                                      {
                                          if(checkTimes==4)
                                          {
                                              wx.showToast({
                                                  title: '关闭失败',
                                                  icon: 'loading',
                                                  duration: 1000,
                                                  mask:true
                                              })
                                              clearInterval(controlSetInterval);//结束充电失败 取消检查
                                              console.log("提示关闭失败")
                                          }
                                      }
                                  },
                                  fail: function(res) {
                                      console.log("关机失败")
                                  }
                              })
                          },2000)
                      },
                      fail: function(res) {
                          wx.showToast({
                              title: '关闭失败，请重试',
                              icon: 'loading',
                              duration: 1500,
                              mask:true
                          })
                      }
                  })
              } else if (res.cancel) {
                  console.log('用户点击取消')
              }
          }
      })

  },
  getChargeOrderStatus:function(e)
  {
      clearInterval(setIntervalClockB);
    clearInterval(setIntervalClockC);
    clearInterval(setIntervalClockCA);
    clearInterval(setIntervalClockD);
    clearInterval(setIntervalClockE);
    clearInterval(setIntervalClockF);
    clearInterval(setIntervalClockG);
    var that=this;
    wx.showToast({
      title: '加载中..',
      icon: 'loading',
      duration: 10000,
        mask:true
    }) 
    console.log("要查看的订单号是"+e.currentTarget.id)
    orderDevOrderId=e.currentTarget.id;
    var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'","orderId":"'+e.currentTarget.id+'"}');
        console.log("请求头"+evheader)
        wx.request({
          url: app.getHostURL()+'/getData.php',//php上固定地址
          method:'POST',
          data: {
          'evUrl':'/order/getChargeOrderStatus',
          'evheader':evheader,
          'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'","orderId":"'+e.currentTarget.id+'"}'
          },  
          header: { 
            'Content-Type': 'application/x-www-form-urlencoded'
          },  
          success: function(res) {
            //返回的结果要判断是预约单还是正在进行的单子  是预约的单子要有动画
            wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
            console.log(res);
            if(res.data.Edata[0].data.deviceName!=undefined)
            {
                that.setData({
                    deviceTitle:res.data.Edata[0].data.deviceName
                })
            }
            wx.hideToast();
             orderDevSn=res.data.Edata[0].data.deviceSn;
             orderDevId=res.data.Edata[0].data.deviceId;
            if(res.data.Edata[0].data.orderStatus==1)//预约单
            {
                console.log("预约单")
                var tim=res.data.Edata[0].data.createTime;
	            //var showTime=app.clocktimeB(res.data.timestamp,tim);
                var nowTime=res.data.timestamp;
                clearInterval(surperSetInterval);
                                    surperSetInterval=setInterval(function(){
                                        console.log(52)
                                        nowTime=Number(nowTime)+1000;
                                        var showTime=app.clocktimeB(nowTime,tim)
                                        that.setData({
                                            timeeB:showTime
                                        }) 
                                    },1000);//预约自读倒计时
                that.canvasDaojishi(res.data.timestamp-res.data.Edata[0].data.createTime)//画布显示 当前服务器时间—创建时间
                that.setData({
                  orderLength:6
                })
            }else
            {
                console.log("充电单")
                wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                orderDevId=res.data.Edata[0].data.deviceId;
                orderDevSn=res.data.Edata[0].data.deviceSn;
                var tim=res.data.Edata[0].data.startTime;
	              //var showTime=app.clocktime(res.data.timestamp,tim);
                  var nowTime=res.data.timestamp;
                  clearInterval(surperSetInterval);
                              surperSetInterval=setInterval(function(){
                                  if(tim==null){
                                      clearInterval(chongdianDsaojishi)
                                      chongdianDsaojishi=null
                                  }
                                  console.log(2)
                                    nowTime=Number(nowTime)+1000;
                                    var showTime=app.clocktime(nowTime,tim)
                                    that.setData({
                                          timee:showTime
                                    })
                                },1000);//充电中自读计时
                that.setData({
                  orderLength:1,
                  electricity:((res.data.Edata[0].data.electricity)*0.01).toFixed(2),//订单数量
                  money:((res.data.Edata[0].data.money)*0.01).toFixed(2),//共享金额
                  voltage:((res.data.Edata[0].data.voltage)*0.01).toFixed(0),
                  gonglv:((res.data.Edata[0].data.voltage*res.data.Edata[0].data.current)*0.0000001).toFixed(1)
                })
            }
            	  
          },
          fail: function(res) {  
          console.log("获取充电信息")        
          }
          
        })   



    clearInterval(orderSetInterval);   
    orderSetInterval=setInterval(function(){    
        var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'","orderId":"'+e.currentTarget.id+'"}');
        console.log("请求头"+evheader)
        wx.request({
          url: app.getHostURL()+'/getData.php',//php上固定地址
          method:'POST',
          data: {
          'evUrl':'/order/getChargeOrderStatus',
          'evheader':evheader,
          'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'","orderId":"'+e.currentTarget.id+'"}'
          },  
          header: { 
            'Content-Type': 'application/x-www-form-urlencoded'
          },  
          success: function(res) {
              wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
            //返回的结果要判断是预约单还是正在进行的单子  是预约的单子要有动画
            console.log(res);
            wx.hideToast();
             orderDevSn=res.data.Edata[0].data.deviceSn;
             orderDevId=res.data.Edata[0].data.deviceId;
            if(res.data.Edata[0].data.orderStatus==1)//预约单
            {
                console.log("预约单")
                var tim=res.data.Edata[0].data.createTime;                
                that.canvasDaojishi(res.data.timestamp-res.data.Edata[0].data.createTime)//画布显示 当前服务器时间—创建时间
                that.setData({
                  orderLength:6
                })
            }else if(res.data.Edata[0].data.orderStatus==12)//用户把枪
            {
                that.getOrderListt()
            }else if(res.data.Edata[0].data.orderStatus==4)
            {
                console.log("充电单")
                wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                orderDevId=res.data.Edata[0].data.deviceId;
                orderDevSn=res.data.Edata[0].data.deviceSn;
                var tim=res.data.Edata[0].data.startTime;
                that.setData({
                  orderLength:1,
                  electricity:((res.data.Edata[0].data.electricity)*0.01).toFixed(2),//订单数量
                  money:((res.data.Edata[0].data.money)*0.01).toFixed(2),//共享金额
                  voltage:((res.data.Edata[0].data.voltage)*0.01).toFixed(0),
                  gonglv:((res.data.Edata[0].data.voltage*res.data.Edata[0].data.current)*0.0000001).toFixed(1)
                })
            }
            	  
          },
          fail: function(res) {  
          console.log("获取充电信息")        
          }
          
        })                                           
    },4051)















  },
  devOn:function()
  {var that=this;
    console.log("开机ID"+orderDevOrderId)
    wx.showToast({
      title: '正在开启',
      icon: 'loading',
      duration: 100000,
        mask:true
    }) 
        var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'","deviceId":"'+orderDevId+'","orderId":"'+orderDevOrderId+'","openType":2}');
        wx.request({
                url: app.getHostURL()+'/getData.php',//php上固定地址
                method:'POST',
                data: {
                  'evUrl':'/device/operateOn',//开关设备
                  'evheader':evheader,
                  'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'","deviceId":"'+orderDevId+'","orderId":"'+orderDevOrderId+'","openType":2}'
                },  
                header: { 
                     'Content-Type': 'application/x-www-form-urlencoded'
                },  
                success: function(res) {
                  wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                  console.log("开启成功后返回的结果，预约订单");
                  if(res.data.Edata[0].code!=0)
                  {
                      wx.hideToast();
                      wx.showModal({
                          title: '开启失败',
                          content: res.data.Edata[0].msg,
                          showCancel:false,
                          success: function(res) {
                            //if (res.confirm) {
                                //wx.navigateBack({
                                  //delta: 200
                                //})
                              //console.log('用户点击确定')
                            //}
                          }
                      })
                  }else
                  {
                      //开启成功
                      console.log("开机指令下发成功，下面应该去确认有没有开启成功")
                      var checkTimes=0;
                      clearInterval(controlSetInterval);
                      controlSetInterval=setInterval(function(){
                          var evheader=app.EvcharHeader('{"appKey":"'+wx.getStorageSync('evcharAppkey')+'","deviceSn":"'+orderDevSn+'"}');
                          wx.request({
                              url: app.getHostURL()+'/getData.php',//php上固定地址
                              method:'POST',
                              data: {
                                  'evUrl':'/device/checkIsCharging',
                                  'evheader':evheader,
                                  'evdata':'{"appKey":"'+wx.getStorageSync('evcharAppkey')+'","deviceSn":"'+orderDevSn+'"}'
                              },
                              header: {
                                  'Content-Type': 'application/x-www-form-urlencoded'
                              },
                              success: function(res) {
                                  console.log("开启后checkIsCharging")
                                  console.log(res)
                                  wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                                  checkTimes=checkTimes+1;
                                  if(res.data.Edata[0].code==0&&res.data.Edata[0].data)
                                  {
                                      console.log("接口状态码是0，设备状态是true，说明开机成功，下面取消定时器，下面获取设备列表")
                                      console.log("开启成功，清除倒计时")
                                      clearInterval(controlSetInterval);
                                      wx.hideToast();
                                      console.log("延迟7秒")
                                      //that.getOrderListt();
                                      //开启后显示当前订单的一些情况  开始

                                    var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'","orderId":"'+orderDevOrderId+'"}');
                                          //console.log("请求头"+evheader)
                                          wx.request({
                                              url: app.getHostURL()+'/getData.php',//php上固定地址
                                              method:'POST',
                                              data: {
                                                  'evUrl':'/order/getChargeOrderStatus',
                                                  'evheader':evheader,
                                                  'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'","orderId":"'+orderDevOrderId+'"}'
                                              },
                                              header: {
                                                  'Content-Type': 'application/x-www-form-urlencoded'
                                              },
                                              success: function(res)
                                              {
                                                  wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                                                  console.log("充电状态返回")
                                                  console.log(res)
                                                  if(res.data.Edata[0].data.deviceName!=undefined)
                                                    {
                                                        that.setData({
                                                                    deviceTitle:res.data.Edata[0].data.deviceName
                                                                })
                                                    }
                                                  if(res.data.Edata[0].data.orderStatus==1)//预约单
                                                  {//因为这里是开启充电，可能不会有预约单的情况，先不删
                                                      console.log("预约单");
                                                      orderDevOrderId=res.data.Edata[0].data.orderId;
                                                      orderDevId=res.data.Edata[0].data.deviceId;
                                                      orderDevSn=res.data.Edata[0].data.deviceSn;
                                                      var tim=res.data.Edata[0].data.createTime;
                                                      //var showTime=app.clocktimeB(res.data.timestamp,tim);
                                                      that.canvasDaojishi(res.data.timestamp-res.data.Edata[0].data.createTime)//画布显示 当前服务器时间—创建时间
                                                    var nowTime=res.data.timestamp;
                                                    clearInterval(surperSetInterval);
                                                    surperSetInterval=setInterval(function(){
                                                        console.log(3)
                                                        nowTime=Number(nowTime)+1000;
                                                        var showTime=app.clocktimeB(nowTime,tim)
                                                        that.setData({
                                                            timeeB:showTime
                                                        })
                                                    },1000);//预约自读倒计时
                                                      that.setData({
                                                              orderLength:6
                                                      })
                                                  }else
                                                  {
                                                      orderDevId=res.data.Edata[0].data.deviceId;
                                                      orderDevSn=res.data.Edata[0].data.deviceSn;
                                                      var tim=res.data.Edata[0].data.startTime;
                                                    var nowTime=res.data.timestamp;
                                                    clearInterval(surperSetInterval);
                                                    surperSetInterval=setInterval(function(){
                                                        if(tim==null){
                                                            clearInterval(chongdianDsaojishi)
                                                            chongdianDsaojishi=null
                                                        }
                                                        console.log(4)
                                                            nowTime=Number(nowTime)+1000;
                                                            var showTime=app.clocktime(nowTime,tim)
                                                            that.setData({
                                                                timee:showTime
                                                            })
                                                        },1000);//充电中自读计时


                                                      that.setData({
                                                        orderLength:1,
                                                        electricity:((res.data.Edata[0].data.electricity)*0.01).toFixed(2),//订单数量
                                                        money:((res.data.Edata[0].data.money)*0.01).toFixed(2),//共享金额
                                                        voltage:((res.data.Edata[0].data.voltage)*0.01).toFixed(0),
                                                        gonglv:((res.data.Edata[0].data.voltage*res.data.Edata[0].data.current)*0.0000001).toFixed(1)
                                                        })
                                                  }
                                              },
                                              fail: function(res) {
                                                    console.log("获取充电信息")
                                              }
                                          })







                                          clearInterval(orderSetInterval);
                                      orderSetInterval=setInterval(function(){
                                          //console.log("只有一个订单CA")
                                          //orderid  是点击开启按钮是获取到的
                                          var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'","orderId":"'+orderDevOrderId+'"}');
                                          //console.log("请求头"+evheader)
                                          wx.request({
                                              url: app.getHostURL()+'/getData.php',//php上固定地址
                                              method:'POST',
                                              data: {
                                                  'evUrl':'/order/getChargeOrderStatus',
                                                  'evheader':evheader,
                                                  'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'","orderId":"'+orderDevOrderId+'"}'
                                              },
                                              header: {
                                                  'Content-Type': 'application/x-www-form-urlencoded'
                                              },
                                              success: function(res)
                                              {
                                                  wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                                                  console.log("充电状态返回")
                                                  console.log(res)
                                                  if(res.data.Edata[0].data.orderStatus==1)//预约单
                                                  {//因为这里是开启充电，可能不会有预约单的情况，先不删
                                                      console.log("预约单");
                                                      orderDevOrderId=res.data.Edata[0].data.orderId;
                                                      orderDevId=res.data.Edata[0].data.deviceId;
                                                      orderDevSn=res.data.Edata[0].data.deviceSn;
                                                      var tim=res.data.Edata[0].data.createTime;
                                                      //var showTime=app.clocktimeB(res.data.timestamp,tim);



                                                      that.canvasDaojishi(res.data.timestamp-res.data.Edata[0].data.createTime)//画布显示 当前服务器时间—创建时间
                                                      that.setData({
                                                              orderLength:6
                                                      })
                                                  }else if(res.data.Edata[0].data.orderStatus==12)//用户把枪
                                                    {
                                                        that.getOrderListt()
                                                    }else if(res.data.Edata[0].data.orderStatus==4)//正在充电
                                                  {
                                                      orderDevId=res.data.Edata[0].data.deviceId;
                                                      orderDevSn=res.data.Edata[0].data.deviceSn;
                                                      var tim=res.data.Edata[0].data.startTime;
                                                      that.setData({
                                                        orderLength:1,
                                                        electricity:((res.data.Edata[0].data.electricity)*0.01).toFixed(2),//订单数量
                                                        money:((res.data.Edata[0].data.money)*0.01).toFixed(2),//共享金额
                                                        voltage:((res.data.Edata[0].data.voltage)*0.01).toFixed(0),
                                                        gonglv:((res.data.Edata[0].data.voltage*res.data.Edata[0].data.current)*0.0000001).toFixed(1)
                                                        })
                                                  }
                                              },
                                              fail: function(res) {
                                                    console.log("获取充电信息")
                                              }
                                          })
                                      },4051)
                                    ////开启后显示当前订单的一些情况  结束
                                  }else
                                  {
                                      if(checkTimes==4)
                                      {
                                          wx.showToast({
                                              title: '开启失败',
                                              icon: 'loading',
                                              duration: 1900,
                                              mask:true
                                          })
                                          clearInterval(setIntervalClockC);//开启失败 清除devOn checkIsCharging检查开启状态 定时任务
                                          console.log("提示开启失败")
                                      }
                                  }
                              },
                              fail: function(res) {
                                  console.log("开启失败")
                              }
                          })
                      },2000)
                  }
                  //开启充电后检查状态 结束
                },
                fail: function(res) {  
                  console.log("开启充电失败")        
                }
              }) 
  },
  cancleOrder:function()
  {




    wx.showToast({
      title: '正在取消',
      icon: 'loading',
      duration: 10000,
        mask:true
    }) 
    var that=this;
    console.log("取消预约订单ID"+orderDevOrderId)
     var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'","orderId":"'+orderDevOrderId+'"}');
       wx.request({
                url: app.getHostURL()+'/getData.php',//php上固定地址
                method:'POST',
                data: {
                  'evUrl':'/order/cancelOrder',
                  'evheader':evheader,
                  'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'","orderId":"'+orderDevOrderId+'"}'
                },  
                header: { 
                     'Content-Type': 'application/x-www-form-urlencoded'
                },  
                success: function(res) {
                  wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                  console.log("取消预约结果")
                  console.log((res))
                  if(res.data.Edata[0].code==0)
                  {
                    console.log("取消成功")
                    wx.hideToast();
                    clearInterval(surperSetInterval);
                    that.getOrderListt()
                  }

                },
                fail: function(res) {  
                  console.log("获取钱包信息失败")        
                }
        })  
  },
  getOrderListt:function(){
    //取消已下三个定时器，说明关闭或者开启或者取消成功
    clearInterval(surperSetInterval);// 取消倒计时定时器
    clearInterval(orderSetInterval);//取消订单状态定时器
    clearInterval(controlSetInterval);//取消  开启或者关闭后的轮询定时器
      var that=this;
      var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'","pageSize":40,"pageNum":1}');
      console.log("请求头"+evheader)
      wx.request({
          url: app.getHostURL()+'/getData.php',//php上固定地址
          method:'POST',
          data: {
              'evUrl':'/order/getChargeOrderStatusList',
              'evheader':evheader,
              'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'","pageSize":40,"pageNum":1}'
          },
          header: {
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function(res) {
              wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
              console.log("订单列表KKKKK");
              console.log(res)
              if(res.data.Edata[0].data.length==0)//无订单
              {
                  console.log("没有订单")
                  that.setData({
                      orderLength:0//订单数量
                  })
              }else if(res.data.Edata[0].data.length>1)//多个订单
              {
                  console.log("多个订单")
                  that.setData({
                      orderLength:3,//订单数量
                      listArray:res.data.Edata[0].data
                  })

              }else if(res.data.Edata[0].data.length==1)
              {
                  var oneOrderId=res.data.Edata[0].data[0].orderId;
                console.log("只有一个订单4")
                      var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'","orderId":"'+res.data.Edata[0].data[0].orderId+'"}');
                      console.log("请求头"+evheader)
                      wx.request({
                          url: app.getHostURL()+'/getData.php',//php上固定地址
                          method:'POST',
                          data: {
                              'evUrl':'/order/getChargeOrderStatus',
                              'evheader':evheader,
                              'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'","orderId":"'+res.data.Edata[0].data[0].orderId+'"}'
                          },
                          header: {
                              'Content-Type': 'application/x-www-form-urlencoded'
                          },
                          success: function(res)
                          {
                              wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                              console.log("充电状态返回")
                              console.log(res)
                               if(res.data.Edata[0].data.deviceName!=undefined)
                                {
                                    that.setData({
                                        deviceTitle:res.data.Edata[0].data.deviceName
                                    })
                                }
                              if(res.data.Edata[0].data.orderStatus==1)//预约单
                              {
                                  console.log("预约单");
                                  orderDevOrderId=res.data.Edata[0].data.orderId;
                                  orderDevId=res.data.Edata[0].data.deviceId;
                                  orderDevSn=res.data.Edata[0].data.deviceSn;
                                  var tim=res.data.Edata[0].data.createTime;
                                  //var showTime=app.clocktimeB(res.data.timestamp,tim);
                                  var nowTime=res.data.timestamp;
                                  clearInterval(surperSetInterval);
                                    surperSetInterval=setInterval(function(){
                                        console.log(51)
                                        nowTime=Number(nowTime)+1000;
                                        var showTime=app.clocktimeB(nowTime,tim)
                                        that.setData({
                                            timeeB:showTime
                                        })
                                    },1000);//预约自读倒计时

                                  that.canvasDaojishi(res.data.timestamp-res.data.Edata[0].data.createTime)//画布显示 当前服务器时间—创建时间
                                  that.setData({
                                          orderLength:6,
                                       
                                  })
                              }else
                              {
                                  orderDevId=res.data.Edata[0].data.deviceId;
                                  orderDevSn=res.data.Edata[0].data.deviceSn;
                                  var tim=res.data.Edata[0].data.startTime;
                                //   var showTime;
                                //   if(tim==null)
                                //   {
                                //       showTime="00:00:00";
                                //   }else
                                //   {
                                //       showTime=app.clocktime(res.data.timestamp,tim);
                                //   }

                                var nowTime=res.data.timestamp;
                                clearInterval(surperSetInterval);
                              surperSetInterval=setInterval(function(){
                                  if(tim==null){
                                      clearInterval(chongdianDsaojishi)
                                      chongdianDsaojishi=null
                                  }
                                  console.log(6)
                                    nowTime=Number(nowTime)+1000;
                                    var showTime=app.clocktime(nowTime,tim)
                                    that.setData({
                                          timee:showTime
                                    })
                                },1000);//充电中自读计时

                                  that.setData({
                                    orderLength:1,
                                    electricity:((res.data.Edata[0].data.electricity)*0.01).toFixed(2),//订单数量
                                    money:((res.data.Edata[0].data.money)*0.01).toFixed(2),//共享金额
                                    voltage:((res.data.Edata[0].data.voltage)*0.01).toFixed(0),
                                    gonglv:((res.data.Edata[0].data.voltage*res.data.Edata[0].data.current)*0.0000001).toFixed(1)
                                    })
                              }
                              //获取列表后只有一个订单  开始
                              clearInterval(orderSetInterval);
                              orderSetInterval=setInterval(function(){
                      console.log("只有一个订单-获取订单列表--电量定时器")
                      var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'","orderId":"'+oneOrderId+'"}');
                      console.log("请求头"+evheader)
                      wx.request({
                          url: app.getHostURL()+'/getData.php',//php上固定地址
                          method:'POST',
                          data: {
                              'evUrl':'/order/getChargeOrderStatus',
                              'evheader':evheader,
                              'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'","orderId":"'+oneOrderId+'"}'
                          },
                          header: {
                              'Content-Type': 'application/x-www-form-urlencoded'
                          },
                          success: function(res)
                          {
                              wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                              console.log("充电状态返回")
                              console.log(res)
                              if(res.data.Edata[0].data.orderStatus==1)//预约单
                              {
                                  console.log("预约单");
                                  orderDevOrderId=res.data.Edata[0].data.orderId;
                                  orderDevId=res.data.Edata[0].data.deviceId;
                                  orderDevSn=res.data.Edata[0].data.deviceSn;
                                  var tim=res.data.Edata[0].data.createTime;
                                  that.canvasDaojishi(res.data.timestamp-res.data.Edata[0].data.createTime)//画布显示 当前服务器时间—创建时间
                                  that.setData({
                                          orderLength:6,
                                       
                                  })
                              }else if(res.data.Edata[0].data.orderStatus==12)//用户把枪
                              {
                                  that.getOrderListt()
                              }else if(res.data.Edata[0].data.orderStatus==4)//正在充电
                              {
                                  orderDevId=res.data.Edata[0].data.deviceId;
                                  orderDevSn=res.data.Edata[0].data.deviceSn;
                                  var tim=res.data.Edata[0].data.startTime;
                                  that.setData({
                                    orderLength:1,
                                    electricity:((res.data.Edata[0].data.electricity)*0.01).toFixed(2),//订单数量
                                    money:((res.data.Edata[0].data.money)*0.01).toFixed(2),//共享金额
                                    voltage:((res.data.Edata[0].data.voltage)*0.01).toFixed(0),
                                    gonglv:((res.data.Edata[0].data.voltage*res.data.Edata[0].data.current)*0.0000001).toFixed(1)
                                    })
                              }
                          },
                          fail: function(res) {
                                console.log("获取充电信息")
                          }
                      })
                  },4051)
//获取列表后只有一个订单  结束



                          },
                          fail: function(res) {
                                console.log("获取充电信息")
                          }
                      })


                  
                  









              }
          },
          fail: function(res) {
              console.log(" 获取订单列表失败")
          }
      })
  },canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg)
  },
  canvasDaojishi:function(tim){
    var that=this;
      //console.log("画布倒计时")
    var times =3600 - tim*0.001;//距离超时还有多少秒    
    var days=Math.floor(times/86400);
	var hourtime=times-days*86400;
	var hours=Math.floor(hourtime/3600);
	var mintime=hourtime-hours*3600;
	var minutes=Math.floor(mintime/60);
	var second=Math.floor(mintime-minutes*60);

    var context = wx.createCanvasContext('firstCanvas')
    context.setStrokeStyle("#3DCAE6")////画布描边
    context.setLineWidth(12)
    console.log("剩余总分钟数="+minutes);
    console.log("剩余总秒数"+times);    
		//return days+"天"+hours+"小时"+minutes+"分"+second+"秒";
    if(times<=0){//剩余总秒数
        context.beginPath();
        context.clearRect(0, 0, 200, 200)
        context.draw()
        //setTimeout(function(){
            //that.getOrderListt();//倒计时结束  刷新列表
        //},2000)
        return;
    }
		var circleCut=parseInt(minutes/5)+1
		console.log(circleCut)
		for(var i=0;i<circleCut;i++)
	    {
            context.beginPath();
            context.arc(79,79,65,(3.3326-i*0.1666)*Math.PI,(3.4826-i*0.1666)*Math.PI,false);//起点为12点钟方向，逆时针，2π为完整圆环	
            context.stroke();
            context.closePath();
        } 
         context.draw();
  },
  onHide:function()
  {
      //页面隐藏的时候 取消所有定时器
      console.log("页面隐藏")
      clearInterval(surperSetInterval);
      clearInterval(orderSetInterval);
  },
onShareAppMessage: function () { 
    return { 
      title: '惠充电，新能源汽车充电平台', 
      desc: '实现居住地、工作地、目的地充电桩的查询、预约、充电、支付等便捷功能。', 
      path: '/pages/index/index' 
    } 
 }
})



