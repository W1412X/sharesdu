import { registerGlobalClickListener, removeGlobalClickListener } from "@/utils/debug/click";
import { registerGlobalErrorListener, removeGlobalErrorListener } from "@/utils/debug/error";
import { selfDefineLocalStorage } from "../localStorage";
import { clearDebugInfo, getDebugInfo } from "./storage";
import { getBrowserInfo } from "./device";
export function addDebugStopButton(){
    const debugButton = document.createElement("button");
    debugButton.innerText = "❌ 关闭调试";
    debugButton.style.position = "fixed";
    debugButton.style.top = "80px";
    debugButton.style.right = "10px";
    debugButton.style.zIndex = "999999"; // 确保在最上层
    debugButton.style.padding = "8px 12px";
    debugButton.style.backgroundColor = "#ff4d4f";
    debugButton.style.color = "black";
    debugButton.style.border = "none";
    debugButton.style.borderRadius = "4px";
    debugButton.style.cursor = "pointer";
    debugButton.style.fontFamily = "Arial, sans-serif";
    debugButton.style.fontSize = "14px";
    debugButton.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
    document.body.appendChild(debugButton);
    debugButton.addEventListener("click", async () => {
        const newUrl = window.location.href.replace("/debug", ""); // 移除查询参数
        if (selfDefineLocalStorage.getItem("ifDebug")!=="true") {
            window.alert("已退出调试模式，请勿重复退出");
        } else {
            if (window.confirm("下载调试信息？(退出后调试信息不会保存)")) {
                await downloadDebugInfo();
            }
            await finishDebug();
        }
        window.location.href = newUrl;
        location.reload();
    });
}

export function startDebug() {
    selfDefineLocalStorage.setItem("ifDebug", "true");
    registerGlobalErrorListener();
    registerGlobalClickListener();
    selfDefineLocalStorage.setItem("debugEnvInfo", JSON.stringify(getBrowserInfo()))
    addDebugStopButton();
}
export async function finishDebug() {
    selfDefineLocalStorage.removeItem("ifDebug");
    removeGlobalErrorListener();
    removeGlobalClickListener();
    await clearDebugInfo();
}

export async function downloadDebugInfo() {
    try {
        const info = await getDebugInfo();
        const jsonStr = JSON.stringify(info, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `debug-info-${new Date().toISOString().slice(0, 10)}.json`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('下载调试信息失败:', error);
    }
}