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
