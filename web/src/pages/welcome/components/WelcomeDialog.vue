<template>
  <v-dialog :model-value="ifShowDialog" @update:model-value="$emit('update:ifShowDialog', $event)" class="full-center">
    <div class="dialog-card-container">
      <!-- 登录提示卡片 -->
      <v-card v-if="ifShowLogin" class="card">
        <div class="title-bold">敬请期待</div>
        <div class="text-medium">暂未对外开放<br />(预计于25年3月份开放注册)</div>
        <div class="card-bottom-div">
          <v-btn variant="text" @click="$emit('close-login')">好的</v-btn>
        </div>
      </v-card>
      
      <!-- 联系卡片 -->
      <v-card v-if="ifShowContact" class="card">
        <div class="title-bold">联系我们</div>
        <div class="text-medium-bold">
          邮箱：<a href="mailto:admin@sharesdu.com">admin@sharesdu.com</a><br />
          QQ群：<a href="https://qm.qq.com/q/Uh7X13Hp8Q">246680702</a>
        </div>
        <div class="card-bottom-div">
          <v-btn variant="text" @click="$emit('close-contact')">好的</v-btn>
        </div>
      </v-card>
      
      <!-- 下载卡片 -->
      <v-card v-if="ifShowDownload" class="card">
        <div class="row-div">
          <div class="title-bold">测试阶段，有问题请联系管理员</div>
          <v-spacer></v-spacer>
          <v-btn @click="$emit('close-download')" :size="25" :icon="'mdi-close'" variant="text"></v-btn>
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
          <v-btn
            class="download-btn"
            prepend-icon="mdi-android"
            color="grey"
            variant="outlined"
            @click="$emit('download-android')">
            Android
          </v-btn>
          <v-btn
            class="download-btn"
            prepend-icon="mdi-apple"
            color="grey"
            variant="outlined"
            @click="$emit('download-ios')">
            IOS
          </v-btn>
          <v-btn
            class="download-btn"
            prepend-icon="mdi-circle-outline"
            color="grey"
            variant="outlined"
            @click="$emit('download-harmony')">
            HARMONY
          </v-btn>
        </div>
      </v-card>
    </div>
  </v-dialog>
</template>

<script setup>
defineProps({
  ifShowDialog: {
    type: Boolean,
    required: true,
  },
  ifShowLogin: {
    type: Boolean,
    required: true,
  },
  ifShowContact: {
    type: Boolean,
    required: true,
  },
  ifShowDownload: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['close-login', 'close-contact', 'close-download', 'download-android', 'download-ios', 'download-harmony', 'update:ifShowDialog']);
</script>

<style scoped>
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

.dialog-card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

@media screen and (min-width: 1000px) {
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
}

@media screen and (max-width: 1000px) {
  .dialog-card-container {
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

  .download-btn {
    width: 100%;
    margin: 6px 0;
    border-radius: 12px !important;
  }
}
</style>

