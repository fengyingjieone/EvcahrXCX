//index.js
//获取应用实例
var app = getApp()
Page({
  onLoad: function (e) 
  {
        console.log(e.totalBatteryCoin)
        var that = this;
        that.setData({
                        totalBatteryCoin:e.totalBatteryCoin//总金额
                      })
        var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'","pageSize":20,"pageNum ":1,"capitalTypeSelect":2}');
        console.log("头部信息"+evheader)

        wx.request({
                url: app.getHostURL()+'/getData.php',//php上固定地址
                method:'POST',
                data: {
                  'evUrl':'/capital/listUserCapitals',
                  'evheader':evheader,
                  'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'","pageSize":20,"pageNum ":1,"capitalTypeSelect":2}'
                },  
                header: { 
                     'Content-Type': 'application/x-www-form-urlencoded'
                },  
                success: function(res) {
                  wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                  console.log("电量币消费明细")
                  console.log((res))
                  for(var i=0;i<(res.data.Edata[0].data).length;i++)
                  {
                    if((res.data.Edata[0].data[i]).capitalType>0)
                    {
                        (res.data.Edata[0].data[i]).amount=String((Number((res.data.Edata[0].data[i]).amount)*0.01).toFixed(2));
                    }else
                    {
                      (res.data.Edata[0].data[i]).amount= String((Number((res.data.Edata[0].data[i]).amount)*0.01).toFixed(2));
                    }
                    
                  }
                  that.setData({
                        listArray:res.data.Edata[0].data//明细列表
                  })
                  console.log("电量币22")
                  console.log(res.data.Edata[0].data)
                },
                fail: function(res) {  
                  console.log("获取钱包信息失败")        
                }
              })  
  }, 
  toRechargeCoin:function()
  {
    wx.navigateTo({
      url: '../rechargeCoin/index'
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
