/**
 * CoursePage 加载逻辑 Composable
 */
import {
  getCourseDetail,
  getCourseScoreList,
  getCoursePostList,
  getUserCourseEvaluation,
  rateCourse,
  editRating,
} from '@/api/modules/course';
import { getNormalErrorAlert, getNormalSuccessAlert } from '@/utils/other';
import { acquireLock, releaseLock, getLock } from '@/utils/lock';
import { openPage } from '@/utils/other';
import { addHistory } from '@/utils/history';
import { generateCoursePosterImage } from '@/utils/poster';
import { isElementAtBottom, isScrollToBottom } from '@/utils/other';
import { copy } from '@/utils/other';
import {
  transformCourseData,
  transformCommentList,
  transformPostList,
  transformSelfComment,
} from './dataTransformers';
import { getCookie } from '@/utils/cookie';

export function useCourseLoad(
  course,
  selfComment,
  oriSelfComment,
  ifRated,
  commentList,
  commentPageNum,
  postItems,
  postPageNum,
  allLoad,
  loading,
  loadState,
  posterImageUrl,
  setCourse,
  setSelfComment,
  updateSelfComment,
  resetSelfComment,
  setIfRated,
  addComments,
  addPosts,
  setPosterDisplayerState,
  setLoading,
  alert
) {
  /**
   * 加载课程详情
   * @param {String} courseId - 课程ID
   * @returns {Promise<Boolean>} 是否加载成功
   */
  const loadCourse = async (courseId) => {
    loadState.value.course = false;
    try {
      const response = await getCourseDetail(courseId);
      loadState.value.course = true;
      
      if (response.status === 200) {
        const transformedData = transformCourseData(response);
        if (transformedData) {
          setCourse(transformedData);
          
          // 添加到历史记录
          await addHistory('course', transformedData.id, transformedData.name);
          
          // 更新页面标题
          if (document.getElementById('web-title')) {
            document.getElementById('web-title').innerText = '课程 | ' + transformedData.name;
          }
          
          alert(getNormalSuccessAlert('获取课程信息成功'));
          return true;
        }
      } else {
        alert(getNormalErrorAlert(response.message));
        openPage('router', {
          name: 'ErrorPage',
          params: { reason: '课程信息获取失败' },
        });
        return false;
      }
    } catch (error) {
      loadState.value.course = true;
      alert(getNormalErrorAlert(error.message || '获取课程信息失败'));
      return false;
    }
  };
  
  /**
   * 加载用户自己的评价
   * @param {String} courseId - 课程ID
   * @returns {Promise<Boolean>} 是否加载成功
   */
  const loadSelfComment = async (courseId) => {
    loadState.value.selfComment = false;
    try {
      const userId = getCookie('userId');
      const response = await getUserCourseEvaluation(userId, courseId);
      loadState.value.selfComment = true;
      
      if (response.status === 200) {
        const transformed = transformSelfComment(response);
        if (transformed) {
          setSelfComment(transformed);
          setIfRated(true);
          alert(getNormalSuccessAlert('成功获取您的评分'));
          return true;
        }
      }
      return false;
    } catch (error) {
      loadState.value.selfComment = true;
      return false;
    }
  };
  
  /**
   * 加载更多评论
   * @param {String} courseId - 课程ID
   * @param {Number} targetPageNum - 目标页码（可选，用于恢复状态）
   * @returns {Promise<Boolean>} 是否加载成功
   */
  const loadMoreComments = async (courseId, targetPageNum = null) => {
    if (allLoad.value.comment) {
      return true;
    }
    
    await acquireLock(`course-load-comment${courseId}`);
    loading.value.loadEvaluation = true;
    
    try {
      const response = await getCourseScoreList(courseId, commentPageNum.value);
      
      if (response.status === 200) {
        const userId = getCookie('userId');
        const transformed = transformCommentList(response.score_list || [], userId);
        addComments(transformed);
        commentPageNum.value++;
        
        if (response.total_pages <= response.current_page) {
          allLoad.value.comment = true;
        }
        
        // 如果指定了目标页码，继续加载直到达到目标页码
        if (targetPageNum && commentPageNum.value < targetPageNum && !allLoad.value.comment) {
          await loadMoreComments(courseId, targetPageNum);
        }
        
        return true;
      } else {
        alert(getNormalErrorAlert(response.message));
        return false;
      }
    } catch (error) {
      alert(getNormalErrorAlert(error.message || '加载评论失败'));
      return false;
    } finally {
      loading.value.loadEvaluation = false;
      releaseLock(`course-load-comment${courseId}`);
    }
  };
  
  /**
   * 加载更多帖子
   * @param {String} courseId - 课程ID
   * @param {Number} targetPageNum - 目标页码（可选，用于恢复状态）
   * @returns {Promise<Boolean>} 是否加载成功
   */
  const loadMorePosts = async (courseId, targetPageNum = null) => {
    if (allLoad.value.post) {
      return true;
    }
    
    await acquireLock(`course-load-post${courseId}`);
    loading.value.post = true;
    
    try {
      const response = await getCoursePostList(courseId, postPageNum.value);
      
      if (response.status === 200) {
        const transformed = transformPostList(response.post_list || []);
        addPosts(transformed);
        postPageNum.value++;
        
        if (response.total_pages <= response.current_page) {
          allLoad.value.post = true;
        }
        
        // 如果指定了目标页码，继续加载直到达到目标页码
        if (targetPageNum && postPageNum.value < targetPageNum && !allLoad.value.post) {
          await loadMorePosts(courseId, targetPageNum);
        }
        
        return true;
      } else {
        alert(getNormalErrorAlert(response.data?.message || response.message || '加载帖子失败'));
        return false;
      }
    } catch (error) {
      alert(getNormalErrorAlert(error.message || '加载帖子失败'));
      return false;
    } finally {
      loading.value.post = false;
      releaseLock(`course-load-post${courseId}`);
    }
  };
  
  /**
   * 提交评价
   * @param {String} courseId - 课程ID
   * @returns {Promise<Boolean>} 是否提交成功
   */
  const submitComment = async (courseId) => {
    if (selfComment.value.score === 0 || selfComment.value.score === null) {
      alert({
        state: true,
        color: 'warning',
        title: '评分失败',
        content: '请选择您的评分',
      });
      return false;
    }
    
    loading.value.submitEvaluation = true;
    
    try {
      let response;
      if (ifRated.value) {
        // 已评价，修改评价
        response = await editRating({
          course_id: courseId,
          score: selfComment.value.score,
          comment: selfComment.value.comment,
        });
      } else {
        // 未评价，新建评价
        response = await rateCourse({
          course_id: courseId,
          score: selfComment.value.score,
          comment: selfComment.value.comment,
        });
      }
      
      if (response.status === 200 || response.status === 201) {
        oriSelfComment.value = copy(selfComment.value);
        alert(getNormalSuccessAlert('提交成功'));
        setIfRated(true);
        return true;
      } else {
        resetSelfComment();
        alert(getNormalErrorAlert(response.message));
        return false;
      }
    } catch (error) {
      resetSelfComment();
      alert(getNormalErrorAlert(error.message || '提交失败'));
      return false;
    } finally {
      loading.value.submitEvaluation = false;
    }
  };
  
  /**
   * 生成分享海报
   * @returns {Promise<Boolean>} 是否生成成功
   */
  const generateShareImage = async () => {
    setLoading({
      state: true,
      text: '正在生成海报...',
      progress: -1,
    });
    
    try {
      const url = await generateCoursePosterImage({
        title: course.value.name,
        type: course.value.type,
        teacher: course.value.teacher,
        rating: course.value.avgScore,
        ratingCount: course.value.evaluateNum,
        url: window.location.href,
      });
      
      posterImageUrl.value = url;
      setLoading({ state: false });
      setPosterDisplayerState(true);
      return true;
    } catch (error) {
      setLoading({ state: false });
      alert(getNormalErrorAlert(error.message || '生成海报失败'));
      return false;
    }
  };
  
  /**
   * 滚动加载（评论或帖子）
   * @param {String} courseId - 课程ID
   * @param {Boolean} isPostMode - 是否是帖子模式
   */
  const glideLoad = async (courseId, isPostMode) => {
    if (isPostMode) {
      // 加载帖子
      if (getLock(`course-load-post${courseId}`)) {
        return;
      }
      const container = document.getElementById('post-container');
      if (container && isScrollToBottom(container)) {
        await loadMorePosts(courseId);
      }
    } else {
      // 加载评论
      if (getLock(`course-load-comment${courseId}`)) {
        return;
      }
      const container = document.getElementById('comments-container');
      if (container && isElementAtBottom(container)) {
        await loadMoreComments(courseId);
      }
    }
  };
  
  return {
    loadCourse,
    loadSelfComment,
    loadMoreComments,
    loadMorePosts,
    submitComment,
    generateShareImage,
    glideLoad,
  };
}

