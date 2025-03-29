import { webview } from '@kit.ArkWeb';
import promptAction from '@ohos.promptAction';
import { common } from '@kit.AbilityKit';
webview.once("webInited", () => {
})
@Entry
@Component
struct MyWeb {
  @State webLoadProgress:number = 10;
  @State ifFirstLoad:boolean=true;
  @State ifLoading:boolean=true;
  controller: webview.WebviewController = new webview.WebviewController();
  build() {
    Stack() {
      Web({
        src: 'https://sharesdu.com/#/index',
        controller: this.controller
      })
        .javaScriptAccess(true)
        .domStorageAccess(true)
        .fileAccess(true)
        .imageAccess(true)
        .onPageBegin((event) => {
          if(this.ifFirstLoad){
            this.ifLoading=true;
          }
        })
        .onPageEnd((event) => {
          this.ifFirstLoad=false;
          this.ifLoading=false;
        })
        .onErrorReceive((event)=>{
          promptAction.showToast({
            message:"网络错误",
            duration:2000,
          });
          setTimeout(()=>{
            (getContext(this) as common.UIAbilityContext)?.terminateSelf();
          },2000)
        })
        .onHttpErrorReceive((event)=>{
          //
        })
        .onAlert((event)=>{
          AlertDialog.show({
            title:"提示",
            message:event?.message,
            confirm:{
              value:"确认",
              action:()=>{
                event?.result.handleConfirm()
              }
            },
            cancel:()=>{
              event?.result.handleCancel()
            }
          })
          return true;
        })
        .onConfirm((event)=>{
          AlertDialog.show({
            title:'提示',
            message:event?.message,
            confirm:{
              value:'确认',
              action:()=>{
                event?.result.handleConfirm()
              }
            },
            cancel:()=>{
              event?.result.handleCancel()
            }
          })
          return true;
        })
        .onProgressChange((event) => {
         this.webLoadProgress=event.newProgress;
        })
      .backgroundColor(Color.Transparent)
      //progress
      Progress({
        value:this.webLoadProgress,
        total:100,
        type:ProgressType.Capsule
      })
        .color("#9c0c13")
        .backgroundColor(Color.White)
        .margin(50)
        .visibility(this.ifLoading?Visibility.Visible:Visibility.Hidden)
        .height(15)
    }
  }
  onBackPress(): boolean | void {
    this.controller.backward();
    return true;
  }
}