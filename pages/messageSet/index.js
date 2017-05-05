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
            duration: 10000,
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
                wx.hideToast();
                wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间
                console.log(res)
                if(res.data.Edata[0].code==0){
                    console.log("获取成功");
                    halfPriceStatus=res.data.Edata[0].data.HalfPrice;//全局话开关状态
                    that.setData({   
                        halfPriceStatus:res.data.Edata[0].data.HalfPrice//默认开关状态     
                    })
                }                
            },
            fail: function (res) {
                console.log("获取钱包信息失败")
            }
        })//查看当前开关状态
    },
    halfPriceSwitch:function(e){
        console.log("按钮传过来的值=" + e.detail.value);
        var that=this;
        if(!halfPriceStatus)
        {//当前是关闭状态
        wx.showToast({
            title: '开启中..',
            icon: 'loading',
            duration: 10000,
            mask: true
        })
            var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","bizCode": "HalfPrice","flag":1}');
            // 设置开关标识0|1, 0:关闭 1：开启
            wx.request({
                url: app.getHostURL() + '/getData.php',//php上固定地址
                method: 'POST',
                data: {
                    'evUrl': '/usercenter/switchControl',
                    'evheader': evheader,
                    'evdata':'{"accessToken":"' + wx.getStorageSync('accessToken') + '","bizCode": "HalfPrice","flag":1}'
                },
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                    wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间
                    wx.hideToast();
                    if(res.data.Edata[0].code==0){
                        halfPriceStatus=true;
                        that.setData({
                            halfPriceStatus:true//默认开关状态                      
                        })
                    }else{
                        halfPriceStatus=false;
                        that.setData({
                            halfPriceStatus:false//默认开关状态                      
                        })
                        wx.showToast({
                            title: '开启消息推送失败',
                            icon: 'loading',
                            duration: 1000,
                            mask: true
                        })
                    }
                    
                },
                fail: function (res) {
                    wx.hideToast();
                    wx.showToast({
                        title: '开启消息推送失败',
                        icon: 'loading',
                        duration: 1000,
                        mask: true
                    })
                    console.log("开启半价电失败")
                }
            })//查看当前开关状态
        }else if(halfPriceStatus){
            //当前是开启状态
            wx.showToast({
                title: '关闭中..',
                icon: 'loading',
                duration: 10000,
                mask: true
            })
            var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","bizCode":"HalfPrice","flag":0}');
            // 设置开关标识0|1, 0:关闭 1：开启
            wx.request({
                url: app.getHostURL() + '/getData.php',//php上固定地址
                method: 'POST',
                data: {
                    'evUrl': '/usercenter/switchControl',
                    'evheader': evheader,
                    'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","bizCode": "HalfPrice","flag":0}'
                },
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                    wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间
                    wx.hideToast();
                    if(res.data.Edata[0].code==0){
                        halfPriceStatus=false;
                        that.setData({
                            halfPriceStatus:false//默认开关状态                      
                        })
                    }else{
                        halfPriceStatus=true;
                        that.setData({
                            halfPriceStatus:true//默认开关状态                      
                        })
                        wx.showToast({
                            title: '关闭消息推送失败',
                            icon: 'loading',
                            duration: 1000,
                            mask: true
                        })
                    }
                    
                },
                fail: function (res) {
                    wx.hideToast();
                    wx.showToast({
                        title: '关闭消息推送失败',
                        icon: 'loading',
                        duration: 1000,
                        mask: true
                    })
                    console.log("关闭半价电失败")
                }
            })
        }        
    }
})


