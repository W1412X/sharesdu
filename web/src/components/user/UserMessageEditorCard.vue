<template>
  <v-dialog v-model="ifShowDialog" style="width: 100%;height:100%;justify-content: center;">
    <div v-if="ifShowEmailExmineCode" style="width: 100%;height:100%;justify-content: center;display: flex">
      <email-examine-card :init-data="examineCardData" @alert="alert" @close="close"
        @submit="handleResetFinish"></email-examine-card>
    </div>
    <div v-if="ifShowSetProfileCard" style="width: 100%;height:100%;justify-content: center;display: flex">
      <set-profile-card @close="close" @alert="alert"
        @set_loading="setLoading"></set-profile-card>
    </div>
  </v-dialog>
  <v-card class="account-card-flat" flat>
    <div class="account-form">
      <!-- 头像：与下方区块同一套 block-toolbar + kv-line -->
      <div class="block">
        <div class="block-toolbar">
          <span class="block-title">头像</span>
          <div class="icon-group">
            <v-btn icon variant="text" size="small" aria-label="编辑头像" @click="editProfile">
              <v-icon size="20" color="#666">mdi-pencil-outline</v-icon>
            </v-btn>
          </div>
        </div>
        <div class="kv-line kv-line-head">
          <span class="k">头像</span>
          <div class="v v-with-icon">
            <v-avatar :image="avatarUrl" size="40" />
          </div>
        </div>
      </div>

      <!-- 个人资料：只读每行一条；整块一个铅笔，编辑时勾选保存、叉取消 -->
      <div class="block">
        <div class="block-toolbar">
          <span class="block-title">个人资料</span>
          <div class="icon-group">
            <template v-if="!ifAbleEditProfile">
              <v-btn icon variant="text" size="small" aria-label="编辑个人资料" @click="startEditProfile">
                <v-icon size="20" color="#666">mdi-pencil-outline</v-icon>
              </v-btn>
            </template>
            <template v-else>
              <v-btn icon variant="text" size="small" aria-label="保存" @click="saveProfile">
                <v-icon size="22" :color="themeColor">mdi-check</v-icon>
              </v-btn>
              <v-btn icon variant="text" size="small" aria-label="取消" @click="cancelProfileInfo">
                <v-icon size="22" color="#666">mdi-close</v-icon>
              </v-btn>
            </template>
          </div>
        </div>
        <template v-if="!ifAbleEditProfile">
          <div class="kv-line"><span class="k">用户名</span><span class="v">{{ dashIfEmpty(userInfo.userName) }}</span></div>
          <div class="kv-line"><span class="k">校区</span><span class="v">{{ dashIfEmpty(userInfo.campus) }}</span></div>
          <div class="kv-line"><span class="k">学院</span><span class="v">{{ dashIfEmpty(userInfo.college) }}</span></div>
          <div class="kv-line"><span class="k">专业</span><span class="v">{{ dashIfEmpty(userInfo.major) }}</span></div>
        </template>
        <template v-else>
          <div class="field-row"><sensitive-text-area v-model="editingUserInfo.userName" density="compact" row-height="15" rows="1" label="用户名" variant="outlined" auto-grow hide-details="auto" class="field-fill" /></div>
          <div class="field-row"><v-select v-model="editingUserInfo.campus" :clearable="true" class="field-fill" variant="outlined" density="compact" hide-details="auto" :items="campusList" label="校区" /></div>
          <div class="field-row"><v-autocomplete v-model="editingUserInfo.college" :clearable="true" class="field-fill" variant="outlined" density="compact" hide-details="auto" :items="collegeList" label="学院" /></div>
          <div class="field-row"><sensitive-text-area v-model="editingUserInfo.major" density="compact" row-height="15" rows="1" label="专业" variant="outlined" auto-grow hide-details="auto" class="field-fill" /></div>
        </template>
      </div>

      <!-- 邮箱 -->
      <div class="block">
        <div class="block-toolbar">
          <span class="block-title">邮箱</span>
          <div class="icon-group">
            <template v-if="!ifAbleEditEmail">
              <v-btn icon variant="text" size="small" aria-label="编辑邮箱" @click="startEditEmail">
                <v-icon size="20" color="#666">mdi-pencil-outline</v-icon>
              </v-btn>
            </template>
            <template v-else>
              <v-btn
                v-if="changeEmailStep === 2"
                icon
                variant="text"
                size="small"
                aria-label="保存换绑"
                @click="submitChangeEmail"
              >
                <v-icon size="22" :color="themeColor">mdi-check</v-icon>
              </v-btn>
              <v-btn icon variant="text" size="small" aria-label="取消" @click="cancelEmail">
                <v-icon size="22" color="#666">mdi-close</v-icon>
              </v-btn>
            </template>
          </div>
        </div>
        <template v-if="!ifAbleEditEmail">
          <div class="kv-line"><span class="k">邮箱</span><span class="v">{{ dashIfEmpty(userInfo.email) }}</span></div>
        </template>
        <template v-else>
          <div class="email-step-badge">
            步骤 {{ changeEmailStep }} / 2 · {{ changeEmailStep === 1 ? '验证身份' : '绑定新邮箱' }}
          </div>

          <!-- 步骤 1：身份验证（密码 或 GET target=old，对应文档 <1>） -->
          <template v-if="changeEmailStep === 1">
            <div class="kv-line kv-line-current-email">
              <span class="k">当前邮箱</span>
              <span class="v">{{ dashIfEmpty(userInfo.email) }}</span>
            </div>
            <p class="email-flow-hint">
              使用<strong>当前密码</strong>，或向当前邮箱获取<strong>验证码</strong>（二选一），完成后进入下一步。
            </p>
            <div class="email-verify-block">
              <v-btn-toggle
                v-model="changeEmailVerifyMode"
                class="email-mode-toggle"
                mandatory
                divided
                density="compact"
                variant="outlined"
                color="primary"
              >
                <v-btn value="password" size="small">当前密码</v-btn>
                <v-btn value="old_email" size="small" :disabled="!hasBoundEmail">旧邮箱验证码</v-btn>
              </v-btn-toggle>
              <div v-if="changeEmailVerifyMode === 'password'" class="field-row field-row-noborder">
                <v-text-field
                  v-model="changeEmailPassword"
                  type="password"
                  label="当前密码"
                  density="compact"
                  variant="outlined"
                  autocomplete="current-password"
                  hide-details="auto"
                  class="field-fill"
                />
              </div>
              <template v-else>
                <p class="email-verify-subhint">验证码将发至上方当前邮箱；请先点击发送，再在下方输入 6 位数字。</p>
                <v-btn
                  class="otp-send-btn"
                  block
                  rounded="lg"
                  variant="flat"
                  :color="themeColor"
                  :loading="changeEmailOldSendLoading"
                  :disabled="changeEmailOldSendLoading || changeEmailCooldownOld > 0"
                  prepend-icon="mdi-email-send-outline"
                  @click="sendOldEmailVerificationCode"
                >
                  <template v-if="changeEmailCooldownOld > 0">{{ changeEmailCooldownOld }} 秒后可重新发送</template>
                  <template v-else>发送验证码至当前邮箱</template>
                </v-btn>
                <div class="email-otp-label">当前邮箱验证码</div>
                <v-sheet color="surface" class="otp-sheet">
                  <v-otp-input v-model="changeEmailOldCode" length="6" variant="outlined" />
                </v-sheet>
              </template>
            </div>
            <div class="email-step-actions">
              <v-btn
                variant="flat"
                :color="themeColor"
                block
                rounded="lg"
                size="large"
                @click="goChangeEmailStep2"
              >
                <v-icon size="20" class="mr-2">mdi-arrow-right</v-icon>
                下一步
              </v-btn>
            </div>
          </template>

          <!-- 步骤 2：新邮箱（GET target=new + POST，对应文档 <2><3>） -->
          <template v-else>
            <p class="email-flow-hint">
              填写新邮箱并获取验证码；确认无误后点击右上角<strong>保存</strong>完成换绑。
            </p>
            <v-btn
              variant="text"
              size="small"
              class="email-back-btn"
              prepend-icon="mdi-arrow-left"
              @click="backChangeEmailStep"
            >
              上一步
            </v-btn>
            <div class="field-row">
              <sensitive-text-area
                v-model="editingUserInfo.email"
                density="compact"
                row-height="15"
                rows="1"
                label="新邮箱"
                variant="outlined"
                auto-grow
                hide-details="auto"
                class="field-fill"
              />
            </div>
            <v-btn
              class="otp-send-btn"
              block
              rounded="lg"
              variant="flat"
              :color="themeColor"
              :loading="changeEmailSendLoading"
              :disabled="changeEmailSendLoading || changeEmailCooldownNew > 0"
              prepend-icon="mdi-email-send-outline"
              @click="sendNewEmailVerificationCode"
            >
              <template v-if="changeEmailCooldownNew > 0">{{ changeEmailCooldownNew }} 秒后可重新发送</template>
              <template v-else>发送验证码至新邮箱</template>
            </v-btn>
            <div class="email-otp-label">新邮箱验证码</div>
            <v-sheet color="surface" class="otp-sheet">
              <v-otp-input v-model="changeEmailCode" length="6" variant="outlined" />
            </v-sheet>
          </template>
        </template>
      </div>

      <!-- 密码 -->
      <div class="block">
        <div class="block-toolbar">
          <span class="block-title">密码</span>
          <div class="icon-group">
            <template v-if="!ifAbleEditPasswd">
              <v-btn icon variant="text" size="small" aria-label="修改密码" @click="startEditPasswd">
                <v-icon size="20" color="#666">mdi-pencil-outline</v-icon>
              </v-btn>
            </template>
            <template v-else>
              <v-btn icon variant="text" size="small" aria-label="提交修改" @click="submitPasswdChange">
                <v-icon size="22" :color="themeColor">mdi-check</v-icon>
              </v-btn>
              <v-btn icon variant="text" size="small" aria-label="取消" @click="cancelPasswd">
                <v-icon size="22" color="#666">mdi-close</v-icon>
              </v-btn>
            </template>
          </div>
        </div>
        <template v-if="!ifAbleEditPasswd">
          <div class="kv-line"><span class="k">密码</span><span class="v">已设置（不显示）</span></div>
        </template>
        <template v-else>
          <div class="field-row"><sensitive-text-area v-model="editingUserInfo.passwd" label="新密码" density="compact" :rules="[passwdRule]" row-height="15" rows="1" variant="outlined" auto-grow hide-details="auto" class="field-fill" /></div>
        </template>
      </div>

      <div class="block block-danger">
        <div class="kv-line kv-line-danger">
          <v-btn variant="text" size="small" class="danger-link" prepend-icon="mdi-delete-outline" @click="confirmDeleteAccount">注销此账户</v-btn>
          <v-btn variant="text" size="small" class="danger-link" prepend-icon="mdi-logout" @click="logout">退出登录</v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
import SetProfileCard from '@/components/user/SetProfileCard.vue';
import EmailExamineCard from '@/components/user/EmailExamineCard.vue';
import { computed, ref } from 'vue';
import SensitiveTextArea from '@/components/common/SensitiveTextArea.vue';
import {
  getAuthorInfo,
  logout,
  updateUserProfile,
  sendChangeEmailCodeToNew,
  sendChangeEmailCodeToOld,
  submitChangeEmail,
} from '@/api/modules/account';
import { copy, getCancelLoadMsg, getLoadMsg, openPage } from '@/utils/other';
import { rules, validateEmailForLogin, validatePassWord, validateUserName } from '@/utils/rules';
import { clearTokenCookies, getCookie, setCookie } from '@/utils/cookie';
import { globalProperties } from '@/main';
import { buildDiceBearAvatarUrl } from '@/utils/avatar';

function normalizeProfileField(v) {
  if (v == null || v === undefined) return '';
  return String(v);
}

export default {
  components: {
    EmailExamineCard,
    SetProfileCard,
    SensitiveTextArea,
  },
  setup() {
    const ifShowEmailExmineCode = ref(false);
    const ifShowSetProfileCard = ref(false);
    const ifShowDialog = computed(() => ifShowEmailExmineCode.value || ifShowSetProfileCard.value);
    const themeColor = globalProperties.$themeColor;
    const setEmailExmineCodeCardState = (state) => {
      ifShowEmailExmineCode.value = state;
    };
    const setProfileCardState = (state) => {
      ifShowSetProfileCard.value = state;
    };
    return {
      ifShowDialog,
      ifShowEmailExmineCode,
      ifShowSetProfileCard,
      setEmailExmineCodeCardState,
      setProfileCardState,
      themeColor,
      campusList: globalProperties.$campus,
      collegeList: globalProperties.$colleges,
    };
  },
  data() {
    const userInfo = {
      userId: getCookie('userId'),
      userName: getCookie('userName'),
      campus: '',
      college: '',
      major: '',
      profileUrl: getCookie('userProfileUrl'),
      passwd: '********',
      email: getCookie('email'),
    };
    const editingUserInfo = {
      userName: userInfo.userName,
      profileUrl: userInfo.profileUrl,
      passwd: userInfo.passwd,
      email: userInfo.email,
      campus: '',
      college: '',
      major: '',
    };
    let examineCardData;
    return {
      changeEmailCode: '',
      changeEmailPassword: '',
      changeEmailOldCode: '',
      changeEmailVerifyMode: 'password',
      changeEmailSendLoading: false,
      changeEmailOldSendLoading: false,
      changeEmailCooldownNew: 0,
      changeEmailCooldownOld: 0,
      emailCooldownTimer: null,
      /** 换绑邮箱：1=身份验证（文档 GET target=old 或密码），2=新邮箱（GET target=new + POST） */
      changeEmailStep: 1,
      ifAbleEditProfile: false,
      ifAbleEditEmail: false,
      ifAbleEditPasswd: false,
      userInfo,
      examineCardData,
      passwdRule: rules.password,
      validatePasswd: validatePassWord,
      editingUserInfo,
    };
  },
  computed: {
    avatarUrl() {
      return this.userInfo.profileUrl || buildDiceBearAvatarUrl(this.userInfo.userName || this.userInfo.userId || 'user', {
        size: 96,
        style: 'personas',
        useBackground: true,
      });
    },
    hasBoundEmail() {
      return !!(this.userInfo.email && String(this.userInfo.email).trim());
    },
  },
  methods: {
    dashIfEmpty(v) {
      if (v == null || String(v).trim() === '') return '—';
      return String(v);
    },
    editProfile() {
      this.setProfileCardState(true);
    },
    startEditProfile() {
      this.ifAbleEditEmail = false;
      this.ifAbleEditPasswd = false;
      this.changeEmailCode = '';
      this.changeEmailPassword = '';
      this.changeEmailOldCode = '';
      this.changeEmailVerifyMode = 'password';
      this.changeEmailStep = 1;
      this.editingUserInfo = copy(this.userInfo);
      this.ifAbleEditProfile = true;
    },
    startEditEmail() {
      this.ifAbleEditProfile = false;
      this.ifAbleEditPasswd = false;
      this.editingUserInfo = copy(this.userInfo);
      // 新邮箱须单独填写，勿预填当前邮箱以免混淆
      this.editingUserInfo.email = '';
      this.changeEmailCode = '';
      this.changeEmailPassword = '';
      this.changeEmailOldCode = '';
      this.changeEmailVerifyMode = 'password';
      this.changeEmailStep = 1;
      this.ifAbleEditEmail = true;
    },
    startEditPasswd() {
      this.ifAbleEditProfile = false;
      this.ifAbleEditEmail = false;
      this.changeEmailCode = '';
      this.changeEmailPassword = '';
      this.changeEmailOldCode = '';
      this.changeEmailVerifyMode = 'password';
      this.changeEmailStep = 1;
      this.editingUserInfo = copy(this.userInfo);
      this.editingUserInfo.passwd = '';
      this.ifAbleEditPasswd = true;
    },
    goChangeEmailStep2() {
      if (this.changeEmailVerifyMode === 'password') {
        if (!validatePassWord(this.changeEmailPassword)) {
          this.alert({
            state: true,
            color: 'warning',
            title: '密码无效',
            content: '请输入当前登录密码（8～16 位，且含字母、数字与规定符号）',
          });
          return;
        }
      } else {
        const oldCode = String(this.changeEmailOldCode || '').replace(/\s/g, '');
        if (oldCode.length !== 6) {
          this.alert({
            state: true,
            color: 'warning',
            title: '旧邮箱验证码',
            content: '请先点击发送验证码，并在收到后填写 6 位数字',
          });
          return;
        }
      }
      this.changeEmailStep = 2;
    },
    backChangeEmailStep() {
      this.changeEmailCode = '';
      this.changeEmailStep = 1;
    },
    cancelProfileInfo() {
      this.editingUserInfo = copy(this.userInfo);
      this.ifAbleEditProfile = false;
    },
    async saveProfile() {
      const u = this.editingUserInfo;
      const o = this.userInfo;
      if (!validateUserName(u.userName)) {
        this.alert({
          color: 'warning',
          state: true,
          title: '用户名无效',
          content: '用户名应在 1～20 字符之间，且不含空格、分号、逗号',
        });
        return;
      }
      const payload = {};
      if (u.userName !== o.userName) payload.user_name = u.userName;
      const z = normalizeProfileField;
      if (z(u.campus) !== z(o.campus)) payload.campus = z(u.campus);
      if (z(u.college) !== z(o.college)) payload.college = z(u.college);
      if (z(u.major) !== z(o.major)) payload.major = z(u.major);
      if (Object.keys(payload).length === 0) {
        this.alert({ state: true, title: '提示', content: '没有修改任何内容' });
        return;
      }
      this.setLoading(getLoadMsg('正在保存...', -1));
      const res = await updateUserProfile(payload);
      this.setLoading(getCancelLoadMsg());
      if (res.status === 200 && res.data) {
        const d = res.data;
        this.userInfo.userName = d.user_name;
        this.userInfo.campus = normalizeProfileField(d.campus);
        this.userInfo.college = normalizeProfileField(d.college);
        this.userInfo.major = normalizeProfileField(d.major);
        setCookie('userName', d.user_name, 7 * 24);
        this.editingUserInfo = copy(this.userInfo);
        this.ifAbleEditProfile = false;
        this.alert({
          state: true,
          color: 'success',
          title: '保存成功',
          content: res.message || '个人资料已更新',
        });
      } else {
        const title = res.status === 409 ? '用户名已被占用' : '保存失败';
        this.alert({ state: true, color: 'error', title, content: res.message || '请稍后重试' });
      }
    },
    async loadProfileFromServer() {
      const uid = getCookie('userId');
      if (!uid) return;
      try {
        const res = await getAuthorInfo(uid);
        if (res.status === 200 && res.data) {
          const d = res.data;
          this.userInfo.userName = d.user_name || this.userInfo.userName;
          if (d.email) this.userInfo.email = d.email;
          this.userInfo.campus = normalizeProfileField(d.campus);
          this.userInfo.college = normalizeProfileField(d.college);
          this.userInfo.major = normalizeProfileField(d.major);
          this.editingUserInfo = copy(this.userInfo);
        }
      } catch (e) {
        console.error(e);
      }
    },
    async sendNewEmailVerificationCode() {
      const email = (this.editingUserInfo.email || '').trim();
      if (!validateEmailForLogin(email)) {
        this.alert({
          color: 'warning',
          state: true,
          title: '邮箱格式不正确',
          content: '请输入合法的新邮箱地址',
        });
        return;
      }
      if (email === (this.userInfo.email || '').trim()) {
        this.alert({
          state: true,
          title: '提示',
          content: '请先填写与当前邮箱不同的新邮箱地址',
        });
        return;
      }
      this.changeEmailSendLoading = true;
      this.setLoading(getLoadMsg('正在发送验证码...', -1));
      try {
        const res = await sendChangeEmailCodeToNew(email);
        if (res.status === 200 || res.status === 201) {
          this.changeEmailCode = '';
          this.startEmailCooldown('new');
          this.alert({
            state: true,
            color: 'success',
            title: '发送成功',
            content: '验证码已发送至新邮箱，请查收（含垃圾邮件箱）',
          });
        } else {
          this.alert({
            state: true,
            color: 'error',
            title: '发送失败',
            content: res.message || '请稍后重试',
          });
        }
      } finally {
        this.changeEmailSendLoading = false;
        this.setLoading(getCancelLoadMsg());
      }
    },
    startEmailCooldown(which) {
      const sec = 60;
      if (which === 'new') this.changeEmailCooldownNew = sec;
      else this.changeEmailCooldownOld = sec;
      if (this.emailCooldownTimer) return;
      this.emailCooldownTimer = setInterval(() => {
        if (this.changeEmailCooldownNew > 0) this.changeEmailCooldownNew -= 1;
        if (this.changeEmailCooldownOld > 0) this.changeEmailCooldownOld -= 1;
        if (this.changeEmailCooldownNew <= 0 && this.changeEmailCooldownOld <= 0) {
          clearInterval(this.emailCooldownTimer);
          this.emailCooldownTimer = null;
        }
      }, 1000);
    },
    async sendOldEmailVerificationCode() {
      const cur = (this.userInfo.email || '').trim();
      if (!cur) {
        this.alert({
          state: true,
          color: 'warning',
          title: '无法使用此方式',
          content: '当前账号未绑定邮箱，请改用「当前密码」完成验证。',
        });
        return;
      }
      this.changeEmailOldSendLoading = true;
      this.setLoading(getLoadMsg('正在发送验证码...', -1));
      try {
        const res = await sendChangeEmailCodeToOld();
        if (res.status === 200 || res.status === 201) {
          this.changeEmailOldCode = '';
          this.startEmailCooldown('old');
          this.alert({
            state: true,
            color: 'success',
            title: '发送成功',
            content: '验证码已发送至当前邮箱，请查收（含垃圾邮件箱）',
          });
        } else {
          this.alert({
            state: true,
            color: 'error',
            title: '发送失败',
            content: res.message || '请稍后重试',
          });
        }
      } finally {
        this.changeEmailOldSendLoading = false;
        this.setLoading(getCancelLoadMsg());
      }
    },
    async submitChangeEmail() {
      if (this.changeEmailStep !== 2) {
        return;
      }
      const newEmail = (this.editingUserInfo.email || '').trim();
      if (!validateEmailForLogin(newEmail)) {
        this.alert({
          color: 'warning',
          state: true,
          title: '邮箱格式不正确',
          content: '请输入合法的新邮箱地址',
        });
        return;
      }
      if (newEmail === (this.userInfo.email || '').trim()) {
        this.alert({
          state: true,
          title: '提示',
          content: '新邮箱不能与当前邮箱相同',
        });
        return;
      }
      const code = String(this.changeEmailCode || '').replace(/\s/g, '');
      if (code.length !== 6) {
        this.alert({
          state: true,
          color: 'warning',
          title: '验证码',
          content: '请输入新邮箱收到的 6 位验证码',
        });
        return;
      }
      const payload = {
        new_email: newEmail,
        new_email_code: code,
      };
      if (this.changeEmailVerifyMode === 'password') {
        if (!validatePassWord(this.changeEmailPassword)) {
          this.alert({
            state: true,
            color: 'warning',
            title: '密码无效',
            content: '请输入当前登录密码（8～16 位，且含字母、数字与规定符号）',
          });
          return;
        }
        payload.pass_word = this.changeEmailPassword;
      } else {
        const oldCode = String(this.changeEmailOldCode || '').replace(/\s/g, '');
        if (oldCode.length !== 6) {
          this.alert({
            state: true,
            color: 'warning',
            title: '旧邮箱验证码',
            content: '请输入当前邮箱收到的 6 位验证码',
          });
          return;
        }
        payload.old_email_code = oldCode;
      }
      this.setLoading(getLoadMsg('正在换绑邮箱...', -1));
      try {
        const res = await submitChangeEmail(payload);
        if ((res.status === 200 || res.status === 201) && res.data) {
          const em = res.data.email;
          setCookie('email', em, 7 * 24);
          this.userInfo.email = em;
          this.editingUserInfo.email = em;
          this.changeEmailCode = '';
          this.changeEmailPassword = '';
          this.changeEmailOldCode = '';
          this.changeEmailVerifyMode = 'password';
          this.changeEmailStep = 1;
          this.ifAbleEditEmail = false;
          this.alert({
            state: true,
            color: 'success',
            title: '换绑成功',
            content: res.message || '邮箱已更新',
          });
        } else {
          const title =
            res.status === 401
              ? '验证失败'
              : res.status === 409
                ? '邮箱不可用'
                : res.status === 410
                  ? '验证码已过期'
                  : '换绑失败';
          this.alert({
            state: true,
            color: 'error',
            title,
            content: res.message || '请检查后重试',
          });
        }
      } finally {
        this.setLoading(getCancelLoadMsg());
      }
    },
    submitPasswdChange() {
      if (!validatePassWord(this.editingUserInfo.passwd)) {
        this.alert({
          state: true,
          color: 'warning',
          title: '密码无效',
          content: '请设置符合要求的新密码（8～16 位，含字母、数字与规定符号）',
        });
        return;
      }
      this.examineCardData = {
        type: 'reset_passwd',
        email: this.userInfo.email,
        passwd: this.editingUserInfo.passwd,
      };
      this.setEmailExmineCodeCardState(true);
    },
    close() {
      this.setEmailExmineCodeCardState(false);
      this.setProfileCardState(false);
    },
    handleResetFinish(msg) {
      if (msg.type === 'reset_passwd' && msg.state === 'success') {
        this.alert({
          state: true,
          color: 'success',
          title: '修改成功',
          content: '现在您可以使用新密码登陆',
        });
        this.userInfo.passwd = this.editingUserInfo.passwd;
        this.cancelPasswd();
      }
      if (msg.type === 'reset_email' && msg.state === 'success') {
        this.alert({
          state: true,
          color: 'success',
          title: '修改成功',
          content: '现在您可以使用新邮箱验证',
        });
        this.userInfo.email = this.editingUserInfo.email;
        this.cancelEmail();
      }
    },
    cancelEmail() {
      this.editingUserInfo = copy(this.userInfo);
      this.changeEmailCode = '';
      this.changeEmailPassword = '';
      this.changeEmailOldCode = '';
      this.changeEmailVerifyMode = 'password';
      this.changeEmailStep = 1;
      this.ifAbleEditEmail = false;
    },
    cancelPasswd() {
      this.editingUserInfo = copy(this.userInfo);
      this.ifAbleEditPasswd = false;
    },
    async logout() {
      this.setLoading(getLoadMsg('正在退出登录...', -1));
      const response = await logout();
      if (response.status === 200) {
        clearTokenCookies();
        openPage('url', { url: '#/login' }, '_self');
      } else {
        this.alert({
          state: true,
          color: 'error',
          title: '登出失败，已强制登出',
          content: response.message,
        });
        clearTokenCookies();
      }
      this.setLoading(getCancelLoadMsg());
    },
    async confirmDeleteAccount() {
      this.examineCardData = {
        type: 'delete_account',
        email: this.userInfo.email,
        userName: this.userInfo.userName,
      };
      this.setEmailExmineCodeCardState(true);
    },
    alert(msg) {
      this.$emit('alert', msg);
    },
    setLoading(msg) {
      this.$emit('set_loading', msg);
    },
  },
  watch: {
    hasBoundEmail(val) {
      if (!val && this.ifAbleEditEmail && this.changeEmailVerifyMode === 'old_email') {
        this.changeEmailVerifyMode = 'password';
      }
    },
  },
  mounted() {
    this.loadProfileFromServer();
  },
  beforeUnmount() {
    if (this.emailCooldownTimer) {
      clearInterval(this.emailCooldownTimer);
      this.emailCooldownTimer = null;
    }
  },
};
</script>

<style scoped>
.account-card-flat {
  overflow: visible;
}

.account-form {
  box-sizing: border-box;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 8px 12px 16px;
}

/* 一行：标签 | 内容 */
.kv-line {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 12px;
  padding: 10px 0;
  font-size: 14px;
}

.kv-line-head {
  align-items: center;
}

.kv-line-danger {
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding-top: 12px;
  border-bottom: none;
}

.k {
  flex: 0 0 72px;
  color: #757575;
  line-height: 24px;
}

.v {
  flex: 1;
  min-width: 0;
  word-break: break-word;
  line-height: 24px;
  color: #212121;
}

.v-with-icon {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 分块：标题行 + 铅笔/勾选/关闭 */
.block {
  width:100%;
  margin-top: 4px;
  margin-bottom: 8px;
}

.block-toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0 4px;
  min-height: 36px;
}

.block-title {
  font-size: 14px;
  font-weight: 600;
  color: #424242;
}

.icon-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0;
}

.field-row {
  padding: 6px 0 10px;
  border-bottom: 1px solid #eee;
}

.field-row:last-of-type {
  border-bottom: none;
}

.field-fill {
  width: 100%;
}

.field-row :deep(.v-textarea),
.field-row :deep(.v-input),
.field-fill :deep(.v-textarea),
.field-fill :deep(.v-input) {
  width: 100%;
}

.block-danger {
  margin-top: 12px;
  padding-top: 4px;
  border-top: 1px solid #e0e0e0;
}

.danger-link {
  color: #757575 !important;
  text-transform: none;
  letter-spacing: normal;
}

.kv-line-current-email .v {
  font-size: 13px;
  color: #616161;
}

.email-flow-hint {
  margin: 0 0 10px 0;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.45;
  color: #616161;
  background: #f5f5f5;
  border-radius: 6px;
}

.email-flow-hint strong {
  font-weight: 600;
  color: #424242;
}

.email-verify-block {
  margin-top: 4px;
  padding-top: 4px;
}

.email-step-badge {
  font-size: 12px;
  color: #757575;
  margin-bottom: 10px;
}

.email-step-actions {
  margin-top: 14px;
  margin-bottom: 4px;
}

.email-back-btn {
  margin: 0 0 10px 0;
  text-transform: none;
  letter-spacing: normal;
}

.email-otp-label {
  font-size: 12px;
  font-weight: 600;
  color: #616161;
  margin: 10px 0 6px 0;
}

.otp-send-btn {
  margin-top: 4px;
  margin-bottom: 2px;
  text-transform: none;
  letter-spacing: normal;
}

.otp-sheet {
  padding: 4px 0 4px;
  border-radius: 8px;
}

.otp-sheet :deep(.v-otp-input) {
  width: 100%;
}

.email-verify-subhint {
  margin: 6px 0 0 0;
  font-size: 12px;
  color: #757575;
  line-height: 1.4;
}

.email-mode-toggle {
  width: 100%;
  max-width: 100%;
}

.email-mode-toggle :deep(.v-btn) {
  flex: 1;
  text-transform: none;
  letter-spacing: normal;
}

.field-row-noborder {
  border-bottom: none;
  padding-bottom: 4px;
}
</style>
