//index.js
//获取应用实例
var app = getApp()
var devArray=new Array;
var devArrayAll;
Page({
  data: {
    deviceCount: false,//设 默认只有一个设备
    array: ['美国', '中国', '巴西', '日本'],

    date: '2016-09-01',
    time: '12:01'
  }, 
  onLoad: function (e) 
  {
        var that = this;
        var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'"}');
        console.log("头部信息"+evheader)

        wx.request({
                url: 'https://wx.chongdian.club/getData.php',//php上固定地址
                method:'POST',
                data: {
                  'evUrl':'/device/listDevicesByOwner',
                  'evheader':evheader,
                  'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'"}'
                },  
                header: { 
                     'Content-Type': 'application/x-www-form-urlencoded'
                },  
                success: function(res) {
                  wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                  console.log("设置返回数据")
                  console.log((res))
                  if(res.data.Edata[0].data.length>1)
                  {
                      console.log("这位大人有"+res.data.Edata[0].data.length+"个桩");
                      var defaultDevName;
                      devArrayAll=res.data.Edata[0].data;
                      for(var i=0;i<res.data.Edata[0].data.length;i++)
                      {
                          console.log(i)
                          if(res.data.Edata[0].data[i].defaultFlag)
                          {
                              defaultDevName=res.data.Edata[0].data[i].deviceName;                              
                          }
                          devArray[i]=res.data.Edata[0].data[i].deviceName;
                      }
                      that.setData({
                          array:devArray,
                          devName:defaultDevName,
                          deviceCount: true//设 默认只有一个设备
                      })
                  }

                },
                fail: function(res) {  
                  console.log("获取钱包信息失败")        
                }
              })  
  },
  bindPickerChange: function(e) {
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
      devName:devArrayAll[e.detail.value].deviceName
    })
        
        var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'","deviceId":"'+devArrayAll[e.detail.value].id+'"}');
        console.log("头部信息"+evheader)

        wx.request({
                url: 'https://wx.chongdian.club/getData.php',//php上固定地址
                method:'POST',
                data: {
                  'evUrl':'/device/setDefaultDevice',
                  'evheader':evheader,
                  'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'","deviceId":"'+devArrayAll[e.detail.value].id+'"}'
                },  
                header: { 
                     'Content-Type': 'application/x-www-form-urlencoded'
                },  
                success: function(res) {
                  wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                  console.log("设置默认桩")
                  console.log((res))
                  if(res.data.Edata[0].code==0)
                  {
                      wx.showToast({
                        title: '设置成功',
                        icon: 'loading',
                        duration: 1000
                      })
                  }else
                  {
                      wx.showToast({
                        title: '设置失败',
                        icon: 'loading',
                        duration: 1000
                      })
                  }
                  
                },
                fail: function(res) {  
                  console.log("获取钱包信息失败");
                  wx.showToast({
                        title: '设置失败',
                        icon: 'loading',
                        duration: 1000
                      })     
                }
              })  
  }, 
  toAboutUs:function()
  {
    wx.navigateTo({
      url: '../aboutUs/index'
    })  
  },
onShareAppMessage: function () { 
    return { 
      title: '惠充电，新能源汽车充电平台', 
      desc: '实现居住地、工作地、目的地充电桩的查询、预约、充电、支付等便捷功能。', 
      path: '/pages/index/index' 
    } 
 },
dophone:function()
{
  wx.showModal({
      title: '提示',
      content: "确认拨打电话：4007569360吗?",
      confirmText:"拨打",
      success: function(res) {
        if (res.confirm) 
        {
              console.log("点击了确定")
              wx.makePhoneCall({
                                    phoneNumber: '4007569360' //仅为示例，并非真实的电话号码
              })
        }
      }
 })  
    
}
  


})


