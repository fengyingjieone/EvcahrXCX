
Page({
    onShareAppMessage: function () { 
    return { 
      title: '惠充电，新能源汽车充电平台', 
      desc: '实现居住地、工作地、目的地充电桩的查询、预约、充电、支付等便捷功能。', 
      path: '/pages/index/index' 
    } 
  },
toxieyi:function()
  {
      wx.navigateTo({
          url: '../xieyi/index'
        }) 
  },
})


