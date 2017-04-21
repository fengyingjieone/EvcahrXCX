//index.js
//获取应用实例
var app = getApp();
var totalm=0;
Page({
  data: {
    loginMobileVal: '',//注册时的手机号，初始化为空
    loginPWVal:"",
    inputSms:"",
    loginBox:false,//已有账号密码登陆，默认隐藏
      imgUrls: [  
       {
          url:'../images/photo.jpg'   
       },{  
          url:'../images/photo2.jpg'  
       },{  
          url:'../images/photo.jpg'   
       }   
    ]
  }, 
  onLoad:function(e)
  {
      console.log("桩id")
      console.log(e.OneDevId)
      
      var onDevInfo=(e.OneDevId).split("||")
      console.log(onDevInfo)
      console.log(onDevInfo[0])
      var that = this;
      var evheader=app.EvcharHeader('{"appKey":"'+wx.getStorageSync('evcharAppkey')+'","deviceId":'+onDevInfo[0]+'}');
      console.log('{"appKey":"'+wx.getStorageSync('evcharAppkey')+'","deviceId":'+onDevInfo[0]+'}')
      wx.request({
          url: app.getHostURL()+'/getData.php',//php上固定地址
          method:'POST',
          data: {
              'evUrl':'/device/listDeviceAllDetail',
              'evheader':evheader,
              'evdata':'{"appKey":"'+wx.getStorageSync('evcharAppkey')+'","deviceId":'+onDevInfo[0]+'}'
          },  
          header: { 
              'Content-Type': 'application/x-www-form-urlencoded'
          },  
          success: function(res) {
              wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
              console.log("桩详情")
              console.log(res)
              if(res.data.Edata[0].data.shareTimes==null)
              {
                  var shareTime="未开放";
              }else{                
                var myDate=new Date();
                var myTodey=myDate.getDay();
                console.log(myTodey);
                console.log(res.data.Edata[0].data.shareTimes);
                var shareTime=res.data.Edata[0].data.shareTimes[myTodey].startTime+"-"+res.data.Edata[0].data.shareTimes[myTodey].endTime;
              }
              var devArray=new Array();
              for(var i=0;i<(res.data.Edata[0].data.childResList).length;i++)
              {
                var devStatusDescription;
                var devStatus=res.data.Edata[0].data.childResList[i].deviceStatus;
                var devType=res.data.Edata[0].data.childResList[i].deviceType;
                if(devStatus==3&&devType==1)
                {
                    devStatusDescription="预约";
                }else if(devStatus==1&&devType==1)
                {
                    devStatusDescription="共享时间外";
                }else if(devStatus==2&&devType==1)
                {
                   devStatusDescription="被预约";
                }else if(devStatus==4&&devType==1)
                {
                   devStatusDescription="充电中";
                }else if(devStatus==5&&devType==1)
                {
                   devStatusDescription="插枪";
                }else if(devStatus==6&&devType==1)
                {
                   devStatusDescription="不在线";
                }else if(devStatus==3&&devType==2)
                {
                   devStatusDescription="扫码充电";
                }else if(devStatus==1&&devType==2)
                {
                   devStatusDescription="共享时间外";
                }else if(devStatus==4&&devType==2)
                {
                   devStatusDescription="充电中";
                }else if(devStatus==5&&devType==2)
                {
                   devStatusDescription="插枪";
                }else if(devStatus==6&&devType==2)
                {
                   devStatusDescription="不在线";
                }

                console.log(devStatusDescription)
                devArray[i]={devName:res.data.Edata[0].data.childResList[i].deviceName,devDescription:res.data.Edata[0].data.childResList[i].deviceDescription,devStatusTxt:devStatusDescription,devSn:res.data.Edata[0].data.childResList[i].deviceSn,devType:res.data.Edata[0].data.childResList[i].deviceType}
              }
              console.log(devArray)
              that.setData({
                  devInfoShareTime:shareTime,
                  devInfoAddress:res.data.Edata[0].data.address,
                  devInfoDistace:onDevInfo[1],
                  devInfoExpress:((res.data.Edata[0].data.express)*0.01).toFixed(2),
                  devList:devArray
              })
          },
          fail: function(res) {  
              console.log("获取钱包信息失败") 
              console.log(res);                         
          }
      }) 
  },
  onShow: function (e) 
  {
    
        var that = this;    
        var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'","pageSize":20,"pageNum ":1,"capitalTypeSelect":1}');
        console.log("头部信息"+evheader)

        wx.request({
                url: app.getHostURL()+'/getData.php',//php上固定地址
                method:'POST',
                data: {
                  'evUrl':'/capital/listUserCapitals',
                  'evheader':evheader,
                  'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'","pageSize":20,"pageNum ":1,"capitalTypeSelect":1}'
                },  
                header: { 
                     'Content-Type': 'application/x-www-form-urlencoded'
                },  
                success: function(res) {
                  wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                  console.log("现金消费明细")
                  console.log(res)
                  that.setData({
                        listArray:res.data.Edata[0].data//明细列表
                      })
                },
                fail: function(res) {  
                  console.log("获取钱包信息失败") 
                  console.log(res)
                         
                }
              })  
  },
yuYue:function(e)
  {
    var DevsnInfo=(e.currentTarget.id).split("||")
    console.log(DevsnInfo)
    if(DevsnInfo[1]=="预约")
    {
        wx.showModal({
              title: '提示',
              content: "预约后一小时内可以免费取消，超过一小时未开启充电，系统将自动取消预约并扣除6元充电资源占用费给桩主。",
              showCancel:true,
              success: function(res) {
                  if (res.confirm) {                                                 
                        console.log('用户点击确定')
                  
                    var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'","deviceSn":"'+DevsnInfo[0]+'","openType":"2"}');
                    wx.request({
                        url: app.getHostURL()+'/getData.php',//php上固定地址
                        method:'POST',
                        data: {
                            'evUrl':'/order/makeChargeOrder',
                            'evheader':evheader,
                            'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'","deviceSn":"'+DevsnInfo[0]+'","openType":"2"}'
                        },  
                        header: { 
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },  
                        success: function(res) {
                            wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                            console.log("预约结果")
                            console.log(res)
                            if(res.data.Edata[0].code!=0){
                                wx.showToast({
                                    title: res.data.Edata[0].msg,
                                    icon: 'loading',
                                    duration: 1000
                                }) 
                            }else
                            {
                                wx.switchTab({
                                url: '../isCharging/index'
                                })
                            }
                        },
                        fail: function(res) {  
                            console.log("获取钱包信息失败") 
                            console.log(res); 
                        }
                    })
                  }
              }
        })  
        
    }else if(DevsnInfo[1]=="扫码充电"||DevsnInfo[1]=="插枪"&&DevsnInfo[2]==2)
    {
        console.log(DevsnInfo)
        var that = this;
      var setIntervalClock;
      var clockCount=0;        
      wx.scanCode({
        success: function(res){
            wx.showToast({
                title: '正在开启',
                icon: 'loading',
                duration: 10500
            })
          console.log(res.result)
          var sn= (res.result).substr((res.result).indexOf("sn=")+3);           
          var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'","deviceSn":"'+sn+'","openType":"3"}');
          wx.request({
              url: app.getHostURL()+'/getData.php',//php上固定地址
              method:'POST',
              data: {
                    'evUrl':'/order/makeChargeOrder',
                    'evheader':evheader,
                    'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'","deviceSn":"'+sn+'","openType":"3"}'
              },  
              header: { 
                  'Content-Type': 'application/x-www-form-urlencoded'
              },  
              success: function(res) {
                  wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                  console.log("扫码开启后返回的结果")
                  console.log(res)
                  if(res.data.Edata[0].code==0)
                  {
                    console.log("开启指令发送成功")
                    setIntervalClock=setInterval(function(){
                      clockCount++
                      var that = this;    
                      var evheader=app.EvcharHeader('{"appKey":"'+wx.getStorageSync('evcharAppkey')+'","deviceSn":"'+sn+'"}');
                      wx.request({
                        url: app.getHostURL()+'/getData.php',//php上固定地址
                        method:'POST',
                        data: {
                          'evUrl':'/device/checkIsCharging',
                          'evheader':evheader,
                          'evdata':'{"appKey":"'+wx.getStorageSync('evcharAppkey')+'","deviceSn":"'+sn+'"}'
                        },  
                        header: { 
                        'Content-Type': 'application/x-www-form-urlencoded'
                        },  
                        success: function(res) {
                          wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                          console.log("检查开启结果")
                          console.log(res)
                          if(res.data.Edata[0].code==0&&res.data.Edata[0].data)
                          {
                              console.log("开启成功，跳转到充电状态页面")
                              clearInterval(setIntervalClock);  
                              wx.switchTab({
                                url: '../isCharging/index'
                              })
                          }else
                          {
                            console.log("开启失败，继续检查"+clockCount);
                            if(clockCount==4)
                            {
                              clearInterval(setIntervalClock);   
                              wx.showToast({
                                title: '设备开启失败，请扫码重试',
                                icon: 'loading',
                                duration: 1500
                              }) 
                            }
                          }
                        },
                        fail: function(res) {  
                          console.log("开启后，设备没有充电") 
                        }
                      })
                    },2000)
                  }else
                  {
                    wx.showToast({
                        title: res.data.Edata[0].msg,
                        icon: 'loading',
                        duration: 1500
                    }) 
                  }
              },
              fail: function(res) {  
                    console.log("扫码开启失败") 
              }
          })
        }
      })
    }else if(DevsnInfo[1]=="插枪"&&DevsnInfo[2]==1)
    {
        wx.showToast({
          title: "不可用",
          icon: 'loading',
          duration: 1500
        })
    }else
    {
        wx.showToast({
          title: DevsnInfo[1],
          icon: 'loading',
          duration: 1500
        })
    }
  },
  onShareAppMessage: function () { 
    return { 
      title: '惠充电，新能源汽车充电平台', 
      desc: '实现居住地、工作地、目的地充电桩的查询、预约、充电、支付等便捷功能。', 
      path: '/pages/index/index' 
    } 
  }


})


