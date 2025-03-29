/**
 * 
 * @param {JSON} data 
 * @returns 
 */
export function scCourseDetail(data){
    return {
        status:data.status,
        message:data.message,
        detail:{
            id:data.course_detail.course_id,
            name:data.course_detail.course_name,
            type:data.course_detail.course_type,
            college:data.course_detail.college,
            campus:data.course_detail.campus,
            credits:data.course_detail.credits,
            teacher:data.course_detail.course_teacher,
            attendMethod:data.course_detail.attend_method,
            examineMethod:data.course_detail.assessment_method,
            avgScore:data.course_detail.score,
            relativeArticles:data.course_detail.relative_articles,
            time:data.publish_time,
        }
    }
}

export function scCourseSelfComment(data){
    return {
        status:data.status,
        message:data.message,
        score:data.score,
        comment:data.comment,
    }
}

export function scCourseCommentList(data){
    var result={
        status:data.status,
        message:data.message,
        commentList:[],
    }
    for(let i=0;i<data.score_list.length;i++){
        result.commentList.push({
            profileUrl:data.score_list[i].user.profile_url,
            name:data.score_list[i].scorer_name,
            score:data.score_list[i].score,
            comment:data.score_list[i].comment,
            id:data.score_list[i].score_id,
        })
    }
    return result;
}