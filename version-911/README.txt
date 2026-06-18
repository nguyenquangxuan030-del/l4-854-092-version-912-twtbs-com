高清剧集大全静态网站

目录说明：
- index.html：首页，包含轮播 Hero、热门推荐、分类入口、排行榜。
- movies.html：全站片库，包含全部影片卡片并支持筛选。
- categories.html：分类总览页。
- category/：独立分类页。
- rank.html：排行榜页。
- search.html：全站搜索页。
- video/：影片详情页与播放器页。
- assets/css/style.css：站点样式，已保持清晰格式。
- assets/js/main.js：交互与 HLS 播放器初始化逻辑，已保持清晰格式。

图片放置：
请把 1.jpg 到 150.jpg 放在网站根目录，与 index.html 同级。页面已按影片序号循环引用这些图片。

播放说明：
详情页播放器已绑定从原 JS 中提取的 m3u8 播放源，并通过 HLS 逻辑在点击播放时初始化。

生成结果：
影片记录数：2000
HLS 源数量：20
