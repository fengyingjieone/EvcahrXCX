//index.js
//获取应用实例
var app = getApp();
var halfPriceStatus=false;
var checkStatus;
Page({
    data: {
        halfPriceStatus: false
    },
    onLoad: function () {
        wx.showToast({
            title: '加载中..',
            icon: 'loading',
            duration: 1000,
            mask: true
        })
    },
    onShow: function (){
        //查询 当前半价电开关状态
        var that = this;
        var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '"}');
        console.log('{"accessToken":"' + wx.getStorageSync('accessToken') + '"}')
        wx.request({
            url: app.getHostURL() + '/getData.php',//php上固定地址
            method: 'POST',
            data: {
                'evUrl': '/usercenter/queryUserSwitchSetting',
                'evheader': evheader,
                'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '"}'
            },
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
                wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间
                console.log(res)
                that.setData({                    
                })
            },
            fail: function (res) {
                console.log("获取钱包信息失败")
            }
        })//查看当前开关状态
    },
    halfPriceSwitch:function(e){
        console.log("按钮传过来的值=" + e.detail.value)
        if(halfPriceStatus==6)
        {//当前是关闭状态
            var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + ',"bizCode": "HalfPrice","flag":1}');
            // 设置开关标识0|1, 0:关闭 1：开启
            wx.request({
                url: app.getHostURL() + '/getData.php',//php上固定地址
                method: 'POST',
                data: {
                    'evUrl': '/usercenter/switchControl',
                    'evheader': evheader,
                    'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '"}'
                },
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                    wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间
                    console.log(res)
                    that.setData({                    
                    })
                },
                fail: function (res) {
                    console.log("获取钱包信息失败")
                }
            })//查看当前开关状态
        }        
    },
    checkHalfPriceStatus:function(){
        var that=this;
        checkStatus=setInterval(function(){
            var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '"}');
            console.log('{"accessToken":"' + wx.getStorageSync('accessToken') + '"}')
            wx.request({
                url: app.getHostURL() + '/getData.php',//php上固定地址
                method: 'POST',
                data: {
                    'evUrl': '/usercenter/queryUserSwitchSetting',
                    'evheader': evheader,
                    'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '"}'
                },
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                    wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间
                    console.log(res)
                    that.setData({                    
                    })
                },
                fail: function (res) {
                    console.log("获取钱包信息失败")
                }
            })//查看当前开关状态
        })        
    }
})


