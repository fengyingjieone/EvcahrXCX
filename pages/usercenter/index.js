//index.js
//获取应用实例
var app = getApp();
var powerState;//默认桩的充电状态
var defaultSn;//默认桩的SN
var defaultDeviceid;//默认桩的SN
var defaultGonglv;//默认功率
var halfTime;//默认桩半价电状态
var shareTime;//默认桩共享状态
var setIntervalClock;//定时任务
var setIntervalClockGLHeight;//确定功率调节的定时任务
var setIntervalClockGLLow;//确定功率调节的定时任务

var errMsg;//错误信息

Page({
    data: {
        userNickName: wx.getStorageSync('userNickName'),
        owner: false,//桩主的四个按钮  默认false
        incomeFlag: false,//收益查看   默认false
        switchPower: true,
        capacityState: false,
        capacityDisabled: true
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
    },
    onShow: function () {


        console.log("页面展示low")
        var that = this;
        var nowCapacity;//设备功率 0低功率  1高功率

        //调用应用实例的方法获取全局数据
        app.getUserInfo(function (userInfo) {
            //更新数据
            that.setData({
                userInfo: userInfo
            })
        })
        var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '"}');
        console.log(evheader)

        wx.request({
            url: app.getHostURL() + '/getData.php',//php上固定地址
            method: 'POST',
            data: {
                'evUrl': '/usercenter/getUserCenterInfo',
                'evheader': evheader,
                'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '"}'
            },
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
                wx.hideToast();
                wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                console.log("个人中心初始数据")
                console.log(res)
                that.setData({
                    incomeFlag: res.data.Edata[0].data.ownerFlag
                })
                if (res.data.Edata[0].data.ownerFlag == true) {//这里判定是桩主，可以显示 开关、可调功率、半价电、共享 按钮
                    //保存获取到的各个状态
                    defaultSn = res.data.Edata[0].data.defaultDevice.sn;//默认桩的sn
                    defaultGonglv = res.data.Edata[0].data.defaultDevice.capacitySwitchStatusMap.capacityHighLow
                    defaultDeviceid = res.data.Edata[0].data.defaultDevice.deviceId;//默认桩的设备id
                    powerState = res.data.Edata[0].data.defaultDevice.chargingFlag;//默认桩的充电状态
                    halfTime = res.data.Edata[0].data.defaultDevice.halfPriceFlag;//默认桩半价电状态  true false
                    shareTime = res.data.Edata[0].data.defaultDevice.shareTimeFlag;// 默认桩共享状态  true  false
                    console.log("XXXXXXXXXXXXXXXXXXX=" + halfTime)
                    that.setData({
                        owner: true,
                        VhalfTime: halfTime,//半价电  true false
                        VshareTime: shareTime//共享  true  false

                    })
                    //这里判定是否在线 按钮状态
                    if (res.data.Edata[0].data.defaultDevice.onlineFalg == true) {

                        console.log('在线');
                        nowCapacity = res.data.Edata[0].data.defaultDevice.capacitySwitchStatusMap.capacityHighLow;// 0低功率  1高功率
                        var gonglvTxt;
                        nowCapacity == 0 ? gonglvTxt = "1.5 kW" : gonglvTxt = "3.5 kW"
                        that.setData({
                            disonline: false,//在线，开关和功率按钮可用
                            powerState: res.data.Edata[0].data.defaultDevice.chargingFlag,//默认桩充电状态
                            capacityStatus: res.data.Edata[0].data.defaultDevice.capacitySwitchStatusMap.capacityHighLow//功率大1小0 
                        })
                        console.log("powerSwitchStatusMap")
                        console.log(res.data.Edata[0].data.switchFalg)
                        if (res.data.Edata[0].data.defaultDevice.switchFalg) {
                            that.setData({
                                disonlineTxt: "",
                                disonlineTxtB: gonglvTxt
                            })
                        } else {
                            that.setData({
                                disonlineTxt: "有订单",
                                disonlineTxtB: "有订单",
                                disonline: true
                            })
                        }
                    } else {
                        console.log('不在线')
                        that.setData({
                            disonline: true,//如果不在线，开关和功率按钮不能用
                            powerState: false,
                            capacityStatus: 0,
                            disonlineTxt: "不在线",
                            disonlineTxtB: "不在线"
                        })
                    }
                    //半价电 共享  按钮状态

                    wx.setStorageSync('defaultDeviceId', res.data.Edata[0].data.defaultDevice.deviceId);//缓存桩主默认桩
                    wx.setStorageSync('defaultDeviceSn', res.data.Edata[0].data.defaultDevice.sn);//缓存桩主默认桩sn


                } else {
                    that.setData({
                        owner: false
                    })
                }//桩主结束
            },
            fail: function (res) {
                console.log("登录失败")
            }
        })
    },
    toWallet: function () {
        wx.navigateTo({
            url: '../wallet/index'
        })
    },
    toIncome: function () {
        wx.navigateTo({
            url: '../income/index'
        })
    },
    toHistoryorder: function () {
        wx.navigateTo({
            url: '../historyOrder/index'
        })
    },
    toSet: function () {
        wx.navigateTo({
            url: '../set/index'
        })
    },
    powerOn_Off: function (e) {
        var that = this;
        that.setData({
            disonline: true//默认桩充电状态 让按钮不可点击
        })
        console.log("按钮传过来的值=" + e.detail.value)
        if (!powerState)//如果充电桩是未开启状态，那么去开启  XXXXX下面是开启XXXXX下面是开启XXXXX下面是开启XXXXX下面是开启XXX
        {
            wx.showToast({
                title: '正在开启',
                icon: 'loading',
                duration: 10000,
                mask: true
            })
            var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","appId":1002,"deviceSn":"' + defaultSn + '","openType":1}');
            wx.request({
                url: app.getHostURL() + '/getData.php',//php上固定地址
                method: 'POST',
                data: {
                    'evUrl': '/order/makeChargeOrder',
                    'evheader': evheader,
                    'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","appId":1002,"deviceSn":"' + defaultSn + '","openType":1}'
                },
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                    wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                    console.log("开启充电返回")
                    console.log(res)
                    if (res.data.Edata[0].code != 0) {
                        wx.showToast({
                            title: res.data.Edata[0].msg,
                            icon: 'loading',
                            duration: 1500,
                            mask: true
                        })
                        that.setData({
                            powerState: false,//默认桩充电状态 关闭
                            disonline: false//让按钮可点击
                        })
                        setTimeout(function () { wx.hideToast() }, 1500)
                        return;
                    }//开启失败
                    // 下面是开启成功  去检查开启结果
                    setTimeout(function () {
                        console.log("第一次")

                        var evheader = app.EvcharHeader('{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","deviceSn":"' + defaultSn + '"}');
                        wx.request({
                            url: app.getHostURL() + '/getData.php',//php上固定地址
                            method: 'POST',
                            data: {
                                'evUrl': '/device/checkIsCharging',
                                'evheader': evheader,
                                'evdata': '{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","deviceSn":"' + defaultSn + '"}'
                            },
                            header: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            success: function (res) {
                                if (res.data.Edata[0].code == 0 && res.data.Edata[0].data) {
                                    //设备在充电
                                    powerState = true;
                                    that.setData({
                                        powerState: true,//默认桩充电状态 开启
                                        disonline: false//让按钮可点击
                                    })
                                    wx.hideToast();
                                    return;//若成功，倒计时到此终止
                                } else {
                                    //设备没有在充电
                                    setTimeout(function () {
                                        console.log("第二次")
                                        var evheader = app.EvcharHeader('{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","deviceSn":"' + defaultSn + '"}');
                                        wx.request({
                                            url: app.getHostURL() + '/getData.php',//php上固定地址
                                            method: 'POST',
                                            data: {
                                                'evUrl': '/device/checkIsCharging',
                                                'evheader': evheader,
                                                'evdata': '{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","deviceSn":"' + defaultSn + '"}'
                                            },
                                            header: {
                                                'Content-Type': 'application/x-www-form-urlencoded'
                                            },
                                            success: function (res) {
                                                if (res.data.Edata[0].code == 0 && res.data.Edata[0].data) {
                                                    //设备在充电
                                                    powerState = true;
                                                    that.setData({
                                                        powerState: true,//默认桩充电状态 开启
                                                        disonline: false//让按钮可点击
                                                    })
                                                    wx.hideToast();
                                                    return;//若成功，倒计时到此终止
                                                } else {
                                                    //设备没有在充电
                                                    setTimeout(function () {
                                                        console.log("第三次")
                                                        var evheader = app.EvcharHeader('{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","deviceSn":"' + defaultSn + '"}');
                                                        wx.request({
                                                            url: app.getHostURL() + '/getData.php',//php上固定地址
                                                            method: 'POST',
                                                            data: {
                                                                'evUrl': '/device/checkIsCharging',
                                                                'evheader': evheader,
                                                                'evdata': '{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","deviceSn":"' + defaultSn + '"}'
                                                            },
                                                            header: {
                                                                'Content-Type': 'application/x-www-form-urlencoded'
                                                            },
                                                            success: function (res) {
                                                                if (res.data.Edata[0].code == 0 && res.data.Edata[0].data) {
                                                                    //设备在充电
                                                                    powerState = true;
                                                                    that.setData({
                                                                        powerState: true,//默认桩充电状态 开启
                                                                        disonline: false//让按钮可点击
                                                                    })
                                                                    wx.hideToast();
                                                                    return;//若成功，倒计时到此终止
                                                                } else {
                                                                    //设备没有在充电
                                                                    wx.showToast({
                                                                        title: '开启失败',
                                                                        icon: 'loading',
                                                                        duration: 1000,
                                                                        mask: true
                                                                    })
                                                                    powerState = true;
                                                                    that.setData({
                                                                        powerState: false,//默认桩充电状态 关闭
                                                                        disonline: false//让按钮可点击
                                                                    })
                                                                    wx.hideToast();
                                                                    return;//超出检查次数，倒计时到此终止
                                                                }
                                                            },
                                                            fail: function (res) {
                                                                wx.showToast({
                                                                    title: '开启失败',
                                                                    icon: 'loading',
                                                                    duration: 1000,
                                                                    mask: true
                                                                })
                                                            }
                                                        })
                                                    }, 2000)
                                                }
                                            },
                                            fail: function (res) {
                                                wx.showToast({
                                                    title: '开启失败',
                                                    icon: 'loading',
                                                    duration: 1000,
                                                    mask: true
                                                })
                                            }
                                        })
                                    }, 2000)
                                }
                            },
                            fail: function (res) {
                                wx.showToast({
                                    title: '开启失败',
                                    icon: 'loading',
                                    duration: 1000,
                                    mask: true
                                })
                            }
                        })
                    }, 2000)
                },
                fail: function (res) {
                    console.log("开启指令发送失败")
                    wx.showToast({
                        title: "开启失败",
                        icon: 'loading',
                        duration: 1500,
                        mask: true
                    })
                    that.setData({
                        powerState: false,//默认桩充电状态 关闭
                        disonline: false//让按钮可点击
                    })
                    wx.hideToast();
                }
            })
        } else//下面是关闭XXXX下面是关闭XXXX下面是关闭XXXX下面是关闭XXXX下面是关闭XXXX下面是关闭XXXX下面是关闭XXXX下面是关闭XXXX
        {
            wx.showToast({
                title: '正在关闭',
                icon: 'loading',
                duration: 10000,
                mask: true
            })
            console.log("设备id=" + defaultDeviceid)
            var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDeviceid + '"}');
            console.log(evheader)
            wx.request({
                url: app.getHostURL() + '/getData.php',//php上固定地址
                method: 'POST',
                data: {
                    'evUrl': '/device/operateOff',
                    'evheader': evheader,
                    'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDeviceid + '"}'
                },
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                    wx.setStorageSync('timestamp', res.data.timestamp);//缓存时间戳
                    console.log("关闭充电返回")
                    console.log(res)
                    if (res.data.Edata[0].code != 0) {
                        wx.showToast({
                            title: res.data.Edata[0].msg,
                            icon: 'loading',
                            duration: 1500,
                            mask: true
                        })
                        that.setData({
                            powerState: true,//关闭充电失败 默认桩充电状态设置为开
                            disonline: false//让按钮可点击
                        })
                        setTimeout(function () { wx.hideToast() }, 1500)
                        return;
                    }//关闭充电指令发送失败
                    //下面是检查充电状态
                    setTimeout(function () {
                        console.log("第a1次")
                        var evheader = app.EvcharHeader('{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","deviceSn":"' + defaultSn + '"}');
                        wx.request({
                            url: app.getHostURL() + '/getData.php',//php上固定地址
                            method: 'POST',
                            data: {
                                'evUrl': '/device/checkIsCharging',
                                'evheader': evheader,
                                'evdata': '{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","deviceSn":"' + defaultSn + '"}'
                            },
                            header: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            success: function (res) {
                                if (res.data.Edata[0].code == 0 && !res.data.Edata[0].data) {
                                    //设备不在充电
                                    powerState = false;
                                    that.setData({
                                        powerState: false,//默认桩充电状态 关闭
                                        disonline: false//让按钮可点击  可点击
                                    })
                                    wx.hideToast();
                                    return;//若成功，倒计时到此终止
                                } else {
                                    setTimeout(function () {
                                        console.log("第a2次")
                                        var evheader = app.EvcharHeader('{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","deviceSn":"' + defaultSn + '"}');
                                        wx.request({
                                            url: app.getHostURL() + '/getData.php',//php上固定地址
                                            method: 'POST',
                                            data: {
                                                'evUrl': '/device/checkIsCharging',
                                                'evheader': evheader,
                                                'evdata': '{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","deviceSn":"' + defaultSn + '"}'
                                            },
                                            header: {
                                                'Content-Type': 'application/x-www-form-urlencoded'
                                            },
                                            success: function (res) {
                                                if (res.data.Edata[0].code == 0 && !res.data.Edata[0].data) {
                                                    //设备不在充电
                                                    powerState = false;
                                                    that.setData({
                                                        powerState: false,//默认桩充电状态 关闭
                                                        disonline: false//让按钮可点击  可点击
                                                    })
                                                    wx.hideToast();
                                                    return;//若成功，倒计时到此终止
                                                } else {
                                                    setTimeout(function () {
                                                        console.log("第a3次")
                                                        var evheader = app.EvcharHeader('{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","deviceSn":"' + defaultSn + '"}');
                                                        wx.request({
                                                            url: app.getHostURL() + '/getData.php',//php上固定地址
                                                            method: 'POST',
                                                            data: {
                                                                'evUrl': '/device/checkIsCharging',
                                                                'evheader': evheader,
                                                                'evdata': '{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","deviceSn":"' + defaultSn + '"}'
                                                            },
                                                            header: {
                                                                'Content-Type': 'application/x-www-form-urlencoded'
                                                            },
                                                            success: function (res) {
                                                                if (res.data.Edata[0].code == 0 && !res.data.Edata[0].data) {
                                                                    //设备不在充电
                                                                    powerState = false;
                                                                    that.setData({
                                                                        powerState: false,//默认桩充电状态 关闭
                                                                        disonline: false//让按钮可点击  可点击
                                                                    })
                                                                    wx.hideToast();
                                                                    return;//若成功，倒计时到此终止
                                                                } else {
                                                                    //设备关闭失败
                                                                    powerState = true;
                                                                    that.setData({
                                                                        powerState: true,//默认桩充电状态 开启
                                                                        disonline: false//让按钮可点击  可点击
                                                                    })
                                                                    wx.hideToast();
                                                                    return;//超出检查次数 倒计时到此终止
                                                                }
                                                            },
                                                            fail: function (res) {
                                                                wx.showToast({
                                                                    title: '关闭失败',
                                                                    icon: 'loading',
                                                                    duration: 1000,
                                                                    mask: true
                                                                })
                                                            }
                                                        })
                                                    }, 2000)
                                                }
                                            },
                                            fail: function (res) {
                                                wx.showToast({
                                                    title: '关闭失败',
                                                    icon: 'loading',
                                                    duration: 1000,
                                                    mask: true
                                                })
                                            }
                                        })
                                    }, 2000)
                                }
                            },
                            fail: function (res) {
                                wx.showToast({
                                    title: '关闭失败',
                                    icon: 'loading',
                                    duration: 1000,
                                    mask: true
                                })
                            }
                        })
                    }, 2000)
                },
                fail: function (res) {
                    console.log("登录失败")
                    wx.showToast({
                        title: '关闭失败',
                        icon: 'loading',
                        duration: 1000,
                    })
                }
            })
        }//开启-关闭  结束XXXXXX开启-关闭  结束XXXXXX开启-关闭  结束XXXXXX开启-关闭  结束XXXXXX

    },
    gongLvOn_Off: function (e) {
        var that = this;
        that.setData({
            disonline: true//让按钮不可点击
        })
        console.log("当前充电桩状态=" + powerState);
        console.log("按钮传过来的值=" + e.detail.value)
        console.log("默认桩的sn=" + defaultSn)
        console.log("默认桩的功率=" + defaultGonglv)
        wx.showToast({
            title: "切换功率",
            icon: 'loading',
            duration: 15000,
            mask: true
        })
        if (defaultGonglv == 0)//当前是低功率  下面切换高功率
        {
            var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDeviceid + '","capacity":2}');
            wx.request({
                url: app.getHostURL() + '/getData.php',//php上固定地址
                method: 'POST',
                data: {
                    'evUrl': '/device/capacity',
                    'evheader': evheader,
                    'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDeviceid + '","capacity":2}'
                },
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                    console.log("切换到高功率结果")
                    console.log(res)
                    if (res.data.Edata[0].code != 0)//切换出错，直接结束掉
                    {
                        wx.showToast({
                            title: res.data.Edata[0].msg,
                            icon: 'loading',
                            duration: 1500,
                            mask: true
                        })
                        that.setData({
                            capacityStatus: 0,//功率大1小0
                            disonlineTxtB: "1.5 kW",
                            disonline: false//让按钮可点击
                        })
                        return;
                    }



                    var times = 0;
                    setIntervalClockGLHeight = setInterval(function () {
                        var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceSn":"' + defaultSn + '"}');
                        wx.request({
                            url: app.getHostURL() + '/getData.php',//php上固定地址
                            method: 'POST',
                            data: {
                                'evUrl': '/device/getDeviceCapacity',
                                'evheader': evheader,
                                'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceSn":"' + defaultSn + '"}'
                            },
                            header: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            success: function (res) {
                                console.log("功率切换检查结果")
                                console.log(res)
                                if (res.data.Edata[0].code == 0 && res.data.Edata[0].data == 2)//切换高功率成功
                                {
                                    console.log("切换高功率成功")
                                    defaultGonglv = 1;//电桩功率  全局
                                    that.setData({
                                        capacityStatus: 1,//电桩功率 视图改变
                                        disonlineTxtB: "3.5 kW",
                                        disonline: false//让按钮可点击
                                    })
                                    clearInterval(setIntervalClockGLHeight);
                                    wx.hideToast();

                                }
                                if (times == 3) {
                                    console.log(res.data.Edata[0].msg)
                                    defaultGonglv = 0;//电桩功率  全局  //失败  改回原来
                                    that.setData({
                                        capacityStatus: 0//电桩功率 视图改变
                                    })

                                    clearInterval(setIntervalClockGLHeight);
                                    wx.showToast({
                                        title: "切换功率失败",
                                        icon: 'loading',
                                        duration: 1500,
                                        mask: true
                                    })
                                    that.setData({
                                        capacityStatus: 0,//电桩功率 视图改变
                                        disonlineTxtB: "1.5 kW",
                                        disonline: false//让按钮可点击
                                    })
                                }
                                console.log("计数" + times)
                                times = times + 1
                                return;
                            },
                            fail: function (res) {
                                console.log("有错误");
                                clearInterval(setIntervalClockGLHeight);
                                that.setData({
                                    capacityStatus: 0,//电桩功率 视图改变
                                    disonlineTxtB: "1.5 kW",
                                    disonline: false//让按钮可点击
                                })//恢复原貌    
                            }
                        })


                    }, 2000)


                },
                fail: function (res) {
                    console.log("有错误")
                }
            })
        } else if (defaultGonglv == 1)//当前是高功率  下面切换到低功率
        {
            var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDeviceid + '","capacity":1}');
            wx.request({
                url: app.getHostURL() + '/getData.php',//php上固定地址
                method: 'POST',
                data: {
                    'evUrl': '/device/capacity',
                    'evheader': evheader,
                    'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDeviceid + '","capacity":1}'
                },
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                    console.log("切换到低功率结果")
                    console.log(res)
                    if (res.data.Edata[0].code != 0)//切换出错，直接结束掉
                    {
                        wx.showToast({
                            title: res.data.Edata[0].msg,
                            icon: 'loading',
                            duration: 1500,
                            mask: true
                        })
                        that.setData({
                            capacityStatus: 1,//功率大1小0
                            disonlineTxtB: "3.5 kW",
                            disonline: false//让按钮可点击
                        })
                        return;
                    }


                    var times = 0;
                    setIntervalClockGLLow = setInterval(function () {
                        var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceSn":"' + defaultSn + '"}');
                        wx.request({
                            url: app.getHostURL() + '/getData.php',//php上固定地址
                            method: 'POST',
                            data: {
                                'evUrl': '/device/getDeviceCapacity',
                                'evheader': evheader,
                                'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceSn":"' + defaultSn + '"}'
                            },
                            header: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            success: function (res) {
                                console.log("功率切换检查结果")
                                console.log(res)
                                if (res.data.Edata[0].code == 0 && res.data.Edata[0].data == 1)//切换低功率成功//0 不在线 1 低功率 2 高功率  
                                {
                                    clearInterval(setIntervalClockGLLow);
                                    console.log("切换低功率成功")
                                    defaultGonglv = 0;//电桩功率  全局
                                    that.setData({
                                        capacityStatus: 0,//电桩功率 视图改变
                                        disonlineTxtB: "1.5 kW",
                                        disonline: false//让按钮可点击
                                    })
                                    wx.hideToast();

                                }
                                if (times == 3) {
                                    console.log(res.data.Edata[0].msg)
                                    defaultGonglv = 1;//电桩功率  全局  //失败  改回原来
                                    that.setData({
                                        capacityStatus: 1//电桩功率 视图改变
                                    })

                                    clearInterval(setIntervalClockGLLow);
                                    wx.showToast({
                                        title: "切换功率失败",
                                        icon: 'loading',
                                        duration: 1500,
                                        mask: true
                                    })
                                    that.setData({
                                        capacityStatus: 0,//电桩功率 视图改变
                                        disonlineTxtB: "3.5 kW",
                                        disonline: false//让按钮可点击
                                    })
                                }
                                console.log("计数" + times)
                                times = times + 1
                                return;
                            },
                            fail: function (res) {
                                console.log("有错误")
                            }
                        })


                    }, 2000)
                },
                fail: function (res) {
                    console.log("有错误")
                }
            })
        }
    },
    halfP: function (e) {
        console.log(halfTime)
        var that = this;
        console.log("当前充电桩状态=" + powerState);
        console.log("按钮传过来的值=" + e.detail.value)
        console.log("默认桩的sn=" + defaultSn)
        console.log("默认桩的功率=" + defaultGonglv)
        that.setData({
            disonlineB: true//让按钮不可点击
        })

        if (halfTime)//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX当前半价电是开启状态  下面去关闭
        {
            wx.showToast({
              title: "关闭定时开关",
                icon: 'loading',
                duration: 10000,
                mask: true
            })
            var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDeviceid + '"}');
            wx.request({
                url: app.getHostURL() + '/getData.php',//php上固定地址
                method: 'POST',
                data: {
                  'evUrl': '/device/closeTimingTime',
                    'evheader': evheader,
                    'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDeviceid + '"}'
                },
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                    console.log("关闭定时开关")
                    console.log(res)
                    if (res.data.Edata[0].code == 0) {
                        halfTime = false;
                        that.setData({
                            VhalfTime: false,//半价电  true false
                            disonlineB: false//让按钮可点击
                        })
                        wx.hideToast();
                    } else {
                      wx.showToast({
                        title: res.data.Edata[0].msg,
                        icon: 'loading',
                        duration: 1000,
                        mask: true
                      })
                        halfTime = true;
                        that.setData({
                            VhalfTime: true,//半价电  true false
                            disonlineB: false//让按钮可点击
                        })
                    }
                },
                fail: function (res) {
                  wx.showToast({
                    title: "关闭定时开关失败",
                    icon: 'loading',
                    duration: 1000,
                    mask: true
                  })
                    that.setData({
                        VhalfTime: true,//半价电  true false
                        disonlineB: false//让按钮可点击
                    })   //恢复原貌   
                }
            })
        } else if (!halfTime) {
            wx.showToast({
                title: "开启定时开关",
                icon: 'loading',
                duration: 10000,
                mask: true
            })
            var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDeviceid + '"}');
            wx.request({
                url: app.getHostURL() + '/getData.php',//php上固定地址
                method: 'POST',
                data: {
                  'evUrl': '/device/openTimingTime',
                    'evheader': evheader,
                    'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDeviceid + '"}'
                },
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                    console.log("开启定时开关")
                    console.log(res)
                    if (res.data.Edata[0].code == 0) {
                        halfTime = true;
                        that.setData({
                            VhalfTime: true,//半价电  true false
                            disonlineB: false//让按钮可点击
                        })
                        wx.hideToast();
                    } else {
                        wx.showToast({
                          title: res.data.Edata[0].msg,
                            icon: 'loading',
                            duration: 1000,
                            mask: true
                        })
                        halfTime = false;
                        that.setData({
                            VhalfTime: false,//半价电  true false
                            disonlineB: false//让按钮可点击
                        })
                    }
                },
                fail: function (res) {
                  wx.showToast({
                    title: "开启定时开关电失败",
                    icon: 'loading',
                    duration: 1000,
                    mask: true
                  })
                    that.setData({
                        VhalfTime: false,//半价电  true false
                        disonlineB: false//让按钮可点击
                    })//恢复原貌      
                }
            })
        }
    },
    shareT: function (e) {
        console.log(shareTime)
        var that = this;
        console.log("当前充电桩状态=" + powerState);
        console.log("按钮传过来的值=" + e.detail.value)
        console.log("默认桩的sn=" + defaultSn)
        console.log("默认桩的功率=" + defaultGonglv)
        that.setData({
            disonlineB: true//让按钮不可点击
        })

        if (shareTime)//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX当前共享是开启状态  下面去关闭
        {
            wx.showToast({
                title: "关闭共享",
                icon: 'loading',
                duration: 10000,
                mask: true
            })
            var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDeviceid + '"}');
            wx.request({
                url: app.getHostURL() + '/getData.php',//php上固定地址
                method: 'POST',
                data: {
                  'evUrl': '/device/closeShareTime',
                    'evheader': evheader,
                    'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDeviceid + '"}'
                },
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                    console.log("关闭共享")
                    console.log(res)
                    if (res.data.Edata[0].code == 0) {
                        shareTime = false;
                        that.setData({
                            VshareTime: false,//半价电  true false
                            disonlineB: false//让按钮可点击
                        })
                        wx.hideToast();

                    } else {
                      wx.showToast({
                        title: "关闭共享失败",
                        icon: 'loading',
                        duration: 10000,
                        mask: true
                      })
                        shareTime = true;
                        that.setData({
                            VshareTime: true,//半价电  true false
                            disonlineB: false//让按钮可点击
                        })
                    }
                },
                fail: function (res) {
                  wx.showToast({
                    title: "关闭共享失败",
                    icon: 'loading',
                    duration: 10000,
                    mask: true
                  })
                    that.setData({
                        VshareTime: true,//半价电  true false
                        disonlineB: false//让按钮可点击
                    })   //恢复原貌   
                }
            })
        } else if (!shareTime) {
            wx.showToast({
                title: "开启共享",
                icon: 'loading',
                duration: 10000,
                mask: true
            })
            var evheader = app.EvcharHeader('{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDeviceid + '"}');
            wx.request({
                url: app.getHostURL() + '/getData.php',//php上固定地址
                method: 'POST',
                data: {
                  'evUrl': '/device/openShareTime',
                    'evheader': evheader,
                    'evdata': '{"accessToken":"' + wx.getStorageSync('accessToken') + '","deviceId":"' + defaultDeviceid + '"}'
                },
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                    console.log("开启共享")
                    if (res.data.Edata[0].code == 0) {
                        shareTime = true;
                        that.setData({
                            VshareTime: true,//半价电  true false
                            disonlineB: false//让按钮可点击
                        })
                        wx.hideToast();
                    } else {
                        wx.showToast({
                            title: res.data.Edata[0].msg,
                            icon: 'loading',
                            duration: 1000,
                            mask: true
                        })
                        shareTime = false;
                        that.setData({
                            VshareTime: false,//半价电  true false
                            disonlineB: false//让按钮可点击
                        })
                    }
                },
                fail: function (res) {
                  wx.showToast({
                    title: "开启共享失败",
                    icon: 'loading',
                    duration: 10000,
                    mask: true
                  })
                    that.setData({
                        VshareTime: false,//半价电  true false
                        disonlineB: false//让按钮可点击
                    })
                }
            })
        }

    },
    onShareAppMessage: function () {
        return app.onShareAppMessage();
    },
    checkIsChargingReturn: function () {
        var evheader = app.EvcharHeader('{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","deviceSn":"' + defaultSn + '"}');
        wx.request({
            url: app.getHostURL() + '/getData.php',//php上固定地址
            method: 'POST',
            data: {
                'evUrl': '/device/checkIsCharging',
                'evheader': evheader,
                'evdata': '{"appKey":"' + wx.getStorageSync('evcharAppkey') + '","deviceSn":"' + defaultSn + '"}'
            },
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
                if (res.data.Edata[0].code == 0 && res.data.Edata[0].data) {
                    //设备在充电
                } else {
                    //设备没有在充电
                }
            },
            fail: function (res) {
            }
        })
    },



})


