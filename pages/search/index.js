//index.js
//获取应用实例
var app = getApp();
var searchStr;
var searchMark=new Array();
var totalm=0;
Page({
  onLoad:function(e)
  {
      console.log(e)
  },
  onShow:function(){
    wx.setStorageSync('clickItemLock',0);//全局缓存一个桩 选择锁
  },
  searchBtn: function () 
  {   
        wx.showToast({
          title: '查询中',
          icon: 'loading',
          duration: 10500
      })   
        wx.setStorageSync('searchStr',searchStr);//全局缓存一个桩的mark信息  数组
        var that = this;
        if(searchStr==undefined)
        {
          wx.showToast({
              title: '请输入收索关键字',
              icon: 'loading',
              duration: 1000
          })
          return;
        }
        var searchCoordinate=that.qqTobd(wx.getStorageSync('LocationLatitude'),wx.getStorageSync('LocationLongitude'));
        var myLatLng=that.qqTobd(wx.getStorageSync('myLatitude'),wx.getStorageSync('myLongitude'));
        var evheader=app.EvcharHeader('{"appKey":"'+wx.getStorageSync('evcharAppkey')+'","areaCode":'+wx.getStorageSync('MareaCode')+',"deviceTypeList":'+wx.getStorageSync('MdeviceTypeList')+',"km":'+wx.getStorageSync('Mkm')+',"latitude":"'+searchCoordinate[1]+'","longitude":"'+searchCoordinate[0]+'","recommend":'+wx.getStorageSync('Mrecommend')+',"search":"'+searchStr+'","statusList":'+wx.getStorageSync('MstatusList')+',"myLatitude":"'+myLatLng[1]+'","myLongitude":"'+myLatLng[0]+'"}');
        console.log("头部信息"+evheader)
        console.log('{"appKey":"'+wx.getStorageSync('evcharAppkey')+'","areaCode":'+wx.getStorageSync('MareaCode')+',"deviceTypeList":'+wx.getStorageSync('MdeviceTypeList')+',"km":'+wx.getStorageSync('Mkm')+',"latitude":"'+searchCoordinate[1]+'","longitude":"'+searchCoordinate[0]+'","recommend":'+wx.getStorageSync('Mrecommend')+',"search":"'+searchStr+'","statusList":'+wx.getStorageSync('MstatusList')+',"myLatitude":"'+myLatLng[1]+'","myLongitude":"'+myLatLng[0]+'"}')

        wx.request({
                url: 'https://wx.chongdian.club/getData.php',//php上固定地址
                method:'POST',
                data: {
                  'evUrl':'/device/getAllDevices',
                  'evheader':evheader,
                  'evdata':'{"appKey":"'+wx.getStorageSync('evcharAppkey')+'","areaCode":'+wx.getStorageSync('MareaCode')+',"deviceTypeList":'+wx.getStorageSync('MdeviceTypeList')+',"km":'+wx.getStorageSync('Mkm')+',"latitude":"'+searchCoordinate[1]+'","longitude":"'+searchCoordinate[0]+'","recommend":'+wx.getStorageSync('Mrecommend')+',"search":"'+searchStr+'","statusList":'+wx.getStorageSync('MstatusList')+',"myLatitude":"'+myLatLng[1]+'","myLongitude":"'+myLatLng[0]+'"}'
                },  
                header: { 
                     'Content-Type': 'application/x-www-form-urlencoded'
                },  
                success: function(res) {
                  wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                  wx.hideToast();
                  console.log("搜索结果")
                  console.log(res)
                  console.log(res.data.Edata[0].data.length)
                  var reqData=res.data.Edata[0].data;
                  var resArrar=new Array();
                  for(var i=0;i<reqData.length;i++)
                  {
                    var reqDevStatus;
                    if(reqData[i].deviceType==1&&reqData[i].deviceStatus==3)
                    {
                      reqDevStatus="可用";
                    }else if(reqData[i].deviceType==1&&reqData[i].deviceStatus==2)
                    {
                      reqDevStatus="被预约";
                    }else if(reqData[i].deviceType==1&&reqData[i].deviceStatus==4)
                    {
                      reqDevStatus="充电中";
                    }else if(reqData[i].deviceType==1&&reqData[i].deviceStatus==5)
                    {
                      reqDevStatus="插枪";
                    }else if(reqData[i].deviceType==1&&reqData[i].deviceStatus==1)
                    {
                      reqDevStatus="不可用";
                    }else if(reqData[i].deviceType==1&&reqData[i].deviceStatus==6)
                    {
                      reqDevStatus="不在线";
                    }else if(reqData[i].deviceType==2&&reqData[i].deviceStatus==3)
                    {
                      reqDevStatus="可用";
                    }else if(reqData[i].deviceType==2&&reqData[i].deviceStatus==5)
                    {
                      reqDevStatus="插枪";
                    }else if(reqData[i].deviceType==2&&reqData[i].deviceStatus==6)
                    {
                      reqDevStatus="不在线";
                    }else if(reqData[i].deviceType==2&&reqData[i].deviceStatus==4)
                    {
                      reqDevStatus="充电中";
                    }else if(reqData[i].deviceType==2&&reqData[i].deviceStatus==1)
                    {
                      reqDevStatus="不可用";
                    }else
                    {
                      reqDevStatus="不可用";
                    }
                    var resCoordinate=that.BdTotencent(Number(reqData[i].longitude),Number(reqData[i].latitude));
                      //resArrar数组 用于循环列出收索结果列表
                      resArrar[i]={deviceName:res.data.Edata[0].data[i].deviceName,distance:(res.data.Edata[0].data[i].distance).toFixed(2),address:res.data.Edata[0].data[i].address,devstatusTxt:reqDevStatus}
                      //resArrar数组 用于循环列出收索结果列表

                      //searchMark数组  用于点击收索结果列表后画出地图
                      var infoStr=res.data.Edata[0].data[i].deviceName+"||"+(res.data.Edata[0].data[i].distance).toFixed(2)+"||"+res.data.Edata[0].data[i].deviceCount+"||"+reqDevStatus+"||"+res.data.Edata[0].data[i].id;
                      if(res.data.Edata[0].data[i].deviceStatus==6)
                      {
                        searchMark[i]={iconPath: "/pages/images/gray.png",id:i,latitude:Number(resCoordinate[0]),longitude: Number(resCoordinate[1]),width: 22,height: 28,markInfo:infoStr}
                      }else if(res.data.Edata[0].data[i].deviceStatus==3)
                      {
                        searchMark[i]={iconPath: "/pages/images/blue.png",id:i,latitude:Number(resCoordinate[0]),longitude: Number(resCoordinate[1]),width: 22,height: 28,markInfo:infoStr}
                      }else if(res.data.Edata[0].data[i].deviceStatus==1||res.data.Edata[0].data[i].deviceStatus==2||res.data.Edata[0].data[i].deviceStatus==4||res.data.Edata[0].data[i].deviceStatus==5)
                      {
                        searchMark[i]={iconPath: "/pages/images/yello.png",id:i,latitude:Number(resCoordinate[0]),longitude: Number(resCoordinate[1]),width: 22,height: 28,markInfo:infoStr}
                      }else
                      {
                        searchMark[i]={iconPath: "/pages/images/gray.png",id:i,latitude:Number(resCoordinate[0]),longitude: Number(resCoordinate[1]),width: 22,height: 28,markInfo:infoStr}
                      }
                      //searchMark数组  用于点击收索结果列表后画出地图
                  }
                  that.setData({
                      listArray:resArrar//收索结果列表
                  })
                },
                fail: function(res) {  
                  console.log("获取钱包信息失败") 
                  wx.hideToast();
                  console.log(res)
                         
                }
              })  
  },searchInput:function(e){
    console.log(searchStr)
    searchStr=e.detail.value;
    console.log(e.detail.value)
  },
  clickItem:function(e)
  {
    console.log(e.currentTarget.id)
    wx.setStorageSync('clickItemLock',6);//全局缓存一个桩 选择锁
    var searchArray=new Array(searchMark[e.currentTarget.id])
    wx.setStorageSync('markersArrar',searchArray);//全局缓存一个桩的mark信息  数组
    console.log(wx.getStorageSync('searchArray'))
    wx.navigateBack({
      delta:1
    })
  },
onShareAppMessage: function () { 
    return { 
      title: '惠充电，新能源汽车充电平台', 
      desc: '实现居住地、工作地、目的地充电桩的查询、预约、充电、支付等便捷功能。', 
      path: '/pages/index/index' 
    } 
 },
  qqTobd:function (lat,lng)
{
    var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    var x = parseFloat(lng);
    var y = parseFloat(lat);
    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y,x) + 0.000003 * Math.cos(x * x_pi);
    lng = z * Math.cos(theta) + 0.0065;
    lat = z * Math.sin(theta) + 0.006;
    return [lng,lat]
},
  BdTotencent:function(bd_lon, bd_lat) {
    var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    var x = bd_lon - 0.0065;
    var y = bd_lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    var gg_lng = z * Math.cos(theta);
    var gg_lat = z * Math.sin(theta);
    return [gg_lat,gg_lng]
  }
})


