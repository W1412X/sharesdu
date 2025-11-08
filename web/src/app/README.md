# App 模块化结构

## 目录结构

```
src/app/
└── composables/
    ├── index.js              # 统一导出
    ├── useDevice.js          # 设备类型管理
    ├── useRouteState.js      # 路由状态管理
    ├── useUser.js            # 用户信息管理
    ├── useNavigation.js      # 导航栏逻辑
    ├── useDialog.js          # 对话框管理
    ├── useSearch.js          # 搜索功能
    ├── useMessage.js         # 消息和加载状态
    └── useMobileNav.js       # 移动端导航逻辑
```

## Composables 说明

### useDevice.js
管理设备类型（PC/移动端）相关的状态和计算属性。

**导出：**
- `deviceType`: 设备类型（'mobile' | 'desktop'）
- `ifMobile`: 是否为移动端的计算属性

### useRouteState.js
管理路由相关的状态，包括当前页面名称和头像状态。

**导出：**
- `page`: 当前页面名称
- `ifAvatarState`: 头像显示状态（用于触发重新渲染）

### useUser.js
管理用户信息，包括用户ID和用户名。

**导出：**
- `userId`: 用户ID
- `userName`: 用户名

### useNavigation.js
管理导航栏相关的所有逻辑，包括显示状态、颜色、按钮显示等。

**导出：**
- `themeColor`: 主题颜色
- `ifShowNav`: 是否显示导航栏
- `navColor`: 导航栏背景颜色
- `navIconColor`: 导航栏图标颜色
- `routerMarginTop`: 路由视图上边距
- `ifShowHomeBtn`: 是否显示首页按钮
- `ifShowAvatar`: 是否显示头像
- `ifShowTopEditBtns`: 是否显示顶部编辑按钮
- `ifShowService`: 是否显示服务按钮
- `ifCanSearchInputSuggestion`: 是否可以显示搜索建议

### useDialog.js
管理所有对话框的显示状态。

**导出：**
- `ifShowDialog`: 是否显示对话框（计算属性）
- `ifShowHistory`: 是否显示历史记录对话框
- `ifShowCourseEditor`: 是否显示课程编辑器
- `ifShowPostEditor`: 是否显示帖子编辑器
- `setShowHistoryState`: 设置历史记录对话框状态
- `setPostEditorState`: 设置帖子编辑器状态
- `setCourseEditorState`: 设置课程编辑器状态
- `closeDialog`: 关闭所有对话框

### useSearch.js
管理搜索功能相关的状态和方法。

**导出：**
- `searchContent`: 搜索内容
- `searchType`: 搜索类型
- `searchLabel`: 搜索标签（计算属性）
- `searchInputEventBus`: 搜索输入事件总线
- `handleSearchTypeChanged`: 处理搜索类型变化
- `search`: 执行搜索

### useMessage.js
管理消息提示和加载状态。

**导出：**
- `alertMsg`: 提示消息对象
- `loadMsg`: 加载消息对象
- `loadState`: 加载状态
- `alert`: 显示提示消息
- `setLoading`: 设置加载状态
- `setLoadState`: 设置加载状态标志

### useMobileNav.js
管理移动端导航相关的逻辑。

**导出：**
- `itemType`: 当前选中的标签类型
- `itemTypeList`: 标签类型列表
- `mobileIfShowSearchInput`: 移动端是否显示搜索输入框
- `ifShowBottomNav`: 是否显示底部导航
- `routerMarginBottom`: 路由视图下边距

## 使用示例

在 `App.vue` 中的使用方式：

```javascript
import {
  useDevice,
  useRouteState,
  useUser,
  useNavigation,
  useDialog,
  useSearch,
  useMessage,
  useMobileNav,
} from './app/composables';

export default {
  setup() {
    // 使用各个 composables
    const { deviceType, ifMobile } = useDevice();
    const { page, ifAvatarState } = useRouteState();
    const { userId, userName } = useUser();
    // ... 其他 composables
    
    return {
      // 返回所有需要的状态和方法
    };
  }
};
```

## 优势

1. **模块化**: 每个 composable 负责单一职责，代码组织清晰
2. **可复用**: 这些 composables 可以在其他组件中复用
3. **易维护**: 逻辑分离，修改某个功能时只需要修改对应的 composable
4. **易测试**: 每个 composable 可以独立测试
5. **类型安全**: 如果使用 TypeScript，可以更好地进行类型检查

## 注意事项

- 所有 composables 都遵循 Vue 3 Composition API 规范
- 保持原有逻辑不变，只是重新组织代码结构
- 如果需要在其他组件中使用这些逻辑，可以直接导入对应的 composable

