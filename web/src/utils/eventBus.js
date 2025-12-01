import mitt from 'mitt';
const getDefaultNamespace = () => {
  const pathname = window.location.pathname;
  return pathname.replace(/\//g, ':');
};

class EventBus {
    /**
     * 默认命名空间为当前页面url
     * @param {String} namespace 
     */
  constructor(namespace = '') {
    this.namespace = namespace || getDefaultNamespace();  // 默认使用自动生成的命名空间
    this.emitter = mitt();  // 创建一个 mitt 实例
  }
  /**
   * 生成带有命名空间的事件名
   * @param {*} event 
   * @returns 
   */
  getEventName(event) {
    return this.namespace ? `${this.namespace}:${event}` : event;
  }

  //发送事件
  emit(event, data) {
    this.emitter.emit(this.getEventName(event), data);
    console.log('emit', event, data);
  }

  //监听事件（只触发一次）
  once(event, callback) {
    this.emitter.once(this.getEventName(event), callback);
  }

  //监听事件
  on(event, callback) {
    this.emitter.on(this.getEventName(event), callback);
  }

  //移除某个事件的监听器
  off(event, callback) {
    this.emitter.off(this.getEventName(event), callback);
  }

  //清除所有事件的监听器
  clearAll() {
    this.emitter.all.clear();
  }

  //清除特定事件的所有监听器
  clearEvent(event) {
    // 清除特定事件的所有监听器
    const eventName = this.getEventName(event);
    if (this.emitter.all.has(eventName)) {
      this.emitter.all.delete(eventName);
    }
  }

  //等待事件触发，支持超时
  waitFor(event, timeout = 5000) {
    return new Promise((resolve) => {
      let timer;
      //事件处理器
      const eventHandler = (data) => {
        clearTimeout(timer); //清除定时器
        resolve(data);  //返回事件的数据
      };
      
      //设置超时
      timer = setTimeout(() => {
        this.off(event, eventHandler); //超时后移除事件监听
        //reject(new Error(`等待事件 ${event} 超时`));
        resolve(false);
      }, timeout);
      //监听事件
      this.on(event, eventHandler);
    });
  }
}
let eventBusDict={

}
export function createEventBus(name){
    let tmp=new EventBus(name);
    eventBusDict[name]=tmp;
    return eventBusDict[name];
}
export function getEventBus(name){
    return eventBusDict[name];
}
export function deleteEventBus(name){
    eventBusDict[name].clearAll();
    eventBusDict[name]=null;
}
export const moreOptionEventBus=createEventBus('moreOption');
export default EventBus;