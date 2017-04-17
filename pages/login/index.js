//index.js
//获取应用实例
var tel;
var password;
var app = getApp()
Page({
  loginMobile:function(e)
  {
    var value = e.detail.value;
    console.log(value)
    tel=e.detail.value;  
  },
  onShow: function (){
    this.setData({
        defaultTel:tel,
        defaultPwd:password
    })
  },
  loginPW:function(e)
  {
    var value = e.detail.value;
    password=e.detail.value;  
  },
  loginWidthUsernameBtn:function()
  {
      console.log("已有账号登陆参数")
      console.log(tel)
      console.log(password)
      console.log(wx.getStorageSync('openid'))
      wx.request({
          url: 'https://wx.chongdian.club/userNameLoginAndRegister.php',//php上固定地址
          method:'POST',
          data: {
            'evUrl':'/user/login',
            'evdata':'{"appKey":"'+wx.getStorageSync('evcharAppkey')+'","openId":"'+wx.getStorageSync('openid')+'","password":"'+password+'","userName":"'+tel+'"}'
          },  
          header: { 
            'Content-Type': 'application/x-www-form-urlencoded'
          },  
          success: function(res) {
            wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
            console.log("登陆结果")
            console.log(res)
            if(res.data.code==0)
            { 
                //登陆成功后返回主入口重新登陆
                setTimeout(function(){
                  wx.switchTab({
                    url: '../index/index'
                  })
                },1000)
                
            }else
            {
                wx.showToast({
                    title: res.data.msg,
                    icon: 'loading',
                    duration: 2000
                }) 
            }

            console.log((res))
          },
          fail: function(res) {  
            console.log("获取钱包信息失败")    ;
            wx.showToast({
              title: '登陆失败，请重试',
              icon: 'loading',
              duration: 1500
            })    
          }
      })
      
  },
  findPasswordPage:function()
  {
    wx.navigateTo({
      url: '../findpw/index'
    })  
  },
  register:function()
  {
    wx.navigateTo({
      url: '../register/index'
    })  
  },
  loginInputErr:function(){
    wx.showToast({
              title: '正在登陆',
              icon: 'loading',
              duration: 10000
    })
    var that=this;
    that.setData({
        inputStatus:false                      
    })
    setTimeout(function(){
      that.loginWidthUsernameBtn()
    },400)
  }


})


