export const coursePosterHtml=`<div
  style="width: 290px; height: 160px; background: white; border: 1px solid #e0e0e0; box-shadow: 0 2px 6px rgba(0,0,0,0.1); font-family: 'Microsoft YaHei', 'Segoe UI', sans-serif; padding: 10px; box-sizing: border-box; line-height: 1.5;">
  
  <!-- 课程标题 -->
  <h2 id="course-title"
    style="
      margin: 0 0 4px;
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      max-width: 260px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    ">
    深度学习实战——从入门到项目落地
  </h2>

  <!-- 评分 -->
  <p id="course-rating"
    style="margin: 0 0 8px; font-size: 12px; color: #444; line-height: 1.4;">
    <span style="color: #ffa41c; font-size:16px; letter-spacing: 1px;">★★★★☆</span>
    <span style="color: #666; margin-left: 4px;">4.8</span>
    <span style="color: #999; font-size: 12px;">(评分人数: <span id="rating-count">156</span>)</span>
  </p>

  <!-- 课程类型和教师 -->
  <div style="display:flex; flex-direction:row; align-items: center; margin-bottom: 12px;">
    
    <!-- 课程类型 -->
    <p id="course-type"
      style="
        margin: 0;
        font-size: 12px;
        color: #555;
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        letter-spacing: 0.2px;
      ">
      <strong style="color: #333;">课程类型:</strong> 实sdkoakdo践课
    </p>
    
    <!-- 授课教师 -->
    <p id="course-teacher"
      style="
        margin: 0;
        margin-left: 10px;
        font-size: 12px;
        color: #555;
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        letter-spacing: 0.2px;
      ">
      <strong style="color: #333;">授课教师:</strong> 王博士sdaojowjfow
    </p>
  </div>

  <!-- Logo 和 二维码 + 宣传语 -->
  <div style="display: flex; flex-direction: row; margin-top: 10px; align-items: center;">
   	<div style="display:flex;flex-direction:column;">
          <!-- Logo -->
    <img src="https://sharesdu.com/resource/logo_trans.png"
      style="width: 45px; height: 45px; margin-right: 80px; opacity: 0.95;">

      <span style="font-size:8px;color:#888">sharesdu.com</span>
    </div>
    <!-- 右侧内容 -->
    <div style="display: flex; flex-direction: row; align-items: center; height: 100%;margin-top:10px;">
      
      <!-- 宣传语 -->
      <div id="slogan"
        style="font-size: 9px; color: #666; white-space: nowrap; line-height: 1.3;">
        <div style="display:flex; flex-direction:row-reverse;">
          <span>保存图片至相册</span>
        </div>
        <div style="display:flex; flex-direction:row-reverse;">
          <span>扫描二维码查看此课程</span>
        </div>
        <div style="display:flex; flex-direction:row-reverse; font-size:7px; color:#aaa;">
          <span>分享于<span id="share-time">2025-09-25 00:00:00</span></span>
        </div>
      </div>

      <!-- 二维码 -->
      <div>
        <img id="qr-code"
          src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&amp;data=https://sharesdu.com/course/dl202"
          alt="课程二维码"
          style="width: 45px; height: 45px; border: 1px solid #f0f0f0; border-radius: 4px; margin-left: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.08);">
      </div>
    </div>
  </div>
</div>`
