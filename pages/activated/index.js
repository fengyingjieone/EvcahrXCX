
Page({
    onShareAppMessage: function () {
        return app.onShareAppMessage();
    },
    toxieyi: function () {
        wx.navigateTo({
            url: '../xieyi/index'
        })
    },
})


