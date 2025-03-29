## profile set(indexdb)  
- profile data should always comes from the local 
- use local db to save the profile data  
- and set the profile request in the avatar-name

## compress image when upload image  
- for profile 64*64
- for other keep origin scale and compress it less then 1M when nessary  

## use base64 encode the cookie  

## use pre-tree to check the sensitive word  

## use sessionStorage to save the cache data  
- for some get request,record the url-response in sessionStorage and use it when the url is same