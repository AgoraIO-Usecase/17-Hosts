# Large Group Video Chat

*Read this in other languages: [English](README.md)*

这个开源示例项目演示了如何快速集成Agora视频SDK实现多人视频连麦（17人）。

在这个示例项目中包含了以下功能：

- 加入通话和离开通话；
- 主播和观众模式切换；
- 静音和解除静音；
- 切换摄像头；
- 选择分辨率、码率和帧率；
- 包括本地用户在内，一共17人；

本开源项目使用 **C++** 语言

## 运行环境
* VC++ 2013(或更高版本)
* Windows 7(或更高版本)


## 运行示例程序
首先在 [Agora.io 注册](https://dashboard.agora.io/cn/signup/) 注册账号，并创建自己的测试项目，获取到 App ID。将 APP_ID宏定义内容改为刚才申请的 App ID

    
    #define APP_ID _T("Your App ID")
    

如果你不想修改代码部分,你可以在在Debug/Release下创建一个AppId.ini文件.修改appId的值为刚才申请的App ID

    [AppID]
    AppID=xxxxxxxxxxxxxxxxxxx


然后在 [Agora.io SDK](https://www.agora.io/cn/download/) 下载 **视频通话 + 直播 SDK**，解压后将其中的 **sdk** 复制到本项目目录下（并覆盖原有旧目录）。

最后使用 VC++2013 打开 OpenLive.sln，编译整个解决方案即可运行

**注意:**

  1. 程序编译后，在运行程序时如若出现：无法启动程序"xxx\xxx\xxx\Debug\Language\English.dll"的错误提示，
      请在解决方案资源管理器中选中OpenLive 项目，并右击，在弹出的菜单栏中选择 "设为启动项目"，即可解决。之后重新运行程序即可。
  2. 本开源项目在 debug 模式下运行可能会出现崩溃，请在 release 模式下运行。


## 联系我们

- 完整的 API 文档见 [文档中心](https://docs.agora.io/cn/)
- 如果在集成中遇到问题，你可以到 [开发者社区](https://dev.agora.io/cn/) 提问
- 如果有售前咨询问题，可以拨打 400 632 6626，或加入官方Q群 12742516 提问
- 如果需要售后技术支持，你可以在 [Agora Dashboard](https://dashboard.agora.io) 提交工单
- 如果发现了示例代码的bug，欢迎提交 [issue](https://github.com/AgoraIO/Advanced-Video/issues)

## 代码许可

The MIT License (MIT).
