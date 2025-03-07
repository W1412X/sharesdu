import requests 
data={
    "refresh":"44"
}
response=requests.post("https://api.sharesdu.com/index/api/token/refresh",json=data)
print(response.content)