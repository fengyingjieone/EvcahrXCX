//index.js
//获取应用实例
var app = getApp();
var wxCharts = require('../images/wxcharts.js');
var lineChart = null;
Page({
  data: {
    userNickName:wx.getStorageSync('userNickName')
  },
  toRechargeCoin:function()
  {
    wx.navigateTo({
      url: '../rechargeCoin/index'
    })  
  },
  onLoad: function () {
    var that=this;
    var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'"}');
        wx.request({
                url: 'https://wx.chongdian.club/getData.php',//php上固定地址
                method:'POST',
                data: {
                  'evUrl':'/capital/getUserIncomeTotalAndYes',
                  'evheader':evheader,
                  'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'"}'
                },  
                header: { 
                     'Content-Type': 'application/x-www-form-urlencoded'
                },  
                success: function(res) {
                  wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                  that.setData({
                    yestodayIncome:((res.data.Edata[0].data.yesterdayAmount)*0.01).toFixed(2),//昨日收益
                    totalIncome:((res.data.Edata[0].data.totalAmount)*0.01).toFixed(2)
                      })
                },
                fail: function(res) {  
                  console.log("获取钱包信息失败")        
                }
              })//昨日收益 总收益
              var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'"}');
              wx.request({
                url: 'https://wx.chongdian.club/getData.php',//php上固定地址
                method:'POST',
                data: {
                  'evUrl':'/device/listUserChargeStations',
                  'evheader':evheader,
                  'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'"}'
                },  
                header: { 
                     'Content-Type': 'application/x-www-form-urlencoded'
                },  
                success: function(res) {
                  wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳    
                  //wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳              
                  that.setData({
                        listArray:res.data.Edata[0].data//明细列表
                      })
                },
                fail: function(res) {  
                  console.log("获取钱包信息失败")        
                }
              })//充电点列表
      var evheader=app.EvcharHeader('{"accessToken":"'+wx.getStorageSync('accessToken')+'"}');
        wx.request({
                url: 'https://wx.chongdian.club/getData.php',//php上固定地址
                method:'POST',
                data: {
                  'evUrl':'/capital/listUserIncome',
                  'evheader':evheader,
                  'evdata':'{"accessToken":"'+wx.getStorageSync('accessToken')+'"}'
                },  
                header: { 
                     'Content-Type': 'application/x-www-form-urlencoded'
                },  
                success: function(res) {
                  wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                  if(res.data.Edata[0].code=="0"&&res.data.Edata[0].data!=null)
                  {
                      var timeList=new Array();//日期
		                  var MoneyList=new Array();//充电度数
                      for(var i=0;i<15;i++)//10天电量
                      {			
                        //第一步   获取当前时间戳
                        var lockStr=0;
                        var nowTime=that.timeToTimestamp(that.TimestampToTime(new Date().getTime()))-86400000*i
                        //因为时间戳精度不一致①获取当前日期②转成js时间戳 //获取时间格式太复杂了  		

                        
                        //第二步  循环订单日期，并且与第一步的时间戳进行匹配
                        for(var x=0;x<(res.data.Edata[0].data).length;x++)
                        {
                          var orderTime=that.timeToTimestamp((res.data.Edata[0].data)[x].createTime)//当前循环订单时间戳
                          if(nowTime==orderTime)//如果两个时间相等，说明这一天有充过电
                          {
                            var timee=(res.data.Edata[0].data)[x].createTime.substr(5 ,5) ;
                            var degree=(res.data.Edata[0].data)[x].amount*0.01
                            //alert(recData.data[x].paramMap.totalDegree)
                            timeList.unshift(timee)//在数组前面增加元素
                            MoneyList.unshift(degree.toFixed(2));
                            lockStr=1;
                          }                     	
                        }
                        if(lockStr==0)//如果两个时间不相等  则添加时间到数组  添加当天充电量为0
                        {					
                            var timee=(that.TimestampToTime(nowTime)).substr(5 ,5) ;
                            timeList.unshift(timee)//在数组前面增加元素
                            MoneyList.unshift(0);
                        }	                        
                      }
                     that.drawCanvas(timeList,MoneyList) 
                  }
                },
                fail: function(res) {  
                  console.log("获取折线图信息失败")        
                }
          })
  },  
  toIncomeInfo:function(e)
  {
    console.log("输出点击对象"+e.currentTarget.id)
    var incomedev=e.currentTarget.id;
    var incomedevArr=incomedev.split("||")
    wx.navigateTo({
      url: '../incomeInfo/index?stationType='+incomedevArr[0]+'&stationId='+incomedevArr[1]
    })  
  },
  timeToTimestamp:function (timee)//日期转时间戳
  {
      var date =timee;
      date = date.substring(0,19);    
      date = date.replace(/-/g,'/'); 
      var timestamp = new Date(date).getTime();
      return timestamp;
  },
  TimestampToTime:function (timee)//时间戳转日期
  {
    var timestamp = timee;
    var d = new Date(timestamp);    //根据时间戳生成的时间对象
    var date = (d.getFullYear()) + "-" + 
          (d.getMonth() + 1) + "-" +
          (d.getDate()) ;
    return date;	
  },
  drawCanvas:function(timee,datee){
          var windowWidth = 320;
          try {
              var res = wx.getSystemInfoSync();//获取窗口宽度
              windowWidth = res.windowWidth;
          } catch (e) {
              console.error('getSystemInfoSync failed!');
          }
          lineChart = new wxCharts({
              canvasId: 'lineCanvas',//画布ID
              type: 'area',//面积图
              categories:timee,//x轴  时间轴 是由上面的随机数得来的
              animation: true,//动画效果
              legend:false,
              background: '#FF0000',//背景色  不知道在哪显示
              series: [{
                  name: '收益',
                  data: datee,
                  format: function (val, name) {
                      return Number(val).toFixed(2);
                  }
              }, ],
              xAxis: {
                  disableGrid: false,//x轴  分割线    
                  title: '日期',   
                  'type':"calibration"         
              },
              yAxis: {
                  title: '收益 (元)',
                  format: function (val) {
                      return val.toFixed(2);
                  },
                  min: 0
              },
              width: windowWidth,
              height: 200,
              dataLabel: false,//标注在点上的信息
              dataPointShape: true,//是否在图表中显示数据点图形标识
              extra: {
                  lineStyle: 'straight'//straight 直线 curve 曲线
              }
          }); 
  },
touchHandler: function (e) {
        console.log(lineChart.getCurrentDataIndex(e));
        lineChart.showToolTip(e, {
             //background: '#7cb5ec'//详细信息的背景色
        });    
},
onShareAppMessage: function () { 
    return { 
      title: '惠充电，新能源汽车充电平台', 
      desc: '实现居住地、工作地、目的地充电桩的查询、预约、充电、支付等便捷功能。', 
      path: '/pages/index/index' 
    } 
 }


})


