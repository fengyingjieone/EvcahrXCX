//index.js
//获取应用实例
var app = getApp();


Page({
    data: {
        userNickName: wx.getStorageSync('userNickName')
    },
    thisTest: function () {
        console.log("调用测试")
    },
    onLoad: function () {
        this.thisTest();
        wx.showToast({
            title: '加载中..',
            icon: 'loading',
            duration: 10000,
            mask: true
        })
        this.setData({
            userNickName: wx.getStorageSync('userNickName')
        })
    }
})


