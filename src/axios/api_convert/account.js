/**
 * register by email 
 */
export function csRegisterByEmail(data){
    return {
        user_name:data.userName,
        pass_word:data.passwd,
        email:data.email,
        email_code:data.emailCode,
        campus:data.campus,
        college:data.college,
        major:data.major
    }
}

/**
 * login by user name and password
 */
export function csLoginByUserName(data){
    return {
        user_name:data.userName,
        pass_word:data.passwd
    }
}

/**
 * login by email  
 */
export function csLoginByEmail(data){
    return {
        email:data.email,
        email_code:data.emailCode
    }
}

/**
 * the response of login
 * logining by email/username has same response
 */
export function scLogin(data){
    return {
        status:data.status,
        message:data.message,
        userId:data.user_id,
        userName:data.user_name,
        email:data.email
    }
}

/**
 * delete the account  
 */
export function csDeleteAccount(data){
    return {
        user_name:data.userName,
        email:data.email,
        email_code:data.emailCode
    }
}

/**
 * reset the password
 */
export function csResetPassword(data){
    return {
        email:data.email,
        email_code:data.emailCode,
        new_pass_word:data.passwd,
    }
}

/**
 * convert the author info 
 * @param {*} data 
 * @returns 
 */
export function scAuthorInfo(data){
    return {
        status:data.status,
        message:data.message,
        info:{
            id:data.user_id,
            name:data.user_name,
            email:data.email,
            profileUrl:data.profile_url,
            reputationLevel:data.reputation_level,
            master:data.master,
            superMaster:data.super_master,
            campus:data.campus,
            college:data.college,
            major:data.major,
            registrationYear:data.registration_year,
            blockStatus:data.block_status,
        }
    }
}

/**
 * 
 */
export function scSelfInfo(data){
    return {
        status:data.status,
        message:data.message,
        info:{
            id:data.user_id,
            name:data.userName,
            email:data.email,
            profileUrl:data.profile_url,
            reputationLevel:data.reputation_level,
            master:data.master,
            superMaster:data.super_master,
            campus:data.campus,
            college:data.college,
            major:data.major,
            numArticle:data.all_articles,
            numPost:data.all_posts,
            numReply:data.all_replys,
            time:data.created_at,
            blockStatus:data.block_status,
            blockEndTime:data.block_end_time
        }
    }
}