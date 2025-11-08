<template>
    <div style="position: fixed;">
        <canvas class="background" id="canvas"></canvas>
        <div style="max-height: 100vh;overflow-y: auto;">
            <div class="top-bar">
                <span class="logo-text logo-margin">ShareSDU</span>
                <div class="top-btn-div">
                    <button @click="this.setContactState(true)" class="custom-nav-btn">联系我们</button>
                    <button @click="downloadApp" class="custom-nav-btn">APP</button>
                </div>
            </div>
            <div class="logo-line"></div>
            <div class="full-center">
                <v-dialog v-model="ifShowDialog" class="full-center">
                    <div class="dialog-card-container">
                        <v-card v-if="ifShowLogin" class="card">
                            <div class="title-bold">敬请期待</div>
                            <div class="text-medium">暂未对外开放<br />(预计于25年3月份开放注册)</div>
                            <div class="card-bottom-div">
                                <v-btn variant="text" @click="this.setLoginState(false)">好的</v-btn>
                            </div>
                        </v-card>
                        <v-card v-if="ifShowContact" class="card">
                            <div class="title-bold">联系我们</div>
                            <div class="text-medium-bold">
                                邮箱：<a href="mailto:admin@sharesdu.com">admin@sharesdu.com</a><br />
                                QQ群：<a href="https://qm.qq.com/q/Uh7X13Hp8Q">246680702</a>
                            </div>
                            <div class="card-bottom-div">
                                <v-btn variant="text" @click="this.setContactState(false)">好的</v-btn>
                            </div>
                        </v-card>
                        <v-card v-if="ifShowDownload" class="card">
                            <div class="row-div">
                                <div class="title-bold">测试阶段，有问题请联系管理员</div>
                                <v-spacer></v-spacer>
                                <v-btn @click="setDownloadState(false)" :size="25" :icon="'mdi-close'" variant="text"></v-btn>
                            </div>
                            <div class="text-medium" style="margin: 5px;">
                                对于OPPO，VIVO，小米等品牌以及<span class="text-medium-bold">非纯血鸿蒙华为</span>用户直接下载Android版本并安装
                                <br />
                                对于苹果用户，下载配置文件后在<span class="text-medium-bold">设置 > 已下载描述文件</span>进行安装
                                <br />
                                对于<span class="text-medium-bold">华为鸿蒙NEXT</span>用户，下载Harmony版本安装
                                <br />
                                <span class="text-tiny">注：如有无法安装以及其他问题请联系开发者(<a href="https://qm.qq.com/q/Uh7X13Hp8Q">点击此处进入QQ群</a>)</span>
                            </div>
                            <div class="card-bottom-div">
                                <v-btn class="download-btn" prepend-icon="mdi-android" color="grey" variant="outlined"
                                    @click="openUrl('/app/sharesdu-android.apk')">Android</v-btn>
                                <v-btn class="download-btn"  prepend-icon="mdi-apple" color="grey" variant="outlined"
                                    @click="downloadIOS">IOS</v-btn>
                                <v-btn class="download-btn" prepend-icon="mdi-circle-outline" color="grey" variant="outlined"
                                    @click="openUrl('/app/sharesdu-harmony.hap')">HARMONY</v-btn>
                            </div>
                        </v-card>
                    </div>
                </v-dialog>
                <!-- PC端：新布局结构 -->
                <div class="main-content">
                    <!-- Hero 区域 -->
                    <div class="hero-section">
                        <div class="title-big-bold intro-text-div hero-title">ShareSDU</div>
                        <div class="hero-subtitle">大学交流分享平台</div>
                        <div class="title intro-text-div hero-description">
                            为大学生活提供一个分享、交流与学习的平台
                        </div>
                    </div>

                    <!-- 主要内容区域：左右分栏布局 -->
                    <div class="main-grid">
                        <!-- 左侧：功能展示 -->
                        <div class="features-section-card">
                            <div class="section-title-small">核心功能</div>
                            <div class="features-grid">
                                <div class="feature-item">
                                    <v-icon color="primary" size="40">mdi-post</v-icon>
                                    <div class="feature-title">文章博客</div>
                                    <div class="feature-desc">分享知识与经验</div>
                                </div>
                                <div class="feature-item">
                                    <v-icon color="primary" size="40">mdi-forum</v-icon>
                                    <div class="feature-title">帖子论坛</div>
                                    <div class="feature-desc">交流讨论互动</div>
                                </div>
                                <div class="feature-item">
                                    <v-icon color="primary" size="40">mdi-star</v-icon>
                                    <div class="feature-title">课程评分</div>
                                    <div class="feature-desc">精准课程评价</div>
                                </div>
                                <div class="feature-item">
                                    <v-icon color="primary" size="40">mdi-file-document</v-icon>
                                    <div class="feature-title">资源共享</div>
                                    <div class="feature-desc">学习资料分享</div>
                                </div>
                            </div>
                        </div>

                        <!-- 右侧：优势 + CTA -->
                        <div class="right-column">
                            <!-- 平台优势 -->
                            <div class="advantages-section-card">
                                <div class="section-title-small">平台优势</div>
                                <div class="advantage-list">
                                    <div class="advantage-item">
                                        <v-icon color="success">mdi-check-circle</v-icon>
                                        <span><strong>精准实时</strong> - 本校学生创作，信息准确及时</span>
                                    </div>
                                    <div class="advantage-item">
                                        <v-icon color="success">mdi-check-circle</v-icon>
                                        <span><strong>用户纯净</strong> - 校园邮箱认证，可筛选非本校人员</span>
                                    </div>
                                    <div class="advantage-item">
                                        <v-icon color="success">mdi-check-circle</v-icon>
                                        <span><strong>方便快捷</strong> - 强大搜索功能，快速获取信息</span>
                                    </div>
                                    <div class="advantage-item">
                                        <v-icon color="success">mdi-check-circle</v-icon>
                                        <span><strong>开放灵活</strong> - 支持邮箱换绑，毕业后账户不丢失</span>
                                    </div>
                                </div>
                            </div>

                            <!-- CTA 按钮区域 -->
                            <div class="cta-section-card">
                                <div class="cta-primary">
                                    <v-btn to="/login" size="x-large" prepend-icon="mdi-account-plus" color="primary" 
                                        class="cta-btn" elevation="4">
                                        立即注册账号
                                    </v-btn>
                                    <div class="cta-hint">开启你的 ShareSDU 之旅</div>
                                </div>
                                <div class="cta-secondary">
                                    <v-btn to="/document/intro" prepend-icon="mdi-file-document" variant="outlined" 
                                        color="primary" class="secondary-btn">
                                        查看详细介绍
                                    </v-btn>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 提示信息区域 -->
                    <div class="notices-grid">
                        <div class="test-notice">
                            <v-icon color="warning" size="20">mdi-alert-circle</v-icon>
                            <span>当前正在测试阶段，用户信息不会保留</span>
                        </div>
                        <div class="legal-notice">
                            <v-icon color="error" size="18">mdi-shield-alert</v-icon>
                            <span>本站已进行公安备案，发表违法信息后果自负</span>
                        </div>
                    </div>

                    <!-- 联系方式 -->
                    <div class="contact-section">
                        <div class="section-subtitle">加入我们的社区</div>
                        <div class="contact-text">
                            本站提供 Android、iOS 以及 Harmony 三种移动端 APP（点击右上角APP下载安装）<br/>
                            扫描下方二维码或<a href="https://qm.qq.com/q/Uh7X13Hp8Q">点击此处</a>，加入官方QQ交流群/关注公众号
                        </div>
                        <div class="img-container">
                            <div class="qr-item">
                                <img class="img" src="/qq_img/group_qr.png" />
                                <div class="qr-label">QQ交流群</div>
                            </div>
                            <div class="qr-item">
                                <img class="img" src="/wechat/wechat_qr.jpg" />
                                <div class="qr-label">微信公众号</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 移动端：保持原有结构 -->
                <div class="mobile-content">
                    <v-card class="intro-card" elevation="12">
                        <div class="hero-section">
                            <div class="title-big-bold intro-text-div hero-title">ShareSDU</div>
                            <div class="hero-subtitle">大学交流分享平台</div>
                            <div class="title intro-text-div hero-description">
                                为大学生活提供一个分享、交流与学习的平台
                            </div>
                        </div>

                        <div class="content-grid">
                            <div class="features-section">
                                <div class="section-title-small">核心功能</div>
                                <div class="features-grid">
                                    <div class="feature-item">
                                        <v-icon color="primary" size="40">mdi-post</v-icon>
                                        <div class="feature-title">文章博客</div>
                                        <div class="feature-desc">分享知识与经验</div>
                                    </div>
                                    <div class="feature-item">
                                        <v-icon color="primary" size="40">mdi-forum</v-icon>
                                        <div class="feature-title">帖子论坛</div>
                                        <div class="feature-desc">交流讨论互动</div>
                                    </div>
                                    <div class="feature-item">
                                        <v-icon color="primary" size="40">mdi-star</v-icon>
                                        <div class="feature-title">课程评分</div>
                                        <div class="feature-desc">精准课程评价</div>
                                    </div>
                                    <div class="feature-item">
                                        <v-icon color="primary" size="40">mdi-file-document</v-icon>
                                        <div class="feature-title">资源共享</div>
                                        <div class="feature-desc">学习资料分享</div>
                                    </div>
                                </div>
                            </div>

                            <div class="advantages-section">
                                <div class="section-title-small">平台优势</div>
                                <div class="advantage-list">
                                    <div class="advantage-item">
                                        <v-icon color="success">mdi-check-circle</v-icon>
                                        <span><strong>精准实时</strong> - 本校学生创作，信息准确及时</span>
                                    </div>
                                    <div class="advantage-item">
                                        <v-icon color="success">mdi-check-circle</v-icon>
                                        <span><strong>用户纯净</strong> - 校园邮箱认证，可筛选非本校人员</span>
                                    </div>
                                    <div class="advantage-item">
                                        <v-icon color="success">mdi-check-circle</v-icon>
                                        <span><strong>方便快捷</strong> - 强大搜索功能，快速获取信息</span>
                                    </div>
                                    <div class="advantage-item">
                                        <v-icon color="success">mdi-check-circle</v-icon>
                                        <span><strong>开放灵活</strong> - 支持邮箱换绑，毕业后账户不丢失</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="cta-section">
                            <div class="cta-primary">
                                <v-btn to="/login" size="x-large" prepend-icon="mdi-account-plus" color="primary" 
                                    class="cta-btn" elevation="4">
                                    立即注册账号
                                </v-btn>
                                <div class="cta-hint">开启你的 ShareSDU 之旅</div>
                            </div>
                            <div class="cta-secondary">
                                <v-btn to="/document/intro" prepend-icon="mdi-file-document" variant="outlined" 
                                    color="primary" class="secondary-btn">
                                    查看详细介绍
                                </v-btn>
                            </div>
                        </div>

                        <div class="notices-grid">
                            <div class="test-notice">
                                <v-icon color="warning" size="20">mdi-alert-circle</v-icon>
                                <span>当前正在测试阶段，用户信息不会保留</span>
                            </div>
                            <div class="legal-notice">
                                <v-icon color="error" size="18">mdi-shield-alert</v-icon>
                                <span>本站已进行公安备案，发表违法信息后果自负</span>
                            </div>
                        </div>

                        <div class="contact-section">
                            <div class="section-subtitle">加入我们的社区</div>
                            <div class="contact-text">
                                本站提供 Android、iOS 以及 Harmony 三种移动端 APP（点击右上角APP下载安装）<br/>
                                扫描下方二维码或<a href="https://qm.qq.com/q/Uh7X13Hp8Q">点击此处</a>，加入官方QQ交流群/关注公众号
                            </div>
                            <div class="img-container">
                                <div class="qr-item">
                                    <img class="img" src="/qq_img/group_qr.png" />
                                    <div class="qr-label">QQ交流群</div>
                                </div>
                                <div class="qr-item">
                                    <img class="img" src="/wechat/wechat_qr.jpg" />
                                    <div class="qr-label">微信公众号</div>
                                </div>
                            </div>
                        </div>
                    </v-card>
                </div>
            </div>
            <div class="footer-section">
                <div class="footer-links">
                    <a href="https://beian.miit.gov.cn/" target="_blank">鲁ICP备2024118409号-1</a>
                </div>
                <div class="footer-police">
                    <img src="../../public/police.png" alt="公安">
                    <a href="//www.beian.gov.cn/portal/registerSystemInfo?recordcode=37028202001173">
                        鲁公网安备37028202001173号
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { globalProperties } from '@/main';
import { openPage } from '@/utils/navigation';
import { hexToRgba } from '@/utils/color';
import { ref, computed, onMounted } from 'vue';
export default {
    name: 'WelcomePage',
    setup() {
        const themeColor = globalProperties.$themeColor;
        const deviceType = globalProperties.$deviceType;
        const ifShowLogin = ref(false);
        const ifShowContact = ref(false);
        const ifShowDownload = ref(false);
        const ifShowDialog = computed(() => {
            return ifShowLogin.value || ifShowContact.value || ifShowDownload.value;
        })
        const setLoginState = (state) => {
            ifShowLogin.value = state;
        }
        const setContactState = (state) => {
            ifShowContact.value = state;
        }
        const setDownloadState = (state) => {
            ifShowDownload.value = state;
        }
        
        // 设置基于主题颜色的 CSS 变量
        const setThemeColors = () => {
            const root = document.documentElement;
            root.style.setProperty('--welcome-theme-color', themeColor);
            root.style.setProperty('--welcome-theme-rgba-08', hexToRgba(themeColor, 0.08));
            root.style.setProperty('--welcome-theme-rgba-10', hexToRgba(themeColor, 0.1));
            root.style.setProperty('--welcome-theme-rgba-12', hexToRgba(themeColor, 0.12));
            root.style.setProperty('--welcome-theme-rgba-20', hexToRgba(themeColor, 0.2));
            root.style.setProperty('--welcome-theme-rgba-25', hexToRgba(themeColor, 0.25));
            root.style.setProperty('--welcome-theme-rgba-30', hexToRgba(themeColor, 0.3));
            root.style.setProperty('--welcome-theme-rgba-40', hexToRgba(themeColor, 0.4));
            root.style.setProperty('--welcome-theme-rgba-50', hexToRgba(themeColor, 0.5));
            
            // 生成渐变色（基于主题颜色的变体）
            // 使用 HSL 来生成渐变色
            const hex = themeColor.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            
            // 转换为 HSL
            const rNorm = r / 255;
            const gNorm = g / 255;
            const bNorm = b / 255;
            const max = Math.max(rNorm, gNorm, bNorm);
            const min = Math.min(rNorm, gNorm, bNorm);
            let h, s, l = (max + min) / 2;
            
            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
                    case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
                    case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
                }
            }
            
            // 生成渐变色的变体（稍微调整色相和亮度）
            const h1 = (h * 360 + 10) % 360;
            const h2 = (h * 360 - 10 + 360) % 360;
            const l1 = Math.min(100, l * 100 + 5);
            const l2 = Math.max(0, l * 100 - 5);
            
            // HSL 转 RGB 的辅助函数
            const hslToRgb = (h, s, l) => {
                h = h / 360;
                let r, g, b;
                if (s === 0) {
                    r = g = b = l;
                } else {
                    const hue2rgb = (p, q, t) => {
                        if (t < 0) t += 1;
                        if (t > 1) t -= 1;
                        if (t < 1/6) return p + (q - p) * 6 * t;
                        if (t < 1/2) return q;
                        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                        return p;
                    };
                    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                    const p = 2 * l - q;
                    r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
                    g = Math.round(hue2rgb(p, q, h) * 255);
                    b = Math.round(hue2rgb(p, q, h - 1/3) * 255);
                }
                return `rgb(${r}, ${g}, ${b})`;
            };
            
            root.style.setProperty('--welcome-theme-gradient-start', hslToRgb(h1, s, l1 / 100));
            root.style.setProperty('--welcome-theme-gradient-end', hslToRgb(h2, s, l2 / 100));
        };
        
        onMounted(() => {
            setThemeColors();
        });
        
        return {
            ifShowContact,
            ifShowDialog,
            ifShowLogin,
            setContactState,
            setLoginState,
            themeColor,
            deviceType,
            ifShowDownload,
            setDownloadState
        }
    },
    components: {

    },
    data() {
        return {
            reason: "",
        }
    },
    methods: {
        downloadApp() {
            this.setDownloadState(true);
        },
        openUrl(url) {
            openPage("url",{url:url});
        },
        downloadIOS(){
            let a= document.createElement('a');
            a.href = '/app/ios/sharesdu.mobileconfig';
            a.download = 'sharesdu.mobileconfig';
            document.body.appendChild(a);
            a.click();
            a.href = 'app/ios/sharesdu.mobileprovision'
            a.download = 'sharesdu.mobileprovision';
            a.click();
            document.body.removeChild(a);
        }
    },
}
</script>
<style scoped>
/* ========== 通用样式 ========== */
.download-btn {
    margin: 5px;
    min-width: 120px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 12px !important;
}

.download-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
}

.row-div {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
}

/* ========== 顶部导航栏 ========== */
.top-bar {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.85);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.logo-margin {
    font-weight: 700;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, var(--welcome-theme-gradient-start, #667eea) 0%, var(--welcome-theme-gradient-end, #764ba2) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* ========== 自定义导航按钮 ========== */
.custom-nav-btn {
    background: transparent;
    border: none;
    color: var(--welcome-theme-color, #667eea);
    font-size: 1rem;
    font-weight: 600;
    padding: 10px 20px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    font-family: inherit;
    letter-spacing: 0.3px;
}

.custom-nav-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--welcome-theme-rgba-10, rgba(102, 126, 234, 0.1));
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 12px;
}

.custom-nav-btn:hover::before {
    opacity: 1;
}

.custom-nav-btn:hover {
    transform: translateY(-2px);
    color: var(--welcome-theme-color, #667eea);
}

.custom-nav-btn:active {
    transform: translateY(0);
}

.custom-nav-btn span {
    position: relative;
    z-index: 1;
}

/* ========== Hero 区域 ========== */
.hero-section {
    text-align: center;
    padding: 60px 30px 50px;
    background: linear-gradient(135deg, 
        var(--welcome-theme-rgba-08, rgba(102, 126, 234, 0.08)) 0%, 
        var(--welcome-theme-rgba-08, rgba(118, 75, 162, 0.08)) 50%,
        var(--welcome-theme-rgba-08, rgba(33, 150, 243, 0.08)) 100%);
    border-radius: 24px;
    margin-bottom: 40px;
    position: relative;
    overflow: hidden;
    animation: fadeInUp 0.8s ease-out;
}

.hero-section::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, var(--welcome-theme-rgba-10, rgba(102, 126, 234, 0.1)) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
    pointer-events: none;
}

.hero-title {
    font-size: 4.5rem !important;
    font-weight: 900 !important;
    background: linear-gradient(135deg, var(--welcome-theme-gradient-start, #667eea) 0%, var(--welcome-theme-color, #764ba2) 50%, var(--welcome-theme-gradient-end, #f093fb) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 16px !important;
    line-height: 1.1;
    letter-spacing: -2px;
    position: relative;
    z-index: 1;
    animation: gradientShift 3s ease infinite;
    background-size: 200% 200%;
}

.hero-subtitle {
    font-size: 2rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
}

.hero-description {
    font-size: 1.25rem;
    color: #4a5568;
    max-width: 680px;
    margin: 0 auto;
    line-height: 1.8;
    position: relative;
    z-index: 1;
}

/* ========== 功能展示网格 ========== */
.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 24px;
    margin: 40px 0;
    padding: 0 15px;
}

.feature-item {
    text-align: center;
    padding: 32px 20px;
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08),
                0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: default;
    position: relative;
    overflow: hidden;
}

.feature-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.5s;
}

.feature-item:hover::before {
    left: 100%;
}

.feature-item:hover {
    transform: translateY(-8px) scale(1.02);
    background: linear-gradient(135deg, var(--welcome-theme-rgba-10, rgba(102, 126, 234, 0.1)) 0%, var(--welcome-theme-rgba-10, rgba(118, 75, 162, 0.1)) 100%);
    box-shadow: 0 12px 40px var(--welcome-theme-rgba-25, rgba(102, 126, 234, 0.25)),
                0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--welcome-theme-rgba-30, rgba(102, 126, 234, 0.3));
}

.feature-item .v-icon {
    transition: transform 0.3s ease;
}

.feature-item:hover .v-icon {
    transform: scale(1.15) rotate(5deg);
}

.feature-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin: 16px 0 10px;
    color: #1a202c;
    letter-spacing: -0.3px;
}

.feature-desc {
    font-size: 0.95rem;
    color: #4a5568;
    line-height: 1.6;
}

/* ========== PC端新布局 ========== */
.main-content {
    display: none;
}

.mobile-content {
    display: block;
}

/* ========== 内容网格布局（移动端） ========== */
.content-grid {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.features-section {
    width: 100%;
}

/* ========== PC端卡片样式 ========== */
.features-section-card,
.advantages-section-card,
.cta-section-card {
    padding: 40px;
    border-radius: 24px;
    background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.95) 0%, 
        rgba(255, 255, 255, 0.85) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08),
                0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
}

.features-section-card:hover,
.advantages-section-card:hover,
.cta-section-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12),
                0 4px 12px rgba(0, 0, 0, 0.06);
}

.cta-section-card {
    background: linear-gradient(135deg, 
        var(--welcome-theme-rgba-08, rgba(102, 126, 234, 0.08)) 0%, 
        rgba(255, 255, 255, 0.95) 100%);
}

/* ========== 优势区域 ========== */
.advantages-section {
    margin: 0;
    padding: 40px 35px;
    background: linear-gradient(135deg, 
        rgba(76, 175, 80, 0.08) 0%, 
        rgba(56, 142, 60, 0.08) 100%);
    border-radius: 24px;
    border: 1px solid rgba(76, 175, 80, 0.2);
    box-shadow: 0 8px 32px rgba(76, 175, 80, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.5);
    position: relative;
    overflow: hidden;
}

.advantages-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, #4CAF50 0%, #388e3c 100%);
    border-radius: 2px;
}

.section-title-small {
    font-size: 1.6rem;
    font-weight: 700;
    color: #1a202c;
    text-align: center;
    margin-bottom: 24px;
    letter-spacing: -0.3px;
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.section-title {
    font-size: 1.9rem;
    font-weight: 800;
    color: #1a202c;
    text-align: center;
    margin-bottom: 28px;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.section-subtitle {
    font-size: 1.6rem;
    font-weight: 700;
    color: #2d3748;
    text-align: center;
    margin-bottom: 20px;
    letter-spacing: -0.3px;
}

.advantage-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.advantage-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    font-size: 1.05rem;
    color: #2d3748;
    line-height: 1.7;
    padding: 12px;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.advantage-item:hover {
    background: rgba(255, 255, 255, 0.5);
    transform: translateX(4px);
}

.advantage-item .v-icon {
    flex-shrink: 0;
    margin-top: 2px;
    filter: drop-shadow(0 2px 4px rgba(76, 175, 80, 0.3));
}

/* ========== CTA 按钮区域 ========== */
.cta-section {
    margin: 50px 0;
    text-align: center;
}

.cta-primary {
    margin-bottom: 24px;
}

.cta-btn {
    font-size: 1.3rem !important;
    font-weight: 700 !important;
    padding: 18px 48px !important;
    letter-spacing: 0.5px;
    text-transform: none !important;
    border-radius: 16px !important;
    background: linear-gradient(135deg, var(--welcome-theme-gradient-start, #667eea) 0%, var(--welcome-theme-color, #764ba2) 100%) !important;
    box-shadow: 0 8px 24px var(--welcome-theme-rgba-40, rgba(102, 126, 234, 0.4)),
                0 4px 8px rgba(0, 0, 0, 0.1) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    position: relative;
    overflow: hidden;
    line-height: 1.5 !important;
    min-height: auto !important;
    height: auto !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
}

.cta-btn :deep(.v-btn__content) {
    position: relative;
    z-index: 2;
    white-space: nowrap;
    overflow: visible;
}

.cta-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
    z-index: 1;
    pointer-events: none;
}

.cta-btn:hover::before {
    width: 300px;
    height: 300px;
}

.cta-btn:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 12px 32px var(--welcome-theme-rgba-50, rgba(102, 126, 234, 0.5)),
                0 6px 12px rgba(0, 0, 0, 0.15) !important;
}

.cta-btn:active {
    transform: translateY(-1px) scale(0.98);
}

.cta-hint {
    margin-top: 12px;
    font-size: 1rem;
    color: #718096;
    font-style: italic;
    opacity: 0.8;
}

.cta-secondary {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
}

.secondary-btn {
    font-weight: 600 !important;
    text-transform: none !important;
    border-radius: 12px !important;
    transition: all 0.3s ease !important;
}

.secondary-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1) !important;
}

/* ========== 提示信息网格 ========== */
.notices-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 30px 0;
}

.test-notice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 18px 24px;
    background: linear-gradient(135deg, 
        rgba(255, 152, 0, 0.12) 0%, 
        rgba(255, 193, 7, 0.12) 100%);
    border-radius: 16px;
    margin: 0;
    font-size: 1rem;
    color: #E65100;
    line-height: 1.6;
    border: 1px solid rgba(255, 152, 0, 0.2);
    box-shadow: 0 4px 16px rgba(255, 152, 0, 0.1);
    backdrop-filter: blur(10px);
}

.legal-notice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px 24px;
    background: linear-gradient(135deg, 
        rgba(244, 67, 54, 0.12) 0%, 
        rgba(229, 57, 53, 0.12) 100%);
    border-radius: 16px;
    margin: 0;
    font-size: 0.95rem;
    color: #C62828;
    font-weight: 600;
    line-height: 1.6;
    text-align: center;
    border: 1px solid rgba(244, 67, 54, 0.2);
    box-shadow: 0 4px 16px rgba(244, 67, 54, 0.1);
    backdrop-filter: blur(10px);
}

/* ========== 联系方式区域 ========== */
.contact-section {
    margin-top: 50px;
    text-align: center;
    padding: 0 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.contact-text {
    font-size: 0.95rem;
    color: #4a5568;
    line-height: 1.8;
    max-width: 680px;
    margin: 0 auto 30px;
    text-align: center;
}

.contact-text a {
    color: var(--welcome-theme-color, #667eea);
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    border-bottom: 1px solid transparent;
}

.contact-text a:hover {
    border-bottom-color: var(--welcome-theme-color, #667eea);
    opacity: 0.8;
}

.img-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 40px;
    margin-top: 30px;
    width: 100%;
}

.qr-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.3s ease;
}

.qr-item:hover {
    transform: translateY(-4px);
}

.qr-label {
    margin-top: 12px;
    font-size: 1rem;
    font-weight: 600;
    color: #2d3748;
    letter-spacing: 0.3px;
}

/* ========== 页脚 ========== */
.footer-section {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 24px;
    padding: 24px 20px;
    background: linear-gradient(180deg, 
        rgba(0, 0, 0, 0.02) 0%, 
        rgba(0, 0, 0, 0.05) 100%);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    flex-wrap: wrap;
}

.footer-links a,
.footer-police a {
    font-size: 13px;
    font-weight: 500;
    color: #718096;
    text-decoration: none;
    transition: all 0.3s ease;
    padding: 4px 8px;
    border-radius: 6px;
}

.footer-links a:hover,
.footer-police a:hover {
    color: var(--welcome-theme-color, #667eea);
    background: var(--welcome-theme-rgba-10, rgba(102, 126, 234, 0.1));
}

.footer-police {
    display: flex;
    align-items: center;
    gap: 8px;
}

.footer-police img {
    width: 20px;
    height: 20px;
    filter: grayscale(0.3);
    transition: filter 0.3s ease;
}

.footer-police:hover img {
    filter: grayscale(0);
}

/* ========== 动画定义 ========== */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes gradientShift {
    0%, 100% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

/* ========== 对话框样式 ========== */
.card {
    border-radius: 24px !important;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15),
                0 8px 24px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.95) !important;
    border: 1px solid rgba(255, 255, 255, 0.8);
}

.card-bottom-div {
    display: flex;
    gap: 12px;
}

.card-bottom-div .v-btn {
    border-radius: 12px !important;
    transition: all 0.3s ease;
}

.card-bottom-div .v-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* ========== PC 端样式 (min-width: 1000px) ========== */
@media screen and (min-width: 1000px) {
    .top-bar {
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: row;
        padding: 20px 40px;
        align-items: center;
        justify-content: space-between;
    }

    .top-btn-div {
        display: flex;
        flex-direction: row-reverse;
        gap: 20px;
    }

    .custom-nav-btn {
        font-size: 1.05rem;
        padding: 12px 24px;
    }

    .logo-margin {
        margin: 0;
        font-size: 2rem;
        cursor: default;
    }

    .full-center {
        width: 100%;
        padding: 30px 40px;
    }

    /* PC端：显示新布局，隐藏移动端布局 */
    .main-content {
        display: block;
        max-width: 1400px;
        margin: 0 auto;
        padding: 60px 40px;
    }

    .mobile-content {
        display: none;
    }

    /* PC端：主网格布局 */
    .main-grid {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 40px;
        margin: 50px 0;
    }

    .right-column {
        display: flex;
        flex-direction: column;
        gap: 30px;
    }

    /* PC端：功能展示卡片 */
    .features-section-card {
        padding: 45px;
    }

    .features-section-card .features-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-top: 30px;
    }

    .features-section-card .feature-item {
        padding: 28px 20px;
    }

    .features-section-card .feature-item .v-icon {
        font-size: 42px !important;
    }

    /* PC端：优势卡片 */
    .advantages-section-card {
        padding: 40px 35px;
    }

    /* PC端：CTA卡片 */
    .cta-section-card {
        padding: 45px 40px;
        text-align: center;
    }

    .dialog-card-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    }

    .card {
        padding: 32px;
        max-width: 650px;
        min-width: 450px;
    }

    .card-bottom-div {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        padding: 16px 0 0;
        margin-top: 20px;
        gap: 12px;
    }


    .intro-text-div {
        margin-top: 8px;
        width: fit-content;
        justify-self: center;
    }

    .column-btn-div {
        width: fit-content;
        display: flex;
        flex-direction: row;
        justify-self: center;
        gap: 16px;
    }


    .intro-btn {
        margin: 8px;
    }

    .img-container {
        width: fit-content;
        height: fit-content;
        justify-self: center;
        display: flex;
        gap: 50px;
        margin-top: 30px;
    }

    .img {
        height: 220px;
        width: 220px;
        border-radius: 20px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15),
                    0 4px 12px rgba(0, 0, 0, 0.1);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        border: 3px solid rgba(255, 255, 255, 0.8);
    }

    .img:hover {
        transform: scale(1.1) rotate(2deg);
        box-shadow: 0 16px 40px rgba(102, 126, 234, 0.3),
                    0 8px 16px rgba(0, 0, 0, 0.2);
        border-color: rgba(102, 126, 234, 0.5);
    }

    /* PC 端特定优化 */
    .main-content .hero-section {
        padding: 80px 60px 70px;
        margin-bottom: 60px;
        max-width: 100%;
        border-radius: 24px;
    }

    .hero-title {
        font-size: 5.5rem !important;
        margin-bottom: 20px !important;
    }

    .hero-subtitle {
        font-size: 2.4rem;
        margin-bottom: 24px;
    }

    .hero-description {
        font-size: 1.35rem;
        max-width: 720px;
    }

    /* PC端：提示信息网格 */
    .main-content .notices-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin: 40px 0;
    }

    /* PC端：联系方式区域 */
    .main-content .contact-section {
        margin-top: 50px;
        padding: 50px;
        background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%, 
            rgba(255, 255, 255, 0.85) 100%);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.8);
        border-radius: 24px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        align-items: center;
    }

    .main-content .contact-text {
        font-size: 1rem;
        max-width: 720px;
    }

    .main-content .img-container {
        justify-content: center;
        margin-top: 30px;
    }

    .section-title-small {
        font-size: 1.8rem;
        margin-bottom: 24px;
    }

    .section-title {
        font-size: 2.2rem;
        margin-bottom: 32px;
    }

    .section-subtitle {
        font-size: 1.8rem;
        margin-bottom: 24px;
    }

    .advantage-item {
        font-size: 1.05rem;
        padding: 14px;
    }

    .cta-section {
        margin: 40px 0;
    }

    /* PC 端：提示信息并排显示 */
    .notices-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin: 30px 0;
    }

    .test-notice,
    .legal-notice {
        margin: 0;
    }

    .cta-btn {
        font-size: 1.4rem !important;
        padding: 22px 64px !important;
        line-height: 1.5 !important;
    }

    .cta-hint {
        font-size: 1.05rem;
        margin-top: 16px;
    }

    .test-notice {
        padding: 20px 32px;
        margin: 28px 0;
        font-size: 1.05rem;
    }

    .legal-notice {
        padding: 18px 32px;
        margin: 24px 0;
        font-size: 1rem;
    }

    .contact-section {
        margin-top: 60px;
        padding: 0 20px;
    }

    .contact-section .text-tiny {
        font-size: 1rem;
        line-height: 1.8;
    }

    .footer-section {
        padding: 30px 40px;
    }
}

/* ========== 移动端样式 (max-width: 1000px) ========== */
@media screen and (max-width: 1000px) {
    /* 移动端：显示移动端布局，隐藏PC端布局 */
    .main-content {
        display: none;
    }

    .mobile-content {
        display: block;
    }
    .top-bar {
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: row;
        padding: 12px 16px;
        align-items: center;
        justify-content: space-between;
        position: sticky;
        top: 0;
        z-index: 100;
    }

    .top-btn-div {
        display: flex;
        flex-direction: row-reverse;
        gap: 6px;
        flex: 1;
        justify-content: flex-end;
    }

    .custom-nav-btn {
        font-size: 0.9rem;
        padding: 8px 16px;
    }

    .logo-margin {
        margin: 0;
        font-size: 1.5rem;
        flex-shrink: 0;
    }

    .full-center {
        width: 100vw;
        display: grid;
        justify-content: center;
        padding: 12px;
    }

    .dialog-card-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 12px;
    }

    .card {
        padding: 24px 18px;
        max-width: 92vw;
        width: 100%;
        border-radius: 20px !important;
    }

    .card-bottom-div {
        display: flex;
        flex-direction: column;
        padding: 12px 0 0;
        margin-top: 20px;
        gap: 10px;
    }

    .card-bottom-div .v-btn {
        width: 100%;
        border-radius: 12px !important;
    }

    .intro-card {
        margin-top: 50px;
        margin-bottom: 30px;
        max-width: 96vw;
        padding: 24px 18px;
        height: fit-content;
        display: grid;
        justify-content: center;
        flex-direction: column;
        border-radius: 24px !important;
    }

    .intro-text-div {
        margin-top: 6px;
        width: fit-content;
        justify-self: center;
    }

    .column-div {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-self: center;
    }

    .column-btn-div {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-self: center;
        gap: 12px;
    }

    .column-btn-div .v-btn {
        width: 100%;
    }

    .intro-btn {
        margin: 6px 0;
    }

    .img-container {
        margin-top: 24px;
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 28px;
    }

    .img {
        height: 160px;
        width: 160px;
        border-radius: 16px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12),
                    0 2px 8px rgba(0, 0, 0, 0.08);
        border: 2px solid rgba(255, 255, 255, 0.8);
    }

    /* 移动端特定优化 */
    .hero-section {
        padding: 40px 20px 35px;
        margin-bottom: 30px;
        border-radius: 20px;
    }

    .hero-title {
        font-size: 2.8rem !important;
        line-height: 1.1;
        margin-bottom: 16px !important;
    }

    .hero-subtitle {
        font-size: 1.5rem;
        margin-bottom: 16px;
    }

    .hero-description {
        font-size: 1rem;
        padding: 0 8px;
        line-height: 1.7;
    }

    .features-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
        margin: 30px 0;
        padding: 0 8px;
    }

    .feature-item {
        padding: 24px 14px;
        border-radius: 16px;
    }

    .feature-item .v-icon {
        font-size: 36px !important;
    }

    .feature-title {
        font-size: 1.05rem;
        margin: 14px 0 8px;
    }

    .feature-desc {
        font-size: 0.9rem;
        line-height: 1.5;
    }

    .advantages-section {
        margin: 35px 0;
        padding: 24px 18px;
        border-radius: 20px;
    }

    .section-title {
        font-size: 1.5rem;
        margin-bottom: 20px;
    }

    .section-subtitle {
        font-size: 1.35rem;
        margin-bottom: 16px;
    }

    .advantage-list {
        gap: 14px;
    }

    .advantage-item {
        font-size: 0.95rem;
        gap: 12px;
        align-items: flex-start;
        padding: 10px;
    }

    .advantage-item .v-icon {
        font-size: 22px !important;
        margin-top: 2px;
    }

    .cta-section {
        margin: 35px 0;
    }

    .cta-primary {
        margin-bottom: 18px;
    }

    .cta-btn {
        font-size: 1.1rem !important;
        padding: 16px 36px !important;
        width: 100%;
        max-width: 320px;
        border-radius: 14px !important;
        line-height: 1.5 !important;
    }

    .cta-hint {
        font-size: 0.9rem;
        margin-top: 10px;
    }

    .cta-secondary {
        gap: 12px;
    }

    .secondary-btn {
        width: 100%;
        max-width: 280px;
        border-radius: 12px !important;
    }

    .test-notice {
        padding: 16px 20px;
        margin: 20px 0;
        font-size: 0.9rem;
        flex-wrap: wrap;
        text-align: center;
        border-radius: 14px;
    }

    .test-notice .v-icon {
        font-size: 20px !important;
    }

    .legal-notice {
        padding: 14px 20px;
        margin: 16px 0;
        font-size: 0.85rem;
        flex-wrap: wrap;
        border-radius: 14px;
    }

    .legal-notice .v-icon {
        font-size: 18px !important;
    }

    .contact-section {
        margin-top: 35px;
        padding: 0 8px;
        align-items: center;
    }

    .contact-text {
        font-size: 0.9rem;
        line-height: 1.7;
        padding: 0 8px;
        max-width: 100%;
    }

    .mobile-content .img-container {
        justify-content: center;
        align-items: center;
    }

    .qr-label {
        font-size: 0.95rem;
        margin-top: 10px;
    }

    .footer-section {
        flex-direction: column;
        gap: 12px;
        padding: 20px 16px;
        text-align: center;
    }

    .footer-links a,
    .footer-police a {
        font-size: 12px;
        padding: 6px 10px;
    }

    .download-btn {
        width: 100%;
        margin: 6px 0;
        border-radius: 12px !important;
    }
}
</style>
