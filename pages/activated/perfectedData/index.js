var devicesn;
var app = getApp();
var QQMapWX = require('../../images/qqmap-wx-jssdk.js');
var qqmapsdk;
var mapContext;
var systemInfo = app.getSystemInfoSync();

var province = '';
var city = '';
var district = '';
var address = '';
var deviceName = '';
var electricityPrice='';
var cityCode = '';
var deviceLng = '';
var deviceLat = '';
Page({
    onLoad:function(){
      var that=this;
      that.setData({
        controls: [{
          id: 1009,
          iconPath: '../../images/pin.png',
          position: {
            left: systemInfo.windowWidth*0.5-20,
            top: 77,
            width: 10,
            height: 23
          },
          clickable: true
        }]
      })
      qqmapsdk = new QQMapWX({
        key: '6FUBZ-R7IHU-ZHWVJ-2X5NR-FG3NJ-2PBX7'
      });
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {     
          console.log(res)     
          that.setData({
            SNlongitude: res.longitude,
            SNlatitude: res.latitude
          })
          //that.getCenterSeat();//定位成功后获取地图中心点
          that.nijiexi(res.longitude, res.latitude)
        },
        fail: function (res) {
          console.log("定位失败2" + new Date().getTime())
          console.log(res);
          //that.drawMap()
        }
      })
    },
    getCenterSeat:function(){
      var that=this;
      mapContext = wx.createMapContext('mapDevice');
      mapContext.getCenterLocation({
        success: function (res) {
          console.log("获取地图中心点坐标");
          console.log(res)
          that.nijiexi(res.longitude, res.latitude)
        },
        fail:function(res){
          console.log("获取地图中心点错误信息");
          console.log(res);
        }
      })
    },
    nijiexi:function(lng,lat){
      console.log("逆解析参数")
      console.log(lng);
      console.log(lat);
      var that=this;
      qqmapsdk.reverseGeocoder({
        location: {
          latitude: lat,
          longitude: lng
        },
        success: function (res) {
          console.log(res);
          that.setData({
            province: res.result.ad_info.province,
            city: res.result.ad_info.city,
            district: res.result.ad_info.district,
            address: res.result.address
          })
          //province = res.result.ad_info.province;
          //city = res.result.ad_info.city;
          //district = res.result.ad_info.district;
          address = res.result.address;
          //deviceName;
          //electricityPrice;
          cityCode = res.result.ad_info.adcode;
          deviceLng = res.result.location.lng;
          deviceLat = res.result.location.lat;
        },
        fail: function (res) {
          console.log(res);
        }
      });
    },




    onShareAppMessage: function () {
        return app.onShareAppMessage();
    },
    onShow:function(){
      devicesn="";
      deviceName="";
      electricityPrice="";
    },
    inputSN:function (e){
        devicesn = e.detail.value;
        console.log(devicesn)
    },
    nextStep:function(){
      var that = this;
      console.log('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceSn":"' + devicesn + '"}')
      var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceSn":"' +devicesn+'"}');
      wx.request({
        url: app.getHostURL() + '/getData.php',//php上固定地址
        method: 'POST',
        data: {
          'evUrl': '/activation/validationSn',
          'evheader': evheader,
          'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceSn":"' + devicesn + '"}'
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          //wx.hideToast();activatedSN available
          wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间          
          console.log(res)
          if (res.data.Edata[0].code == 0 && res.data.Edata[0].available) {
            console.log("验证sn成功")
            wx.setStorageSync('activatedSN', devicesn);
          }
        },
        fail: function (res) {
          console.log("获取钱包信息失败")
        }
      })//查看当前开关状态
    },
    inputProvince:function(e){
      province=e.detail.value;
    },
    inputCity:function(e){
      city=e.detail.value;
    },
    inputDistrict: function (e) {
      district=e.detail.value;
    },
    inputAddress: function (e) {
      address=e.detail.value;
    },
    inputDeviceName: function (e) {
      deviceName=e.detail.value;
    },
    inputElectricityPrice: function (e) {
      electricityPrice=e.detail.value;
    },
    saveBtn:function(){
      var that=this;   
      address = address.replace(/(^\s+)|(\s+$)/g, "");
      deviceName = deviceName.replace(/(^\s+)|(\s+$)/g, "");
      electricityPrice = electricityPrice.replace(/(^\s+)|(\s+$)/g, "");
      wx.showToast({
        title: '正在激活',
        icon: 'loading',
        duration: 15000
      })  
      if (!address){
        wx.showToast({
          title: "详细地址不能为空",
          icon: 'loading',
          duration: 1500
        })
        return;
      }
      if (!deviceName){
        wx.showToast({
          title: "设备名不能为空",
          icon: 'loading',
          duration: 1500
        })
        return;
      } 
      console.log(electricityPrice)
      console.log(electricityPrice * 100)
      var electricityPriceErr = Number(electricityPrice);
      if (electricityPriceErr * 100> 200) {
        wx.showToast({
          title: "定价不能高于2元",
          icon: 'loading',
          duration: 1500
        })
        return;
      } else if (!electricityPriceErr) {
        console.log("未执行？？")
        wx.showToast({
          title: "定价错误",
          icon: 'loading',
          duration: 1500
        })
        return;
      }  
      var electricityPriceCents = parseInt(electricityPrice * 100);      
      var locationSeat = that.qqTobd(deviceLat, deviceLng);
      console.log('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceSn":"' + wx.getStorageSync('activatedSN') + '","areaCode":"' + cityCode + '","deviceLng":"' + locationSeat[0] + '","deviceLat":"' + locationSeat[1] + '","address":"' + address + '","deviceName":"' + deviceName + '","electricityPrice":' + electricityPriceCents + '}')
      var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceSn":"' + wx.getStorageSync('activatedSN') + '","areaCode":"' + cityCode + '","deviceLng":"' + locationSeat[0] + '","deviceLat":"' + locationSeat[1] + '","address":"' + address + '","deviceName":"' + deviceName + '","electricityPrice":' + electricityPriceCents + '}');
      wx.request({
        url: app.getHostURL() + '/getData.php',//php上固定地址
        method: 'POST',
        data: {
          'evUrl': '/activation/commitDeviceActivationInfo',
          'evheader': evheader,
          'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceSn":"' + wx.getStorageSync('activatedSN') + '","areaCode":"' + cityCode + '","deviceLng":"' + locationSeat[0] + '","deviceLat":"' + locationSeat[1] + '","address":"' + address + '","deviceName":"' + deviceName + '","electricityPrice":' + electricityPriceCents + '}'
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳    
          console.log(res)    
          if (res.data.Edata[0].code==0){
            //激活成功
            wx.showModal({
              title: '提示',
              content: "激活成功",
              confirmText: "确定",
              showCancel:false,
              success: function (res) {
                wx.hideToast()
              }
            })
          }else{
            var errMsg = res.data.Edata[0].msg;
            wx.showToast({
              title: errMsg,
              icon: 'loading',
              duration: 1500
            })
          }
        },
        fail: function (res) {
          wx.hideToast()
          console.log("获取钱包信息失败")
        }
      })//充电点列表
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
    }
})


