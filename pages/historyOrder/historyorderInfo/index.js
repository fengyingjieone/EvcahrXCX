//index.js
//获取应用实例
var wxCharts = require('wxcharts.js');
var app = getApp();
var lineChart = null;
Page({
  touchHandler: function (e) {
    console.log(lineChart.getCurrentDataIndex(e));
    lineChart.showToolTip(e, {
      // background: '#FFF'//详细信息的背景色
    });
  },
  onLoad: function (e) {
    var that = this;
    that.getOrderInfo(e.orderid);
    that.getChargeInfo(e.orderid);    
  },
  getOrderInfo:function(orderid){
    console.log("订单id", orderid)
    orderid = orderid.split("||");
    var that = this;
    if (orderid[1]==1){
      //免费
      var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","orderId":"' + orderid[0] + '","operateType":1}');
      wx.request({
        url: app.getHostURL() + '/getData.php',//php上固定地址
        method: 'POST',
        data: {
          'evUrl': '/order/getOrderInfo',
          'evheader': evheader,
          'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","orderId":"' + orderid[0] + '","operateType":1}'
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
          console.log("请求结果", res)
          var orderType;
          if (res.data.Edata[0].data.orderType == 1) {
            orderType = "共享收益";
          } else if (res.data.Edata[0].data.orderType == 2) {
            orderType = "充电费用";
          } else if (res.data.Edata[0].data.orderType == 3) {
            orderType = "预约超时收益";
          } else if (res.data.Edata[0].data.orderType == 4) {
            orderType = "免费";
          } else if (res.data.Edata[0].data.orderType == 5) {
            orderType = "预约超时扣费";
          }
          var days = Math.floor(res.data.Edata[0].data.timeTotal / 1440) == 0 ? "" : Math.floor(res.data.Edata[0].data.timeTotal / 1440) + "天";
          var hourtime = res.data.Edata[0].data.timeTotal - Math.floor(res.data.Edata[0].data.timeTotal / 1440) * 1440;
          var hours = Math.floor(hourtime / 60) == 0 ? "" : Math.floor(hourtime / 60) + "小时";
          var mintime = (hourtime - Math.floor(hourtime / 60) * 60) + "分";
          var timeTotal = days + hours + mintime;
          console.log(res.data.Edata[0].data)
          that.setData({
            historyId: res.data.Edata[0].data.orderId,
            historydeviceId: res.data.Edata[0].data.deviceName + "-" + res.data.Edata[0].data.deviceSN,
            orderType: orderType,
            startTime: res.data.Edata[0].data.startTime,
            endTime: res.data.Edata[0].data.endTime,
            timeTotal: timeTotal,
            electricity: (res.data.Edata[0].data.electricity * 0.01).toFixed(2) + "kWh",
            amountHiden: true
          })
        },
        fail: function (res) {
          console.log("获取钱包信息失败")
        }
      })
    }else{
      //收费
      var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","orderId":"' + orderid[0] + '","operateType":0}');
      wx.request({
        url: app.getHostURL() + '/getData.php',//php上固定地址
        method: 'POST',
        data: {
          'evUrl': '/order/getOrderInfo',
          'evheader': evheader,
          'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","orderId":"' + orderid[0] + '","operateType":0}'
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
          console.log("请求结果", res)          
          var orderType;
          if (res.data.Edata[0].data.orderType==1){
            orderType="共享收益";
          } else if (res.data.Edata[0].data.orderType == 2) {
            orderType = "充电费用";
          } else if (res.data.Edata[0].data.orderType == 3) {
            orderType = "预约超时收益";
          } else if (res.data.Edata[0].data.orderType == 4) {
            orderType = "免费";
          } else if (res.data.Edata[0].data.orderType == 5) {
            orderType = "预约超时扣费";
          }
          var days = Math.floor(res.data.Edata[0].data.timeTotal / 1440)==0?"": Math.floor(res.data.Edata[0].data.timeTotal/1440)+"天";
          var hourtime = res.data.Edata[0].data.timeTotal - Math.floor(res.data.Edata[0].data.timeTotal / 1440)*1440;
          var hours = Math.floor(hourtime / 60) == 0 ? "" : Math.floor(hourtime / 60)+"小时";
          var mintime = (hourtime - Math.floor(hourtime / 60) * 60)+"分";
          var timeTotal = days + hours + mintime;          
          console.log(res.data.Edata[0].data)
          that.setData({
            historyId: res.data.Edata[0].data.orderId,
            historydeviceId: res.data.Edata[0].data.deviceName + "-" + res.data.Edata[0].data.deviceSN,
            orderType: orderType,
            startTime: res.data.Edata[0].data.startTime,
            endTime: res.data.Edata[0].data.endTime,
            timeTotal: timeTotal,
            electricity: (res.data.Edata[0].data.electricity * 0.01).toFixed(2)+"kWh",
            amount: (res.data.Edata[0].data.expenses[0].amount * 0.01).toFixed(2) + "元",
            amountHiden: false
          })
        },
        fail: function (res) {
          console.log("获取钱包信息失败")
        }
      })
    }        
  },
  getChargeInfo: function(orderid) {
    var that=this;
    console.log("订单id", orderid)
    orderid = orderid.split("||");
    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","orderId":"' + orderid[0] + '"}');
    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/order/getChargeInfo',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","orderId":"' + orderid[0] + '"}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        console.log("折线请求结果", res);   
        var createTime=new Array;
        var current = new Array;
        for (var i = 0; i < res.data.Edata[0].data.length;i++){
          createTime.push((res.data.Edata[0].data[i].createTime).substring(11)) //在数组前面增加元素
          current.push((res.data.Edata[0].data[i].current*0.01).toFixed(2));
        }
        that.drawCanvas(createTime, current)    
      },
      fail: function (res) {
        console.log("获取钱包信息失败")
      }
    })
  },
  drawCanvas: function (timee, datee) {
    //datee = [1, 2, 3, 4, 5, 6, 6, 5, 6, 5, 6, 5, 3, 4, 6, 4, 5, 6, 4, 5]
    //timee = ["08-1", "08-2", "08-3", "08-4", "08-5", "08-6", "08-7", "08-8", "08-9", "08-10", "08-11", "08-12", "08-13", "08-15", "08-15", "08-16", "08-17", "08-18", "08-19", "08-20"]
    console.log(timee);
    console.log(datee)
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();//获取窗口宽度
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    lineChart = new wxCharts({
      canvasId: 'lineCanvas',//画布ID
      type: 'line',//面积图
      categories: timee,//x轴  时间轴 是由上面的随机数得来的
      animation: true,//动画效果
      legend: false,
      background: '#FF0000',//背景色  不知道在哪显示
      series: [{
        name: '电流',
        data: datee,
        format: function (val, name) {
          return Number(val).toFixed(2);
        }
      },],
      xAxis: {
        disableGrid: true,//x轴  分割线    
        title: '日期',
        'type': "calibration"
      },
      yAxis: {
        disabled:false,
        min:10,
        gridColor: "#d3d3d3",
        format: function (val) {
          return val.toFixed(2)+"A";
        }
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,//标注在点上的信息
      dataPointShape: false,//是否在图表中显示数据点图形标识
      extra: {
        lineStyle: 'straight'//straight 直线 curve 曲线
      }
    });
  }, 
  onShow: function () {
    var that = this;
    var res = wx.getSystemInfoSync()
    that.setData({
      scrollHeight: res.windowHeight - 250
    })
  },
  onShareAppMessage: function () {
    return app.onShareAppMessage();
  },
})


