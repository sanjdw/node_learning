学习了一下svg，尝试用svg代替票档的背景图片

```
<!DOCTYPE html>
<html>
<head>
	<title></title>
	<style type="text/css">
		.ticket {
			border-radius: 4px;
			border: 1px solid #f0f0f0;
			border-left: none;
		}
		.ticket.active {
			border: 1px solid red;
			border-left: none;
		}
	</style>
</head>
<body>
<svg class="ticket" viewbox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="200" height="100">
	<circle cx="0" cy="50" r="18" stroke="#f0f0f0" fill="#fff"></circle>
	<line x1="0" y1="0" x2="0" y2="32" stroke="#f0f0f0" stroke-width="2"> </line>
	<line x1="0" y1="68" x2="0" y2="100" stroke="#f0f0f0" stroke-width="2"> </line>
</svg>
<svg class="ticket active" viewbox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" width="200" height="100">
	<circle cx="0" cy="50" r="18" stroke="red" fill="#fff"></circle>
	<line x1="0" y1="0" x2="0" y2="32" stroke="red" stroke-width="2"> </line>
	<line x1="0" y1="68" x2="0" y2="100" stroke="red" stroke-width="2"> </line>
	<path d="M 150,100 L 200,65 L 200,100 Z" fill="red"></path>
	<polyline points="175,90 180,95 195,82" fill="none" stroke="#fff" stroke-width="2"></polyline>
</svg>
</body>
</html>
```