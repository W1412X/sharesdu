import { debugSaveClickMsg } from "./storage";

export async function debugGetClickEventMsg(event) {
    const target = event.target;
    const elementInfo = {
        tagName: target.tagName,
        id: target.id || null,
        className: target.className || null,
        innerText: target.innerText ? target.innerText.trim() : '',
        outerHTML: target.outerHTML ? target.outerHTML.trim() : '',
        attributes: {},
    };
    for (let attr of target.attributes) {
        elementInfo.attributes[attr.name] = attr.value;
    }
    const clickInfo = {
        pageUrl: window.location.href,
        timestamp: new Date().toISOString(),
        eventType: event.type,
        clientX: event.clientX,
        clientY: event.clientY,
        pageX: event.pageX,
        pageY: event.pageY,
        offsetX: event.offsetX,
        offsetY: event.offsetY,
        isTrusted: event.isTrusted,
        defaultPrevented: event.defaultPrevented,
        bubbles: event.bubbles,
        cancelable: event.cancelable,
        composed: event.composed,
        targetElement: elementInfo
    };
    await debugSaveClickMsg(clickInfo);
}
export function registerGlobalClickListener() {
    document.addEventListener('click', debugGetClickEventMsg);
}
export function removeGlobalClickListener(){
    document.removeEventListener('click', debugGetClickEventMsg);
}