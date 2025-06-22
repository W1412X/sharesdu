import { debugSaveErrorMsg } from "./storage";

export function debugGetErrorInfo(errorEvent, type) {
    const errorInfo = {
        pageUrl: window.location.href,
        timestamp: new Date().toISOString(),
        type: type,
        error: {}
    };

    try {
        switch (type) {
            case 'runtime':
                errorInfo.error = {
                    message: errorEvent.message || 'Unknown error',
                    source: errorEvent.source || null,
                    line: errorEvent.lineno || null,
                    column: errorEvent.colno || null,
                    stack: errorEvent.error?.stack || null
                };
                break;

            case 'unhandledrejection':
                errorInfo.error = {
                    message: errorEvent.reason?.message || String(errorEvent.reason || 'Unhandled promise rejection'),
                    stack: errorEvent.reason?.stack || null
                };
                break;

            case 'resource':{
                const target = errorEvent.target || {};
                errorInfo.error = {
                    resourceType: target.tagName || 'UNKNOWN',
                    src: target.src || target.href || ''
                };
            }
                break;

            case 'network':
                errorInfo.error = {
                    requestUrl: Array.isArray(errorEvent.args) ? errorEvent.args[0] : 'unknown',
                    errorMessage: errorEvent.error?.message || String(errorEvent.error || 'Network fetch failed')
                };
                break;
        }
    } catch (innerError) {
        console.warn('提取错误信息失败:', innerError);
        errorInfo.error = {
            message: 'Failed to extract error details',
            originalError: String(innerError)
        };
    }

    return errorInfo;
}

let originalOnError = null;
let originalOnUnhandledRejection = null;
let originalFetch = null;
let handleResourceErrorFn = null;
let isHandlingError = false;

export function registerGlobalErrorListener() {
    if (!originalOnError) originalOnError = window.onerror;
    if (!originalOnUnhandledRejection) originalOnUnhandledRejection = window.onunhandledrejection;
    if (!originalFetch) originalFetch = window.fetch;

    window.onerror = async function(message, source, lineno, colno, error) {
        if (isHandlingError) return true;

        try {
            isHandlingError = true;

            const errorData = debugGetErrorInfo({
                message, source, lineno, colno, error
            }, 'runtime');

            console.error('捕获到同步错误:', errorData);

            await debugSaveErrorMsg(errorData);

        } catch (logError) {
            console.error('记录同步错误时发生异常:', logError);
        } finally {
            isHandlingError = false;
        }

        return true;
    };

    window.onunhandledrejection = async function(event) {
        if (isHandlingError) {
            event.preventDefault();
            return;
        }

        try {
            isHandlingError = true;

            const errorData = debugGetErrorInfo(event, 'unhandledrejection');
            console.error('捕获到Promise拒绝:', errorData);

            await debugSaveErrorMsg(errorData);


        } catch (logError) {
            console.error('记录Promise拒绝错误时发生异常:', logError);
        } finally {
            isHandlingError = false;
            event.preventDefault();
        }
    };

    handleResourceErrorFn = async function(event) {
        if (isHandlingError) return;
        if (event.target === window || !(event.target.src || event.target.href)) return;

        try {
            isHandlingError = true;

            const errorData = debugGetErrorInfo({ target: event.target }, 'resource');
            console.error('资源加载失败:', errorData);

            await debugSaveErrorMsg(errorData);

        } catch (logError) {
            console.error('记录资源加载失败时发生异常:', logError);
        } finally {
            isHandlingError = false;
        }
    };
    window.addEventListener('error', handleResourceErrorFn, true);

    window.fetch = function(...args) {
        return originalFetch.apply(this, args).catch(async error => {
            if (isHandlingError) return Promise.reject(error);

            try {
                isHandlingError = true;

                const errorData = debugGetErrorInfo({ args, error }, 'network');
                console.error('网络请求失败:', errorData);

                await debugSaveErrorMsg(errorData);

            } catch (logError) {
                console.error('记录fetch错误时发生异常:', logError);
            } finally {
                isHandlingError = false;
            }

            return Promise.reject(error);
        });
    };
}

export function removeGlobalErrorListener() {
    window.onerror = originalOnError;
    window.onunhandledrejection = originalOnUnhandledRejection;
    window.removeEventListener('error', handleResourceErrorFn, true);
    window.fetch = originalFetch;

    originalOnError = null;
    originalOnUnhandledRejection = null;
    originalFetch = null;
    handleResourceErrorFn = null;
}