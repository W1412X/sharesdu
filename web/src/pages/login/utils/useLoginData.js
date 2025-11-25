/**
 * LoginPage 数据管理 Composable
 */
import { ref } from 'vue';
import { globalProperties } from '@/main';

export function useLoginData() {
  // 登录数据
  const loginByUsernameData = ref({
    userName: null,
    passwd: null,
  });
  
  const loginByEmailData = ref({
    email: null,
    emailCode: null,
  });
  
  // 注册数据
  const registerByEmailData = ref({
    email: null,
    passwd: '',
    passwdConfirm: '',
    userName: '',
    campus: null,
    major: null,
    college: null,
    emailCode: null,
  });
  
  const registerByInviteData = ref({
    email: null,
    passwd: '',
    passwdConfirm: '',
    userName: '',
    campus: null,
    major: null,
    college: null,
    emailCode: null,
    inviteCode: null,
  });
  
  // 全局数据
  const apiUrl = globalProperties.$apiUrl;
  const campusList = globalProperties.$campus;
  const collegeList = globalProperties.$colleges;
  
  // 加载状态
  const loading = ref({
    login: false,
  });
  
  // 轮播图数据
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
    loginByUsernameData,
    loginByEmailData,
    registerByEmailData,
    registerByInviteData,
    apiUrl,
    campusList,
    collegeList,
    loading,
    carouselSlides,
  };
}

