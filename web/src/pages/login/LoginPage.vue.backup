<template>
    <div class="login-page-container">
        <canvas class="background" id="canvas"></canvas>
        <div class="login-content-wrapper">
            <v-dialog v-model="ifShowDialog" class="full-screen dialog">
                <div class="dialog-content">
                    <email-examine-card @close="setEmailExamineCardState(false)" :init-data="examineCardInfo"
                        @alert="alert" @set_loading="setLoading" v-if="ifShowEmailExamineCard"></email-examine-card>
                </div>
            </v-dialog>
            <!-- PC端：左右分栏布局 -->
            <div v-if="!ifMobile" class="pc-login-layout">
                <!-- 左侧：功能预览轮播 -->
                <div class="carousel-section">
                    <v-carousel
                        v-model="carouselModel"
                        :continuous="true"
                        :show-arrows="true"
                        :hide-delimiters="false"
                        :cycle="true"
                        :interval="4000"
                        height="100%"
                        class="feature-carousel"
                        :color="themeColor">
                        <v-carousel-item v-for="(slide, index) in carouselSlides" :key="index">
                            <div class="carousel-slide" :style="{ background: slide.background }">
                                <div class="slide-content">
                                    <div class="slide-icon-wrapper">
                                        <div class="icon-circle" :style="{ 
                                            'border-color': `${slide.accentColor || themeColor}40`,
                                            'box-shadow': `0 8px 24px ${slide.accentColor || themeColor}33, inset 0 2px 8px rgba(255, 255, 255, 0.3)`,
                                            'background': `linear-gradient(135deg, ${slide.accentColor || themeColor}20 0%, ${slide.accentColor || themeColor}15 100%)`
                                        }">
                                            <v-icon :color="slide.accentColor || themeColor" :size="64" class="slide-icon">{{ slide.icon }}</v-icon>
                                        </div>
                                    </div>
                                    <h2 class="slide-title">{{ slide.title }}</h2>
                                    <p class="slide-subtitle">{{ slide.subtitle }}</p>
                                    <p class="slide-description">{{ slide.description }}</p>
                                    
                                    <!-- 功能特性列表 -->
                                    <div v-if="slide.features" class="slide-features">
                                        <div v-for="(feature, idx) in slide.features" :key="idx" class="feature-item">
                                            <v-icon :color="slide.accentColor || themeColor" size="24" class="feature-icon">{{ feature.icon }}</v-icon>
                                            <span class="feature-text">{{ feature.text }}</span>
                                        </div>
                                    </div>
                                    
                                    <!-- 优势列表 -->
                                    <div v-if="slide.advantages" class="slide-advantages">
                                        <div v-for="(advantage, idx) in slide.advantages" :key="idx" class="advantage-item">
                                            <div class="advantage-header">
                                                <v-icon :color="slide.accentColor || themeColor" size="22" class="advantage-icon">{{ advantage.icon }}</v-icon>
                                                <span class="advantage-title">{{ advantage.text }}</span>
                                            </div>
                                            <p class="advantage-desc">{{ advantage.desc }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </v-carousel-item>
                    </v-carousel>
                </div>
                <!-- 右侧：登录/注册表单 -->
                <div class="form-section">
                    <v-card class="card login-card" elevation="8">
                    <v-tabs v-model="nowTab" :bg-color="themeColor" fixed-tabs class="login-tabs">
                        <v-tab 
                            value="login" 
                            class="custom-tab"
                            :class="{ 'tab-active': nowTab === 'login' }">
                            <v-icon size="20" style="margin-right:5px;margin-top:3px;" class="tab-icon">mdi-login</v-icon>
                            <span class="tab-text">登录</span>
                        </v-tab>
                        <v-tab 
                            value="register" 
                            class="custom-tab"
                            :class="{ 'tab-active': nowTab === 'register' }">
                            <v-icon size="20" style="margin-right:5px;margin-top:3px;" class="tab-icon">mdi-account-plus</v-icon>
                            <span class="tab-text">注册</span>
                        </v-tab>
                    </v-tabs>
                    <v-tabs-window v-model="nowTab">
                        <!-- login by userName -->
                        <v-tabs-window-item v-if="loginMethod === 'userName'" title="登录" value="login">
                            <sensitive-text-field v-model="loginByUsernameData.userName" :rules="[loginRules.userName]"
                                class="input" :density="inputType" variant="solo-filled" label="用户名"
                                prepend-inner-icon="mdi-account"></sensitive-text-field>
                            <sensitive-text-field class="input" v-model="loginByUsernameData.passwd"
                                :append-inner-icon="passwdVisible ? 'mdi-eye-off' : 'mdi-eye'"
                                :type="passwdVisible ? 'text' : 'password'" :density="inputType"
                                :rules="[loginRules.password]" placeholder="输入密码" prepend-inner-icon="mdi-lock-outline"
                                variant="solo-filled" label="输入密码"
                                @click:append-inner="passwdVisible = !passwdVisible"></sensitive-text-field>
                            <v-btn 
                                @click="loginByUsername()" 
                                class="login-btn" 
                                variant="flat"
                                :disabled="!(valUserName(loginByUsernameData.userName) && valPassWord(loginByUsernameData.passwd))"
                                :loading="loading.login"
                                :color="themeColor"
                                size="large"
                                rounded="lg">
                                <v-icon size="20" style="margin-right:5px;margin-top:3px;" class="mr-2">mdi-login</v-icon>
                                登录
                            </v-btn>
                        </v-tabs-window-item>
                        <!-- login by email  -->
                        <v-tabs-window-item v-if="loginMethod === 'email'" title="登录" value="login">
                            <sensitive-text-field v-model="loginByEmailData.email" class="input"
                                :rules="[loginRules.email]" :density="inputType" variant="solo-filled" label="邮箱"
                                prepend-inner-icon="mdi-email"></sensitive-text-field>
                            <v-btn 
                                @click="loginByEmail()" 
                                class="login-btn" 
                                variant="flat" 
                                :color="themeColor"
                                :disabled="!valEmail(loginByEmailData.email)"
                                size="large"
                                rounded="lg">
                                <v-icon size="20" style="margin-right:5px;margin-top:3px;" class="mr-2">mdi-email</v-icon>
                                登录
                            </v-btn>
                        </v-tabs-window-item>
                        <!-- register by email STEP 1 -->
                        <v-tabs-window-item v-if="registerMethod === 'email' && registerByEmailStep === 0" title="注册"
                            value="register">
                            <div class="text-small tip-text-container">
                                <span>团体/组织/毕业生请联系管理员获取验证码</span>
                            </div>
                            <sensitive-text-field v-model="registerByEmailData.userName"
                                prepend-inner-icon="mdi-account" class="input" :rules="[loginRules.userName]"
                                :density="inputType" variant="solo-filled" label="用户名" :hint="'起一个喜欢的名称(此名称将作为登陆依据之一)'"></sensitive-text-field>
                            <sensitive-text-field class="input" v-model="registerByEmailData.passwd"
                                :append-inner-icon="passwdVisible ? 'mdi-eye-off' : 'mdi-eye'"
                                :type="passwdVisible ? 'text' : 'password'" :density="inputType"
                                :rules="[loginRules.password]" placeholder="输入密码" prepend-inner-icon="mdi-lock-outline"
                                variant="solo-filled" label="密码"
                                @click:append-inner="passwdVisible = !passwdVisible"></sensitive-text-field>
                            <sensitive-text-field class="input" v-model="registerByEmailData.passwdConfirm"
                                :append-inner-icon="passwdVisible ? 'mdi-eye-off' : 'mdi-eye'"
                                :type="passwdVisible ? 'text' : 'password'" :density="inputType"
                                :rules="[loginRules.password]" placeholder="确认密码" prepend-inner-icon="mdi-lock-outline"
                                variant="solo-filled" label="确认密码"
                                @click:append-inner="passwdVisible = !passwdVisible"></sensitive-text-field>
                            <v-btn 
                                @click="step" 
                                class="login-btn" 
                                variant="flat" 
                                :color="themeColor"
                                :disabled="!(valUserName(registerByEmailData.userName) && valPassWord(registerByEmailData.passwd) && valPassWord(registerByEmailData.passwdConfirm))"
                                size="large"
                                rounded="lg">
                                <v-icon size="20" style="margin-right:5px;margin-top:3px;" class="mr-2">mdi-arrow-right</v-icon>
                                下一步
                            </v-btn>
                        </v-tabs-window-item>
                        <!-- register by email STEP 2 -->
                        <v-tabs-window-item v-if="registerMethod === 'email' && registerByEmailStep === 1" title="注册"
                            value="register">
                            <div class="text-small-bold tip-text-container">
                                <span>注：当前仅对山东大学开放，校区，学院，专业均为选填</span>
                            </div>
                            <div class="row-center-div">
                                <v-select class="select-input" v-model="registerByEmailData.campus"
                                    variant="solo-filled" density="compact" :items="campusList" label="校区" hide-details="true"></v-select>
                                <v-autocomplete class="select-input" v-model="registerByEmailData.college"
                                    variant="solo-filled" density="compact" :items="collegeList" label="学院" hide-details="true"></v-autocomplete>
                                <sensitive-text-field class="select-input" v-model="registerByEmailData.major"
                                    :density="inputType" variant="solo-filled" label="专业" hide-details="true"></sensitive-text-field>
                            </div>
                            <sensitive-text-field v-model="registerByEmailData.email" class="input"
                                :rules="[loginRules.email]" :density="inputType" variant="solo-filled"
                                prepend-inner-icon="mdi-email" label="校园邮箱(以@mail.sdu.edu.cn结尾)"></sensitive-text-field>
                            <div class="text-tiny agreement-text-container" style="width: 100%;display: flex;flex-direction: row;">
                                <v-spacer></v-spacer>
                                <span @click="toUrl('https://info.sdu.edu.cn/info/1007/1530.htm')" style="margin-right: 20px;">
                                    <strong style="color: grey; text-decoration: underline;">什么是校园邮箱？</strong>
                                </span>
                            </div>
                            <div class="text-small agreement-text-container">
                                注册即代表您已阅读并同意
                                <span @click="toUrl('/#/document/to_know')">
                                    <strong style="color: #0074e8; text-decoration: underline;">入站须知</strong>
                                </span>与
                                <span @click="toUrl('/#/document/privacy')">
                                    <strong style="color: #0074e8; text-decoration: underline;">隐私政策</strong>
                                </span>
                            </div>
                            <div class="row-center-div">
                                <v-btn 
                                    @click="stepBack" 
                                    class="last-step-btn" 
                                    variant="outlined"
                                    :color="themeColor"
                                    rounded="lg">
                                    <v-icon size="18" class="mr-1">mdi-arrow-left</v-icon>
                                    上一步
                                </v-btn>
                                <v-btn 
                                    @click="registerByEmail" 
                                    class="register-btn" 
                                    variant="flat"
                                    :color="themeColor" 
                                    :disabled="!valEmail(registerByEmailData.email)"
                                    rounded="lg">
                                    <v-icon size="18" class="mr-1">mdi-account-plus</v-icon>
                                    注册
                                </v-btn>
                            </div>
                        </v-tabs-window-item>
                        <!-- register by invite STEP 1 -->
                        <v-tabs-window-item v-if="registerMethod === 'invite' && registerByInviteStep === 0" title="注册"
                            value="register">
                            <div class="text-small tip-text-container">
                                <span>团体/组织/毕业生请联系管理员获取验证码</span>
                            </div>
                            <sensitive-text-field v-model="registerByInviteData.userName" class="input"
                                :rules="[loginRules.userName]" prepend-inner-icon="mdi-account" :density="inputType"
                                variant="solo-filled" label="用户名" :hint="'起一个喜欢的名称(此名称将作为登陆依据之一)'"></sensitive-text-field>
                            <sensitive-text-field class="input" v-model="registerByInviteData.passwd"
                                :append-inner-icon="passwdVisible ? 'mdi-eye-off' : 'mdi-eye'"
                                :type="passwdVisible ? 'text' : 'password'" :density="inputType"
                                :rules="[loginRules.password]" placeholder="输入密码" prepend-inner-icon="mdi-lock-outline"
                                variant="solo-filled" label="密码"
                                @click:append-inner="passwdVisible = !passwdVisible"></sensitive-text-field>
                            <sensitive-text-field class="input" v-model="registerByInviteData.passwdConfirm"
                                :append-inner-icon="passwdVisible ? 'mdi-eye-off' : 'mdi-eye'"
                                :type="passwdVisible ? 'text' : 'password'" :density="inputType"
                                :rules="[loginRules.password]" placeholder="确认密码" prepend-inner-icon="mdi-lock-outline"
                                variant="solo-filled" label="确认密码"
                                @click:append-inner="passwdVisible = !passwdVisible"></sensitive-text-field>
                            <v-btn 
                                @click="step" 
                                class="login-btn" 
                                variant="flat" 
                                :color="themeColor"
                                :disabled="!(valUserName(registerByInviteData.userName) && valPassWord(registerByInviteData.passwd) && valPassWord(registerByInviteData.passwdConfirm))"
                                size="large"
                                rounded="lg">
                                <v-icon size="20" style="margin-right:5px;margin-top:3px;" class="mr-2">mdi-arrow-right</v-icon>
                                下一步
                            </v-btn>
                        </v-tabs-window-item>
                        <!-- register by invite STEP2 -->
                        <v-tabs-window-item v-if="registerMethod === 'invite' && registerByInviteStep === 1" title="注册"
                            value="register">
                            <div class="text-small-bold tip-text-container">
                                <span>注：校区，学院，专业均为选填</span>
                            </div>
                            <div class="row-center-div">
                                <v-select class="select-input" v-model="registerByInviteData.campus"
                                    variant="solo-filled" density="compact" :items="campusList" label="校区"></v-select>
                                <v-autocomplete class="select-input" v-model="registerByInviteData.college"
                                    variant="solo-filled" density="compact" :items="collegeList" label="学院"></v-autocomplete>
                                <sensitive-text-field class="select-input" v-model="registerByInviteData.major"
                                    :density="inputType" variant="solo-filled" label="专业"></sensitive-text-field>
                            </div>
                            <sensitive-text-field v-model="registerByInviteData.email"
                                prepend-inner-icon="mdi-email" class="input"
                                :density="inputType" variant="solo-filled" label="绑定邮箱"></sensitive-text-field>
                            <sensitive-text-field v-model="registerByInviteData.inviteCode" class="input" :density="inputType"
                                variant="solo-filled" label="输入邀请码"></sensitive-text-field>
                            <div class="text-small agreement-text-container">
                                注册即代表您已阅读并同意
                                <span @click="toUrl('/#/document/to_know')">
                                    <strong style="color: #0074e8; text-decoration: underline;">入站须知</strong>
                                </span>与
                                <span @click="toUrl('/#/document/privacy')">
                                    <strong style="color: #0074e8; text-decoration: underline;">隐私政策</strong>
                                </span>
                            </div>
                            <div class="row-center-div">
                                <v-btn 
                                    @click="stepBack" 
                                    class="last-step-btn" 
                                    variant="outlined"
                                    :color="themeColor"
                                    rounded="lg">
                                    <v-icon size="18" class="mr-1">mdi-arrow-left</v-icon>
                                    上一步
                                </v-btn>
                                <v-btn 
                                    @click="registerByInvite" 
                                    class="register-btn" 
                                    variant="flat"
                                    :color="themeColor"
                                    rounded="lg">
                                    <v-icon size="18" class="mr-1">mdi-account-plus</v-icon>
                                    注册
                                </v-btn>
                            </div>
                        </v-tabs-window-item>
                        <div v-if="nowTab === 'login'" class="bottom-bar">
                            <v-btn 
                                @click="shiftLoginMethod" 
                                class="switch-method-btn" 
                                density="compact" 
                                variant="text"
                                :color="themeColor">
                                <v-icon size="16" style="margin-top:1px;margin-right: 2px;" class="mr-1">{{ loginMethod == 'userName' ? 'mdi-email' : 'mdi-account' }}</v-icon>
                                {{ loginMethod == 'userName' ? '使用邮箱登录' : '使用用户名登录' }}
                            </v-btn>
                            <v-spacer></v-spacer>
                            <agree-button v-if="loginMethod == 'userName'" @agree="handleAgree"></agree-button>
                        </div>
                        <div v-if="nowTab === 'register'" class="bottom-bar">
                            <v-btn 
                                @click="shiftRegisterMethod" 
                                class="switch-method-btn" 
                                density="compact" 
                                variant="text"
                                :color="themeColor">
                                <v-icon size="16" style="margin-top:1px;margin-right: 2px;" class="mr-1">{{ registerMethod == 'email' ? 'mdi-key' : 'mdi-email' }}</v-icon>
                                {{ registerMethod == 'email' ? '使用邀请码注册' : '使用邮箱注册' }}
                            </v-btn>
                        </div>
                    </v-tabs-window>
                    </v-card>
                    <v-btn 
                        @click="toUrl('/#/')" 
                        :color="themeColor" 
                        class="return-welcome-btn" 
                        variant="text"
                        rounded="lg">
                        <v-icon size="18" class="mr-1">mdi-home</v-icon>
                        返回首页
                    </v-btn>
                </div>
            </div>
            <!-- 移动端：保持原有布局 -->
            <div v-else class="full-center mobile-login-layout">
                <v-card class="card login-card" elevation="8">
                    <v-tabs v-model="nowTab" :bg-color="themeColor" fixed-tabs class="login-tabs">
                        <v-tab 
                            value="login" 
                            class="custom-tab"
                            :class="{ 'tab-active': nowTab === 'login' }">
                            <v-icon size="20" style="margin-right:5px;margin-top:3px;" class="tab-icon">mdi-login</v-icon>
                            <span class="tab-text">登录</span>
                        </v-tab>
                        <v-tab 
                            value="register" 
                            class="custom-tab"
                            :class="{ 'tab-active': nowTab === 'register' }">
                            <v-icon size="20" style="margin-right:5px;margin-top:3px;" class="tab-icon">mdi-account-plus</v-icon>
                            <span class="tab-text">注册</span>
                        </v-tab>
                    </v-tabs>
                    <v-tabs-window v-model="nowTab">
                        <!-- login by userName -->
                        <v-tabs-window-item v-if="loginMethod === 'userName'" title="登录" value="login">
                            <sensitive-text-field v-model="loginByUsernameData.userName" :rules="[loginRules.userName]"
                                class="input" :density="inputType" variant="solo-filled" label="用户名"
                                prepend-inner-icon="mdi-account"></sensitive-text-field>
                            <sensitive-text-field class="input" v-model="loginByUsernameData.passwd"
                                :append-inner-icon="passwdVisible ? 'mdi-eye-off' : 'mdi-eye'"
                                :type="passwdVisible ? 'text' : 'password'" :density="inputType"
                                :rules="[loginRules.password]" placeholder="输入密码" prepend-inner-icon="mdi-lock-outline"
                                variant="solo-filled" label="输入密码"
                                @click:append-inner="passwdVisible = !passwdVisible"></sensitive-text-field>
                            <v-btn 
                                @click="loginByUsername()" 
                                class="login-btn" 
                                variant="flat"
                                :disabled="!(valUserName(loginByUsernameData.userName) && valPassWord(loginByUsernameData.passwd))"
                                :loading="loading.login"
                                :color="themeColor"
                                size="large"
                                rounded="lg">
                                <v-icon size="20" style="margin-right:5px;margin-top:3px;" class="mr-2">mdi-login</v-icon>
                                登录
                            </v-btn>
                        </v-tabs-window-item>
                        <!-- login by email  -->
                        <v-tabs-window-item v-if="loginMethod === 'email'" title="登录" value="login">
                            <sensitive-text-field v-model="loginByEmailData.email" class="input"
                                :rules="[loginRules.email]" :density="inputType" variant="solo-filled" label="邮箱"
                                prepend-inner-icon="mdi-email"></sensitive-text-field>
                            <v-btn 
                                @click="loginByEmail()" 
                                class="login-btn" 
                                variant="flat" 
                                :color="themeColor"
                                :disabled="!valEmail(loginByEmailData.email)"
                                size="large"
                                rounded="lg">
                                <v-icon size="20" style="margin-right:5px;margin-top:3px;" class="mr-2">mdi-email</v-icon>
                                登录
                            </v-btn>
                        </v-tabs-window-item>
                        <!-- register by email STEP 1 -->
                        <v-tabs-window-item v-if="registerMethod === 'email' && registerByEmailStep === 0" title="注册"
                            value="register">
                            <div class="text-small tip-text-container">
                                <span>团体/组织/毕业生请联系管理员获取验证码</span>
                            </div>
                            <sensitive-text-field v-model="registerByEmailData.userName"
                                prepend-inner-icon="mdi-account" class="input" :rules="[loginRules.userName]"
                                :density="inputType" variant="solo-filled" label="用户名" :hint="'起一个喜欢的名称(此名称将作为登陆依据之一)'"></sensitive-text-field>
                            <sensitive-text-field class="input" v-model="registerByEmailData.passwd"
                                :append-inner-icon="passwdVisible ? 'mdi-eye-off' : 'mdi-eye'"
                                :type="passwdVisible ? 'text' : 'password'" :density="inputType"
                                :rules="[loginRules.password]" placeholder="输入密码" prepend-inner-icon="mdi-lock-outline"
                                variant="solo-filled" label="密码"
                                @click:append-inner="passwdVisible = !passwdVisible"></sensitive-text-field>
                            <sensitive-text-field class="input" v-model="registerByEmailData.passwdConfirm"
                                :append-inner-icon="passwdVisible ? 'mdi-eye-off' : 'mdi-eye'"
                                :type="passwdVisible ? 'text' : 'password'" :density="inputType"
                                :rules="[loginRules.password]" placeholder="确认密码" prepend-inner-icon="mdi-lock-outline"
                                variant="solo-filled" label="确认密码"
                                @click:append-inner="passwdVisible = !passwdVisible"></sensitive-text-field>
                            <v-btn 
                                @click="step" 
                                class="login-btn" 
                                variant="flat" 
                                :color="themeColor"
                                :disabled="!(valUserName(registerByEmailData.userName) && valPassWord(registerByEmailData.passwd) && valPassWord(registerByEmailData.passwdConfirm))"
                                size="large"
                                rounded="lg">
                                <v-icon size="20" style="margin-right:5px;margin-top:3px;" class="mr-2">mdi-arrow-right</v-icon>
                                下一步
                            </v-btn>
                        </v-tabs-window-item>
                        <!-- register by email STEP 2 -->
                        <v-tabs-window-item v-if="registerMethod === 'email' && registerByEmailStep === 1" title="注册"
                            value="register">
                            <div class="text-small-bold tip-text-container">
                                <span>注：当前仅对山东大学开放，校区，学院，专业均为选填</span>
                            </div>
                            <div class="row-center-div">
                                <v-select class="select-input" v-model="registerByEmailData.campus"
                                    variant="solo-filled" density="compact" :items="campusList" label="校区" hide-details="true"></v-select>
                                <v-autocomplete class="select-input" v-model="registerByEmailData.college"
                                    variant="solo-filled" density="compact" :items="collegeList" label="学院" hide-details="true"></v-autocomplete>
                                <sensitive-text-field class="select-input" v-model="registerByEmailData.major"
                                    :density="inputType" variant="solo-filled" label="专业" hide-details="true"></sensitive-text-field>
                            </div>
                            <sensitive-text-field v-model="registerByEmailData.email" class="input"
                                :rules="[loginRules.email]" :density="inputType" variant="solo-filled"
                                prepend-inner-icon="mdi-email" label="校园邮箱(以@mail.sdu.edu.cn结尾)"></sensitive-text-field>
                            <div class="text-tiny agreement-text-container" style="width: 100%;display: flex;flex-direction: row;">
                                <v-spacer></v-spacer>
                                <span @click="toUrl('https://info.sdu.edu.cn/info/1007/1530.htm')" style="margin-right: 20px;">
                                    <strong style="color: grey; text-decoration: underline;">什么是校园邮箱？</strong>
                                </span>
                            </div>
                            <div class="text-small agreement-text-container">
                                注册即代表您已阅读并同意
                                <span @click="toUrl('/#/document/to_know')">
                                    <strong style="color: #0074e8; text-decoration: underline;">入站须知</strong>
                                </span>与
                                <span @click="toUrl('/#/document/privacy')">
                                    <strong style="color: #0074e8; text-decoration: underline;">隐私政策</strong>
                                </span>
                            </div>
                            <div class="row-center-div">
                                <v-btn 
                                    @click="stepBack" 
                                    class="last-step-btn" 
                                    variant="outlined"
                                    :color="themeColor"
                                    rounded="lg">
                                    <v-icon size="18" class="mr-1">mdi-arrow-left</v-icon>
                                    上一步
                                </v-btn>
                                <v-btn 
                                    @click="registerByEmail" 
                                    class="register-btn" 
                                    variant="flat"
                                    :color="themeColor" 
                                    :disabled="!valEmail(registerByEmailData.email)"
                                    rounded="lg">
                                    <v-icon size="18" class="mr-1">mdi-account-plus</v-icon>
                                    注册
                                </v-btn>
                            </div>
                        </v-tabs-window-item>
                        <!-- register by invite STEP 1 -->
                        <v-tabs-window-item v-if="registerMethod === 'invite' && registerByInviteStep === 0" title="注册"
                            value="register">
                            <div class="text-small tip-text-container">
                                <span>团体/组织/毕业生请联系管理员获取验证码</span>
                            </div>
                            <sensitive-text-field v-model="registerByInviteData.userName" class="input"
                                :rules="[loginRules.userName]" prepend-inner-icon="mdi-account" :density="inputType"
                                variant="solo-filled" label="用户名" :hint="'起一个喜欢的名称(此名称将作为登陆依据之一)'"></sensitive-text-field>
                            <sensitive-text-field class="input" v-model="registerByInviteData.passwd"
                                :append-inner-icon="passwdVisible ? 'mdi-eye-off' : 'mdi-eye'"
                                :type="passwdVisible ? 'text' : 'password'" :density="inputType"
                                :rules="[loginRules.password]" placeholder="输入密码" prepend-inner-icon="mdi-lock-outline"
                                variant="solo-filled" label="密码"
                                @click:append-inner="passwdVisible = !passwdVisible"></sensitive-text-field>
                            <sensitive-text-field class="input" v-model="registerByInviteData.passwdConfirm"
                                :append-inner-icon="passwdVisible ? 'mdi-eye-off' : 'mdi-eye'"
                                :type="passwdVisible ? 'text' : 'password'" :density="inputType"
                                :rules="[loginRules.password]" placeholder="确认密码" prepend-inner-icon="mdi-lock-outline"
                                variant="solo-filled" label="确认密码"
                                @click:append-inner="passwdVisible = !passwdVisible"></sensitive-text-field>
                            <v-btn 
                                @click="step" 
                                class="login-btn" 
                                variant="flat" 
                                :color="themeColor"
                                :disabled="!(valUserName(registerByInviteData.userName) && valPassWord(registerByInviteData.passwd) && valPassWord(registerByInviteData.passwdConfirm))"
                                size="large"
                                rounded="lg">
                                <v-icon size="20" style="margin-right:5px;margin-top:3px;" class="mr-2">mdi-arrow-right</v-icon>
                                下一步
                            </v-btn>
                        </v-tabs-window-item>
                        <!-- register by invite STEP2 -->
                        <v-tabs-window-item v-if="registerMethod === 'invite' && registerByInviteStep === 1" title="注册"
                            value="register">
                            <div class="text-small-bold tip-text-container">
                                <span>注：校区，学院，专业均为选填</span>
                            </div>
                            <div class="row-center-div">
                                <v-select class="select-input" v-model="registerByInviteData.campus"
                                    variant="solo-filled" density="compact" :items="campusList" label="校区"></v-select>
                                <v-autocomplete class="select-input" v-model="registerByInviteData.college"
                                    variant="solo-filled" density="compact" :items="collegeList" label="学院"></v-autocomplete>
                                <sensitive-text-field class="select-input" v-model="registerByInviteData.major"
                                    :density="inputType" variant="solo-filled" label="专业"></sensitive-text-field>
                            </div>
                            <sensitive-text-field v-model="registerByInviteData.email"
                                prepend-inner-icon="mdi-email" class="input"
                                :density="inputType" variant="solo-filled" label="绑定邮箱"></sensitive-text-field>
                            <sensitive-text-field v-model="registerByInviteData.inviteCode" class="input" :density="inputType"
                                variant="solo-filled" label="输入邀请码"></sensitive-text-field>
                            <div class="text-small agreement-text-container">
                                注册即代表您已阅读并同意
                                <span @click="toUrl('/#/document/to_know')">
                                    <strong style="color: #0074e8; text-decoration: underline;">入站须知</strong>
                                </span>与
                                <span @click="toUrl('/#/document/privacy')">
                                    <strong style="color: #0074e8; text-decoration: underline;">隐私政策</strong>
                                </span>
                            </div>
                            <div class="row-center-div">
                                <v-btn 
                                    @click="stepBack" 
                                    class="last-step-btn" 
                                    variant="outlined"
                                    :color="themeColor"
                                    rounded="lg">
                                    <v-icon size="18" class="mr-1">mdi-arrow-left</v-icon>
                                    上一步
                                </v-btn>
                                <v-btn 
                                    @click="registerByInvite" 
                                    class="register-btn" 
                                    variant="flat"
                                    :color="themeColor"
                                    rounded="lg">
                                    <v-icon size="18" class="mr-1">mdi-account-plus</v-icon>
                                    注册
                                </v-btn>
                            </div>
                        </v-tabs-window-item>
                        <div v-if="nowTab === 'login'" class="bottom-bar">
                            <v-btn 
                                @click="shiftLoginMethod" 
                                class="switch-method-btn" 
                                density="compact" 
                                variant="text"
                                :color="themeColor">
                                <v-icon size="16" style="margin-top:1px;margin-right: 2px;" class="mr-1">{{ loginMethod == 'userName' ? 'mdi-email' : 'mdi-account' }}</v-icon>
                                {{ loginMethod == 'userName' ? '使用邮箱登录' : '使用用户名登录' }}
                            </v-btn>
                            <v-spacer></v-spacer>
                            <agree-button v-if="loginMethod == 'userName'" @agree="handleAgree"></agree-button>
                        </div>
                        <div v-if="nowTab === 'register'" class="bottom-bar">
                            <v-btn 
                                @click="shiftRegisterMethod" 
                                class="switch-method-btn" 
                                density="compact" 
                                variant="text"
                                :color="themeColor">
                                <v-icon size="16" style="margin-top:1px;margin-right: 2px;" class="mr-1">{{ registerMethod == 'email' ? 'mdi-key' : 'mdi-email' }}</v-icon>
                                {{ registerMethod == 'email' ? '使用邀请码注册' : '使用邮箱注册' }}
                            </v-btn>
                        </div>
                    </v-tabs-window>
                </v-card>
                <v-btn 
                    @click="toUrl('/#/')" 
                    :color="themeColor" 
                    class="return-welcome-btn" 
                    variant="text"
                    rounded="lg">
                    <v-icon size="18" class="mr-1">mdi-home</v-icon>
                    返回首页
                </v-btn>
            </div>
        </div>
    </div>
</template>
<script>
import { globalProperties } from '@/main';
import EmailExamineCard from '@/components/user/EmailExamineCard.vue';
import SensitiveTextField from '@/components/common/SensitiveTextField.vue';
import { computed, ref } from 'vue';
import { getDeviceType } from '@/utils/device';
import { rules } from '@/utils/rules';
import { validateEmail, validatePassWord, validateUserName } from '@/utils/rules';
import { /*getRegisterEmailCode*/ loginWithPassword, /*loginWithEmail, register*/ } from '@/api/modules/account';
import { getNormalWarnAlert, openPage, setLogin } from '@/utils/other';
import { csLoginByUserName } from '@/api/modules/api_convert/account';
import AgreeButton from '@/components/common/AgreeButton.vue';
import { selfDefinedSessionStorage } from '@/utils/sessionStorage';
import { selfDefineLocalStorage } from '@/utils/localStorage';
export default {
    name: 'LoginPage',
    props:{
        name:{
            type:String,
            default:""
        },
        passwd:{
            type:String,
            default:""
        }
    },
    setup() {
        const themeColor = globalProperties.$themeColor;
        const ifShowEmailExamineCard = ref(false);
        const ifShowDialog = computed(() => {
            return ifShowEmailExamineCard.value;
        })
        const apiUrl = globalProperties.$apiUrl;
        const campusList = globalProperties.$campus;
        const collegeList = globalProperties.$colleges;
        const setEmailExamineCardState = (state) => {
            ifShowEmailExamineCard.value = state;
        }
        const deviceType = globalProperties.$deviceType;
        const inputType = deviceType == 'desktop' ? 'compact' : 'comfortable';
        const ifMobile = computed(() => getDeviceType() === 'mobile');
        
        // 轮播图数据（4个幻灯片）
        const carouselModel = ref(0);
        const carouselSlides = [
            {
                icon: 'mdi-post',
                title: '文章博客',
                subtitle: '分享知识与经验',
                description: '创作优质内容，分享学习心得、生活经验与专业知识，构建知识共享社区',
                features: [
                    { icon: 'mdi-text-box', text: '支持富文本编辑' },
                    { icon: 'mdi-tag', text: '标签分类管理' },
                    { icon: 'mdi-star', text: '收藏与点赞' }
                ],
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                accentColor: '#667eea'
            },
            {
                icon: 'mdi-forum',
                title: '帖子论坛',
                subtitle: '交流讨论互动',
                description: '参与热门话题讨论，与同学交流观点，建立学习与生活交流圈',
                features: [
                    { icon: 'mdi-comment', text: '实时评论互动' },
                    { icon: 'mdi-fire', text: '热门话题推荐' },
                    { icon: 'mdi-account-group', text: '社区氛围活跃' }
                ],
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(56, 142, 60, 0.15) 100%)',
                accentColor: '#4CAF50'
            },
            {
                icon: 'mdi-star',
                title: '课程评分',
                subtitle: '精准课程评价',
                description: '查看课程详情、评分与评价，帮助选课决策，提升学习体验',
                features: [
                    { icon: 'mdi-star-outline', text: '多维度评分' },
                    { icon: 'mdi-file-document', text: '详细课程信息' },
                    { icon: 'mdi-account-school', text: '真实学生评价' }
                ],
                background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 193, 7, 0.15) 100%)',
                accentColor: '#FF9800'
            },
            {
                icon: 'mdi-shield-check',
                title: '平台优势',
                subtitle: '为大学生活提供优质服务',
                description: '专为大学生打造的纯净、安全、便捷的校园交流平台',
                advantages: [
                    { icon: 'mdi-check-circle', text: '精准实时', desc: '本校学生创作，信息准确及时' },
                    { icon: 'mdi-shield-account', text: '用户纯净', desc: '校园邮箱认证，可筛选非本校人员' },
                    { icon: 'mdi-magnify', text: '方便快捷', desc: '强大搜索功能，快速获取信息' },
                    { icon: 'mdi-email-sync', text: '开放灵活', desc: '支持邮箱换绑，毕业后账户不丢失' }
                ],
                background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.15) 0%, rgba(123, 31, 162, 0.15) 100%)',
                accentColor: '#9C27B0'
            }
        ];
        
        return {
            themeColor,
            ifShowEmailExamineCard,
            ifShowDialog,
            setEmailExamineCardState,
            deviceType,
            inputType,
            campusList,
            collegeList,
            apiUrl,
            ifMobile,
            carouselModel,
            carouselSlides,
        }
    },
    components: {
        EmailExamineCard,
        SensitiveTextField,
        AgreeButton,
    },
    data() {
        const loginByUsernameData = {
            userName: null,
            passwd: null,
        }
        const loginByEmailData = {
            email: null,
            emailCode: null,
        }
        const registerByEmailData = {
            email: null,
            passwd: "",
            passwdConfirm: "",
            userName: "",
            campus: null,
            major: null,
            college: null,
            emailCode: null,
        }
        const registerByInviteData = {
            email: null,
            passwd: "",
            passwdConfirm: "",
            userName: "",
            campus: null,
            major: null,
            college: null,
            emailCode: null,
            inviteCode: null,
        }
        /**
         * card message card 
         */
        let examineCardInfo = computed(() => {
            if (this.nowTab == 'login') {
                return {
                    type: 'login',
                    email: this.loginByEmailData.email,
                }
            } else {
                if(this.registerMethod=='email'){
                    return {
                        type: 'register',
                        email: this.registerByEmailData.email,
                        campus: this.registerByEmailData.campus,
                        college: this.registerByEmailData.college,
                        major: this.registerByEmailData.major,
                        userName: this.registerByEmailData.userName,
                        passwd: this.registerByEmailData.passwd,
                    }
                }else{
                    return {
                        type: 'register',
                        email: this.registerByInviteData.email,
                        campus: this.registerByInviteData.campus,
                        college: this.registerByInviteData.college,
                        major: this.registerByInviteData.major,
                        userName: this.registerByInviteData.userName,
                        passwd: this.registerByInviteData.passwd,
                        inviteCode:this.registerByInviteData.inviteCode,
                    }
                }
            }
        })
        let loginMethod = 'userName';// userName/email
        let registerMethod = 'email';// email/invite
        let registerByEmailStep = 0;
        let registerByInviteStep = 0;
        const loginRules = rules;
        return {
            loginByUsernameData,
            loginByEmailData,
            registerByEmailData,
            registerByInviteData,
            loginMethod,
            registerMethod,
            registerByEmailStep,
            loginRules,
            registerByInviteStep,
            examineCardInfo,
            passwdVisible: false,
            ifSavePasswd:false,
            loading:{
                login:false,
            },
            nowTab:'login',
        }
    },
    beforeRouteLeave (to, from, next) {
        try{
            let msg={};
            msg.loginByUsernameData=this.loginByUsernameData;
            msg.loginByEmailData=this.loginByEmailData;
            msg.registerByEmailData=this.registerByEmailData;
            msg.registerByInviteData=this.registerByInviteData;
            msg.loginMethod=this.loginMethod;
            msg.registerMethod=this.registerMethod;
            msg.registerByEmailStep=this.registerByEmailStep;
            msg.registerByInviteStep=this.registerByInviteStep;
            msg.ifShowEmailExamineCard=this.ifShowEmailExamineCard;
            msg.nowTab=this.nowTab;
            selfDefinedSessionStorage.setItem('loginMsg',JSON.stringify(msg));
            next();
        }catch(e){
            next();
        }
    },
    methods: {
        async loginByUsername() {
            /**
             * login
             */
            this.loading.login=true;
            const response = await loginWithPassword(csLoginByUserName(this.loginByUsernameData));
            this.loading.login=false;
            if (response.status == 200) {
                this.alert({
                    color: 'success',
                    title: '登陆成功',
                    state: true,
                    content: response.message,
                })
                /**
                 * save the user message
                 */
                setLogin(response.user_name,response.user_id,response.email,response.refresh,this.apiUrl + "/image/user?user_id=" + response.user_id,response.is_master,response.is_super_master,this.ifSavePasswd?this.loginByUsernameData.passwd:null)
                /**
                 * to the index page
                 */
                if(selfDefineLocalStorage.getItem("lastHref")){
                    window.open(selfDefineLocalStorage.getItem("lastHref"),'_self')      
                    selfDefineLocalStorage.removeItem("lastHref")  
                }else{
                    openPage("router",{
                        name: 'IndexPage',
                    })
                }

            } else {
                this.alert({
                    color: 'error',
                    title: '请求错误',
                    state: true,
                    content: response.message,
                })
            }
        },
        loginByEmail() {
            /**
             * show the examine card  
             */
            this.setEmailExamineCardState(true);
        },
        registerByEmail() {
            /**
             * show the examine card
             */
            this.setEmailExamineCardState(true);
        },
        registerByInvite() {
            /**
             * temporarily do nothing
             */
            this.setEmailExamineCardState(true);
        },
        step() {
            if (this.registerMethod == 'email') {
                if (this.registerByEmailData.passwd != this.registerByEmailData.passwdConfirm) {
                    this.alert(getNormalWarnAlert("两次密码输入不一致"));
                    return;
                }
                this.registerByEmailStep++;
            } else {
                if (this.registerByInviteData.passwd != this.registerByInviteData.passwdConfirm) {
                    this.alert(getNormalWarnAlert("两次密码输入不一致"));
                    return;
                }
                this.registerByInviteStep++;
            }
        },
        stepBack() {
            if (this.registerMethod == 'email') {
                this.registerByEmailStep--;
            } else {
                this.registerByInviteStep--;
            }
        },
        shiftLoginMethod() {
            this.loginMethod = this.loginMethod === 'userName' ? 'email' : 'userName'
        },
        shiftRegisterMethod() {
            this.registerMethod = this.registerMethod === 'email' ? 'invite' : 'email';
        },
        valEmail(email) {
            return validateEmail(email);
        },
        valUserName(name) {
            return validateUserName(name);
        },
        valPassWord(passWord) {
            return validatePassWord(passWord);
        },
        alert(msg) {
            this.$emit('alert', msg);
        },
        setLoading(msg) {
            this.$emit('set_loading', msg);
        },
        toUrl(url) {
            openPage("url",{url:url});
        },
        handleAgree(state){
            this.ifSavePasswd=state;
        }
    },
    mounted() {
        //get last edit msg  
        let msg=selfDefinedSessionStorage.getItem("loginMsg");
        if(msg){
            msg=JSON.parse(msg);
            this.loginByUsernameData=msg.loginByUsernameData;
            this.loginByEmailData=msg.loginByEmailData;
            this.registerByEmailData=msg.registerByEmailData;
            this.registerByInviteData=msg.registerByInviteData;
            this.loginMethod=msg.loginMethod;
            this.registerMethod=msg.registerMethod;
            this.registerByEmailStep=msg.registerByEmailStep;
            this.registerByInviteStep=msg.registerByInviteStep;
            this.nowTab=msg.nowTab;
            this.setEmailExamineCardState(msg.ifShowEmailExamineCard);
        }
        if(this.user_name){
            this.loginByUsernameData.userName=this.name;
            this.loginByUsernameData.passwd=this.passwd;
        }
        if(selfDefineLocalStorage.getItem("passwd")){
            this.loginByUsernameData.userName=selfDefineLocalStorage.getItem("userName");
            this.loginByUsernameData.passwd=selfDefineLocalStorage.getItem("passwd");
        }
    },
    created() {

    },
}
</script>
<style scoped>
.login-page-container {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    overflow: hidden;
}

.background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.login-content-wrapper {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
}

.dialog-content {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.bottom-bar {
    padding: 16px 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    margin-top: 8px;
}

.switch-method-btn {
    font-weight: 500;
    transition: all 0.3s ease;
    text-transform: none;
    letter-spacing: 0.3px;
}

.switch-method-btn:hover {
    transform: translateX(2px);
}

.return-welcome-btn {
    margin-top: 24px;
    font-weight: 500;
    transition: all 0.3s ease;
    text-transform: none;
    letter-spacing: 0.3px;
}

.return-welcome-btn:hover {
    transform: translateY(-2px);
}

.margin-right-10px {
    margin-right: 10px;
}

.row-center-div {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 0 5%;
}

.tip-text-container {
    width: 100%;
    margin-top: 12px;
    margin-bottom: 8px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    color: #666;
    padding: 0 5%;
    text-align: center;
    line-height: 1.5;
}

.select-input {
    flex: 1;
    min-width: 0;
}

.agreement-text-container {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin: 16px 0;
    padding: 0 5%;
    text-align: center;
    line-height: 1.6;
    flex-wrap: wrap;
}

.agreement-text-container span {
    cursor: pointer;
    transition: all 0.2s ease;
}

.agreement-text-container span:hover {
    opacity: 0.8;
}

/* 标签页样式 */
.login-tabs {
    border-radius: 16px 16px 0 0;
    overflow: hidden;
}

.custom-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 500;
    letter-spacing: 0.3px;
}

.tab-active {
    font-weight: 600;
}

.tab-icon {
    transition: transform 0.3s ease;
}

.tab-active .tab-icon {
    transform: scale(1.1);
}

.tab-text {
    font-size: 16px;
}

/* ========== PC端左右分栏布局 ========== */
.pc-login-layout {
    display: flex;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}

.carousel-section {
    flex: 1;
    height: 100vh;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
    position: relative;
    overflow: hidden;
}

.feature-carousel {
    height: 100%;
    border-radius: 0;
}

.feature-carousel :deep(.v-carousel__controls) {
    background: transparent;
    padding: 20px;
}

.feature-carousel :deep(.v-carousel__prev),
.feature-carousel :deep(.v-carousel__next) {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 50%;
    width: 48px;
    height: 48px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
}

.feature-carousel :deep(.v-carousel__prev:hover),
.feature-carousel :deep(.v-carousel__next:hover) {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.feature-carousel :deep(.v-carousel__prev .v-icon),
.feature-carousel :deep(.v-carousel__next .v-icon) {
    color: var(--theme-color, #667eea);
    font-size: 24px;
}

.feature-carousel :deep(.v-carousel__indicators) {
    background: transparent;
    padding: 20px;
}

.feature-carousel :deep(.v-carousel__indicator) {
    background: rgba(255, 255, 255, 0.5);
    border: 2px solid rgba(255, 255, 255, 0.8);
    width: 12px;
    height: 12px;
    margin: 0 6px;
    transition: all 0.3s ease;
}

.feature-carousel :deep(.v-carousel__indicator--active) {
    background: var(--theme-color, #667eea);
    border-color: var(--theme-color, #667eea);
    transform: scale(1.2);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.carousel-slide {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 60px 80px;
    transition: all 0.5s ease;
    overflow: hidden;
}

.carousel-slide::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
    pointer-events: none;
}

.slide-content {
    text-align: center;
    max-width: 680px;
    animation: slideInUp 0.6s ease-out;
    position: relative;
    z-index: 1;
    padding: 50px 60px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    border-radius: 28px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12),
                0 4px 16px rgba(0, 0, 0, 0.08);
}

.slide-icon-wrapper {
    margin-bottom: 32px;
    display: flex;
    justify-content: center;
    animation: iconFloat 3s ease-in-out infinite;
}

.icon-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, 
        rgba(102, 126, 234, 0.12) 0%, 
        rgba(118, 75, 162, 0.12) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid rgba(102, 126, 234, 0.25);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2),
                inset 0 2px 8px rgba(255, 255, 255, 0.3);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

.icon-circle::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    animation: rotate 8s linear infinite;
}

.slide-icon {
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
}

.slide-title {
    font-size: 3.8rem;
    font-weight: 900;
    color: #1a202c;
    margin-bottom: 12px;
    letter-spacing: -1.5px;
    background: linear-gradient(135deg, var(--theme-color, #667eea) 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;
}

.slide-subtitle {
    font-size: 1.4rem;
    color: #718096;
    margin-bottom: 24px;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.slide-description {
    font-size: 1.15rem;
    color: #4a5568;
    margin-bottom: 32px;
    line-height: 1.8;
    font-weight: 400;
    text-align: center;
    max-width: 560px;
    margin-left: auto;
    margin-right: auto;
}

.slide-features {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 32px;
    flex-wrap: wrap;
}

.feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px 24px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    min-width: 140px;
    flex: 1;
    max-width: 180px;
}

.feature-item:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.feature-icon {
    margin-bottom: 4px;
}

.feature-text {
    font-size: 0.95rem;
    color: #2d3748;
    font-weight: 600;
    text-align: center;
}

.slide-advantages {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-top: 32px;
    text-align: left;
}

.advantage-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.advantage-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: var(--accent-color, var(--theme-color, #667eea));
    opacity: 0;
    transition: opacity 0.3s ease;
}

.advantage-item:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.advantage-item:hover::before {
    opacity: 1;
}

.advantage-header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.advantage-icon {
    flex-shrink: 0;
}

.advantage-title {
    font-size: 1.1rem;
    color: #1a202c;
    font-weight: 700;
    letter-spacing: 0.3px;
}

.advantage-desc {
    font-size: 0.95rem;
    color: #4a5568;
    line-height: 1.6;
    margin: 0;
    padding-left: 36px;
    margin-top: 4px;
}

.form-section {
    flex: 0 0 520px;
    min-width: 520px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08);
    overflow-y: auto;
    position: relative;
}

.form-section::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, var(--theme-color, #667eea) 0%, #764ba2 100%);
    opacity: 0.3;
}

.form-section .login-card {
    width: 100%;
    max-width: 480px;
    margin-bottom: 24px;
}

@media screen and (min-width: 1000px) {
    .mobile-login-layout {
        display: none;
    }
    
    .full-center {
        width: 100vw;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 40px 20px;
    }

    .input {
        width: 90%;
        margin-left: 5%;
        margin-right: 5%;
        margin-top: 20px;
    }

    .login-card {
        width: 520px;
        max-width: 90vw;
        border-radius: 20px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12),
                    0 2px 8px rgba(0, 0, 0, 0.08);
        animation: slideUp 0.5s ease-out;
    }

    .login-btn {
        width: 70%;
        min-width: 200px;
        margin: 24px auto;
        display: block;
        height: 48px;
        font-weight: 600;
        font-size: 16px;
        letter-spacing: 0.5px;
        text-transform: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .login-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .login-btn:active:not(:disabled) {
        transform: translateY(0);
    }

    .register-btn {
        flex: 1;
        min-width: 120px;
        height: 44px;
        font-weight: 600;
        text-transform: none;
        letter-spacing: 0.3px;
        transition: all 0.3s ease;
    }

    .register-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .last-step-btn {
        flex: 1;
        min-width: 120px;
        height: 44px;
        font-weight: 500;
        text-transform: none;
        letter-spacing: 0.3px;
        transition: all 0.3s ease;
    }

    .last-step-btn:hover {
        transform: translateY(-2px);
    }
}

@media screen and (max-width: 1000px) {
    .pc-login-layout {
        display: none;
    }
    
    .mobile-login-layout {
        display: flex;
        width: 100vw;
        min-height: 100vh;
    }
    
    .full-center {
        width: 100vw;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 20px 16px;
    }

    .input {
        width: 90%;
        margin-left: 5%;
        margin-right: 5%;
        margin-top: 16px;
    }

    .login-card {
        width: 90vw;
        max-width: 420px;
        border-radius: 20px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12),
                    0 2px 8px rgba(0, 0, 0, 0.08);
        animation: slideUp 0.5s ease-out;
    }

    .login-btn {
        width: 85%;
        margin: 20px auto;
        display: block;
        height: 48px;
        font-weight: 600;
        font-size: 16px;
        letter-spacing: 0.5px;
        text-transform: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .login-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .register-btn {
        flex: 1;
        min-width: 100px;
        height: 42px;
        font-weight: 600;
        font-size: 14px;
        text-transform: none;
        letter-spacing: 0.3px;
    }

    .last-step-btn {
        flex: 1;
        min-width: 100px;
        height: 42px;
        font-weight: 500;
        font-size: 14px;
        text-transform: none;
        letter-spacing: 0.3px;
    }

    .row-center-div {
        padding: 0 5%;
        gap: 8px;
    }

    .select-input {
        flex: 1;
        min-width: 0;
    }
}

/* 动画效果 */
@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.login-card {
    animation: slideUp 0.5s ease-out;
}

/* 输入框容器优化 */
.v-tabs-window-item {
    padding: 24px 0;
}

/* 链接样式优化 */
.agreement-text-container span strong {
    transition: all 0.2s ease;
}

.agreement-text-container span:hover strong {
    opacity: 0.8;
    text-decoration: underline;
}

/* 底部栏优化 */
.bottom-bar {
    background: rgba(0, 0, 0, 0.02);
}

/* ========== 轮播动画 ========== */
@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes iconFloat {
    0%, 100% {
        transform: translateY(0) scale(1);
    }
    50% {
        transform: translateY(-10px) scale(1.05);
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

/* PC端轮播图优化 */
@media screen and (min-width: 1000px) {
    .carousel-slide {
        background-size: cover;
        background-position: center;
        padding: 80px 100px;
    }
    
    .slide-content {
        max-width: 720px;
        padding: 60px 70px;
    }
    
    .icon-circle {
        width: 140px;
        height: 140px;
    }
    
    .slide-icon {
        font-size: 72px !important;
    }
    
    .slide-title {
        font-size: 4.5rem;
        margin-bottom: 16px;
    }
    
    .slide-subtitle {
        font-size: 1.6rem;
        margin-bottom: 28px;
    }
    
    .slide-description {
        font-size: 1.25rem;
        margin-bottom: 40px;
    }
    
    .slide-features {
        gap: 24px;
        margin-top: 40px;
    }
    
    .feature-item {
        padding: 24px 28px;
        min-width: 160px;
        max-width: 200px;
    }
    
    .feature-text {
        font-size: 1.05rem;
    }
    
    .slide-advantages {
        gap: 20px;
        margin-top: 40px;
    }
    
    .advantage-item {
        padding: 24px;
    }
    
    .advantage-title {
        font-size: 1.2rem;
    }
    
    .advantage-desc {
        font-size: 1.05rem;
        padding-left: 40px;
    }
}
</style>