### 组件规范  
- 一般性对于需要传入数据的组件，在props中声明initData属性字典  
- 对于需要传入数据，修改数据，编辑数据的组件，除了initData之外，在data中添加data属性字典  
- 组件中，initData和data属性字典的key值要保持一致   

### Some tips  
- for article part image upload,use the blob to show the image and upload the image to the server when submit,which can avoid the repeat upload  and preview problems