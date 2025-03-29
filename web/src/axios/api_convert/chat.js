/**
 * 
 * @param {receiverId,content} data 
 * @returns 
 */
export function csChatSend(data) {
    return {
        receiver_id: data.receiverId,
        content: data.content,
    };
}

/**
 * 
 * @param {userId,pageSize,pageIndex} data 
 */
export function csGetChatList(data){
    return {
        user_id: data.userId,
        page_size: data.pageSize,
        page_index: data.pageIndex,
    };
}

/**
 * 
 * @param {sender_id,receiver_id ... ...} data 
 */
export function scGetChatListItem(data){
    return {
        senderId:data.sender_id,
        receiverId:data.receiver_id,
        content:data.content,
        time:data.send_at,
        isRead:data.read,
    }
}
