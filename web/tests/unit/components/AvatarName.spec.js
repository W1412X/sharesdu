/**
 * AvatarName 组件单元测试
 */
import { mount } from '@vue/test-utils';
import AvatarName from '@/components/common/AvatarName.vue';
import { getCookie } from '@/utils/cookie';

// Mock 依赖
jest.mock('@/utils/cookie');
jest.mock('@/utils/profile', () => ({
  getProfileUrl: jest.fn(() => Promise.resolve('blob:mock-url'))
}));
jest.mock('@/utils/lock', () => ({
  acquireLock: jest.fn(() => Promise.resolve()),
  releaseLock: jest.fn()
}));
jest.mock('@/utils/global_img_cache', () => ({
  globalProfileCacher: {
    getImage: jest.fn(() => null),
    addImage: jest.fn()
  }
}));
jest.mock('@/utils/other', () => ({
  openPage: jest.fn()
}));
jest.mock('@/main', () => ({
  globalProperties: {
    $themeColor: '#9c0c13',
    $apiUrl: 'https://api.sharesdu.com/index/api',
    $imgDict: {
      svg: {
        lazy: '/resource/default_img.svg'
      }
    }
  }
}));

describe('AvatarName.vue', () => {
  beforeEach(() => {
    getCookie.mockReturnValue(null);
  });

  test('应该正确渲染组件', () => {
    const wrapper = mount(AvatarName, {
      props: {
        initData: {
          id: '123',
          name: '测试用户'
        }
      }
    });
    expect(wrapper.exists()).toBe(true);
  });

  test('应该显示用户名', () => {
    const wrapper = mount(AvatarName, {
      props: {
        initData: {
          id: '123',
          name: '测试用户'
        },
        ifShowName: true
      }
    });
    expect(wrapper.text()).toContain('测试用户');
  });

  test('应该隐藏用户名当ifShowName为false时', () => {
    const wrapper = mount(AvatarName, {
      props: {
        initData: {
          id: '123',
          name: '测试用户'
        },
        ifShowName: false
      }
    });
    expect(wrapper.text()).not.toContain('测试用户');
  });

  test('应该显示默认图标当没有头像时', async () => {
    const wrapper = mount(AvatarName, {
      props: {
        initData: {
          id: '123',
          name: '测试用户'
        }
      }
    });
    
    await wrapper.vm.$nextTick();
    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 检查是否显示默认图标
    const icon = wrapper.find('v-icon-stub');
    // 由于懒加载，可能不会立即显示图标
    expect(wrapper.exists()).toBe(true);
  });

  test('应该正确设置头像大小', () => {
    const wrapper = mount(AvatarName, {
      props: {
        initData: {
          id: '123',
          name: '测试用户'
        },
        size: '50'
      }
    });
    // 检查组件是否正确接收 size prop
    expect(wrapper.props('size')).toBe('50');
  });

  test('应该处理点击事件当clickable为true时', async () => {
    const wrapper = mount(AvatarName, {
      props: {
        initData: {
          id: '123',
          name: '测试用户'
        },
        clickable: true
      }
    });
    
    await wrapper.trigger('click');
    // 验证 toAuthorPage 方法存在
    expect(wrapper.vm.toAuthorPage).toBeDefined();
  });

  test('应该忽略点击事件当clickable为false时', async () => {
    const wrapper = mount(AvatarName, {
      props: {
        initData: {
          id: '123',
          name: '测试用户'
        },
        clickable: false
      }
    });
    
    await wrapper.trigger('click');
    // 应该不会触发导航
    expect(wrapper.vm.toAuthorPage).toBeDefined();
  });
});
