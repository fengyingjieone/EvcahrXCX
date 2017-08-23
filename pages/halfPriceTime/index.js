//index.js
//获取应用实例
var defaultDevId;
var app = getApp()

var startTime;
var startSwitch;
var momentSwitch;
var endTime;
var endSwitch;

var isEnableState=1;
Page({
  data: {
    deviceCount: false,//设 默认只有一个设备
    disabledState:true,//按钮状态 是否可以点击 默认不能点击
    openCheckedState:false,//按钮状态 是开还是关   默认关
    closeCheckedState: false,//按钮状态 是开还是关   默认关
    momentCheckedState: false//区间检测
  },
  onLoad: function (e) {
    console.log(e.defaultDevId);
    defaultDevId = e.defaultDevId;    
  },
  onShow: function (e) {
    this.getHalfpriceTime();
    // 使用 wx.createContext 获取绘图上下文 context   
  },
  getHalfpriceTime:function(){
    var that = this;
    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDevId + '"}');
    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/device/getTimingTimeInfo',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDevId + '"}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log("获取半价电结果", res)
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳        
        if (res.data.Edata[0].code == 0) {
          isEnableState = res.data.Edata[0].data.isEnable;
          startTime = res.data.Edata[0].data.startTime;
          startSwitch = res.data.Edata[0].data.startTimeSwitch;
          momentSwitch = res.data.Edata[0].data.momentSwitch;
          endTime = res.data.Edata[0].data.endTime;
          endSwitch = res.data.Edata[0].data.endTimeSwitch;
          that.drawClock(res.data.Edata[0].data.startTime, res.data.Edata[0].data.endTime);
          that.setData({
            startTime: res.data.Edata[0].data.startTime,//开始时间
            endTime: res.data.Edata[0].data.endTime,//结束时间
            disabledState: false,//按钮是否可以点
            openCheckedState: res.data.Edata[0].data.startTimeSwitch,//开关状态   开启还是关闭
            closeCheckedState: res.data.Edata[0].data.endTimeSwitch,//开关状态   开启还是关闭
            momentCheckedState: res.data.Edata[0].data.momentSwitch
          })
        } else {
          editLock = res.data.Edata[0].data.isEnable;
          wx.showToast({
            title: res.data.Edata[0].msg,
            icon: 'loading',
            duration: 1500,
            mask: true
          })
        }
      },
      fail: function (res) {
        console.log("获取钱包信息失败")
      }
    })
  },
  setHalfpriceTime:function(e){
    console.log(e.currentTarget.id)
    console.log(e.detail.value);
    console.log(isEnableState)
    var btnName = e.currentTarget.id;
    var btnState = e.detail.value;
    if (isEnableState == 0) {
      wx.showToast({
        title:"请在个人中心打开定时开关",
        icon: 'loading',
        duration: 1500,
        mask: true
      })
      if (btnState){
        if (btnName == "open") {
          this.setData({         
            openCheckedState: false//开关状态   开启还是关闭          
          })
        } else if (btnName == "close") {
          this.setData({  
            closeCheckedState:false//开关状态   开启还是关闭
          })
        } else if (btnName == "moment") {
          this.setData({
            momentCheckedState:false
          })
        }
      }else{
        if (btnName == "open") {
          this.setData({
              openCheckedState: true//开关状态   开启还是关闭         
          })
        } else if (btnName == "close") {
          this.setData({
           closeCheckedState: true//开关状态   开启还是关闭
          })
        } else if (btnName == "moment") {
          this.setData({
            momentCheckedState: true
          })
        }
      }
      return;
    }
    if (btnName=="open"){
      var startSwitchInside = btnState;
      var endSwitchInside = endSwitch;
      var momentSwitchInside = momentSwitch;
    } else if (btnName == "close"){
      var startSwitchInside = startSwitch;
      var endSwitchInside = btnState;
      var momentSwitchInside = momentSwitch;
    } else if (btnName == "moment"){
      var startSwitchInside = startSwitch;
      var endSwitchInside = endSwitch;
      var momentSwitchInside = btnState;
    }
    var that = this;
    console.log('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":' + defaultDevId + ',"startTime":"' + startTime + '","startSwitch":"' + startSwitchInside + '","momentSwitch":' + momentSwitchInside + ',"endTime":"' + endTime + '","endSwitch":' + endSwitchInside + '}');

    var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":' + defaultDevId + ',"startTime":"' + startTime + '","startSwitch":' + startSwitchInside + ',"momentSwitch":' + momentSwitchInside + ',"endTime":"' + endTime + '","endSwitch":' + endSwitchInside+'}');
    wx.request({
      url: app.getHostURL() + '/getData.php',//php上固定地址
      method: 'POST',
      data: {
        'evUrl': '/usercenter/setTimingTime',
        'evheader': evheader,
        'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":' + defaultDevId + ',"startTime":"' + startTime + '","startSwitch":' + startSwitchInside + ',"momentSwitch":' + momentSwitchInside + ',"endTime":"' + endTime + '","endSwitch":' + endSwitchInside + '}'
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log("设置半价电结果")
        console.log(res)
        wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
        if (res.data.Edata[0].code == 0) {
          that.getHalfpriceTime();
          //startSwitch = startSwitchInside;
          //endSwitch = endSwitchInside;
          //momentSwitch = momentSwitchInside;
          wx.showToast({
            title: "设置成功",
            icon: 'loading',
            duration: 1500,
            mask: true
          })
        } else {
          wx.showToast({
            title: res.data.Edata[0].msg,
            icon: 'loading',
            duration: 1500,
            mask: true
          })
        }
      },
      fail: function (res) {
        that.getHalfpriceTime();
        console.log("获取钱包信息失败")
      }
    })
  },
  onShareAppMessage: function () {
    return app.onShareAppMessage();
  },
  toTimeEdit: function () {
    if (isEnableState == 0){
      wx.showToast({
        title: "请在个人中心打开定时开关",
        icon: 'loading',
        duration: 1500,
        mask: true
      })
      return;
    }
    wx.navigateTo({
      url: '../halfPriceTime/timeEdit/index?timeCode=startTime&defaultDevId=' + defaultDevId
    })
  },
  toTimeEditEnd: function () {
    if (isEnableState == 0) {
      wx.showToast({
        title: "请在个人中心打开定时开关",
        icon: 'loading',
        duration: 1500,
        mask: true
      })
      return;
    }
    wx.navigateTo({
      url: '../halfPriceTime/timeEdit/index?timeCode=endTime&defaultDevId=' + defaultDevId
    })
  },
  drawClock:function(startTime,endTime){     
    var minutesSectionStart = Number(startTime.split(":")[0] * 60) + Number(startTime.split(":")[1]);
    var minutesSectionEnd = Number(endTime.split(":")[0] * 60) + Number(endTime.split(":")[1]);
    console.log("开始时间", minutesSectionStart);
    console.log("结束时间", minutesSectionEnd);
    var clockRadius = 60;//半径
    var context = wx.createCanvasContext('clock');
    //画时针
    setInterval(function () {
      context.translate(177 / 2, 177 / 2);//对当前坐标系的原点(0, 0)进行变换，默认的坐标系原点为页面左上角。
      var date = new Date();
      var hours = date.getHours();   //获取小时数
      var minutes = date.getMinutes(); //获取分钟数
      var seconds = date.getSeconds();//获取秒数
      hours = hours > 12 ? hours - 12 : hours;
      var hour = hours + minutes / 60;
      var minute = minutes + seconds / 60;
      //得到时间 
      context.save();
      var theta = (hour - 3) * 2 * Math.PI / 12;
      context.rotate(theta);
      context.beginPath();
      context.moveTo(-10, -2);
      context.lineTo(-10, 2);
      context.lineTo(clockRadius * 0.5, 1);
      context.lineTo(clockRadius * 0.5, -1);
      //context.setFillStyle('red');
      context.closePath()
      context.fill();
      context.restore();

      context.save();
      var theta = (minute - 15) * 2 * Math.PI / 60;
      context.rotate(theta);
      context.beginPath();
      context.moveTo(-10, -2);
      context.lineTo(-10, 2);
      context.lineTo(clockRadius * 0.8, 1);
      context.lineTo(clockRadius * 0.8, -1);
      //context.setFillStyle('red');
      context.closePath()
      context.fill();
      context.restore();

      // draw second 画出秒刻度
      context.save();
      var theta = (seconds - 15) * 2 * Math.PI / 60;
      context.rotate(theta);
      context.beginPath();
      context.moveTo(-10, -2);
      context.lineTo(-10, 2);
      context.lineTo(clockRadius * 0.9, 1);
      context.lineTo(clockRadius * 0.9, -1);
      context.setFillStyle('red');
      context.closePath()
      context.fill();
      context.restore();

      context.restore();






      context.beginPath()
      context.setStrokeStyle("#ff0000");//笔触颜色
      context.setLineWidth(6);//笔触宽度
      context.moveTo(0, 0);//把路径移动到画布中的指定点，不创建线条。
      context.arc(0, 0, 1, 0, 2 * Math.PI, true);//创建一个圆可以用 arc() 方法指定其实弧度为0，终止弧度为 2 * Math.PI。
      context.closePath()
      context.stroke();//画出当前路径的边框
      context.draw()
    }, 1000)
  }
})


