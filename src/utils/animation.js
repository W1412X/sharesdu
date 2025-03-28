import { globalProperties } from "@/main";
import { hexToRgba } from "./other";
import { getDeviceTypeByAgent } from "./device";
/**
 * init the bubble effect
 * @param {Document} document 
 */
export function initBubbleEffect(document,id='bubble_canvas',color=globalProperties.$themeColor) {
    let canvas, ctx, width, height, bubbles, animateHeader = true;

    function initHeader() {
        canvas = document.getElementById(id);
        window_resize();
        ctx = canvas.getContext('2d');
        // Create bubbles
        bubbles = [];
        const num = width * 0.05; // Bubble quantity
        for (let i = 0; i < num; i++) {
            const c = new Bubble();
            bubbles.push(c);
        }
        animate();
    }

    function animate() {
        if (animateHeader) {
            ctx.clearRect(0, 0, width, height);
            for (const bubble of bubbles) {
                bubble.draw();
            }
        }
        requestAnimationFrame(animate);
    }

    function window_resize() {
        // Set the canvas size based on the container size
        const panel = document.getElementById(id);
        width = panel.offsetWidth;
        height = panel.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    }

    window.onresize = function () {
        window_resize();
    };

    function Bubble() {
        const _this = this;
        (function () {
            _this.pos = {};
            init();
        })();

        function init() {
            _this.pos.x = Math.random() * width;
            _this.pos.y =  Math.random() * height;
            _this.alpha = 0.5 + Math.random() * 0.3;
            _this.sign_scale=-1;
            if(Math.random()>0.5){
                _this.sign_scale=1;
            }
            _this.alpha_change = _this.sign_scale*0.0001 + Math.random() * 0.0001;
            _this.scale = 0.5 + Math.random() * 3;
            _this.scale_change = Math.random() * 0.002; 
            _this.sign_x=-1;
            if (Math.random() > 0.5) {
                _this.sign_x = 1;
            }
            _this.sign_y=-1;
            if (Math.random() > 0.5) {
                _this.sign_y = 1;
            }
            _this.speed_x = Math.random() * 0.5 * _this.sign_x;
            _this.speed_y = Math.random() * 0.5 * _this.sign_y; 
        }

        this.draw = function () {
            console.log("alpha:"+_this.alpha);
            if (_this.alpha <= 0.1) {
                _this.alpha_change=-_this.alpha_change;                
            }else if (_this.alpha >= 0.8) {
                _this.alpha_change=-_this.alpha_change;
            }
            if(_this.scale>=3){
                _this.scale_change=-_this.scale_change;
            }else if(_this.scale<=0.5){
                _this.scale_change=-_this.scale_change;
            }
            _this.pos.x += _this.speed_x;
            _this.pos.y += _this.speed_y;
            if(_this.pos.x+_this.scale*10 > canvas.width || _this.pos.x-_this.scale*10 < 0){
                _this.speed_x = -_this.speed_x;
            }
            if(_this.pos.y+_this.scale*10 > canvas.height || _this.pos.y-_this.scale*10 < 0){
                _this.speed_y = -_this.speed_y;
            }
            _this.alpha -= _this.alpha_change;
            _this.scale += _this.scale_change;
            ctx.beginPath();
            ctx.arc(_this.pos.x, _this.pos.y, _this.scale * 10, 0, 2 * Math.PI, false);
            ctx.fillStyle=hexToRgba(color, _this.alpha)
            ctx.fill();
        };
    }

    initHeader();
}

export function initTriangleEffect(document,color=globalProperties.$themeColor) {
    const canvas = document.getElementById('canvas')
    const ctx = canvas.getContext('2d')
    let width = window.innerWidth
    let height = window.innerHeight
   
    let dotsNum = width*height/20000
    let radius = 0
    let fillStyle = hexToRgba(color, 0.5)
    let lineWidth = 1
    let connection = 120
    let followLength = 80
   
    let dots = []
    let animationFrame = null
    let mouseX = null
    let mouseY = null
   
    function addCanvasSize () {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      ctx.clearRect(0, 0, width, height)
      dots = []
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      initDots(dotsNum)
      moveDots()
    }
   
    function mouseMove (e) {
      mouseX = e.clientX
      mouseY = e.clientY
    }
   
    function mouseOut (e) {
        e
      mouseX = null
      mouseY = null
    }
   
    function mouseClick () {
      for (const dot of dots) dot.elastic()
    }
   
    class Dot {
      constructor(x, y) {
        this.x = x
        this.y = y
        this.speedX = Math.random() * 1 - 0.5
        this.speedY = Math.random() * 1 - 0.5
        this.follow = false
        this.connect_num=0;
      }
      draw () {
        ctx.beginPath()
        ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI)
        ctx.fill()
        ctx.closePath()
      }
      move () {
        if (this.x >= width || this.x <= 0) this.speedX = -this.speedX
        if (this.y >= height || this.y <= 0) this.speedY = -this.speedY
        this.x += this.speedX
        this.y += this.speedY
        if (this.speedX >= 0.5) this.speedX-=0.5
        if (this.speedX <= -0.5) this.speedX+=0.5
        if (this.speedY >= 0.5) this.speedY-=0.5
        if (this.speedY <= -0.5) this.speedY+=0.5
        this.correct()
        this.connectMouse()
        this.draw()
      }
      correct () {
        if (!mouseX || !mouseY) return
        let lengthX = mouseX - this.x
        let lengthY = mouseY - this.y
        const distance = Math.sqrt(lengthX ** 2 + lengthY ** 2)
        if (distance <= followLength) this.follow = true
        else if (this.follow === true && distance > followLength && distance <= followLength + 8) {
          let proportion = followLength / distance
          lengthX *= proportion
          lengthY *= proportion
          this.x = mouseX - lengthX
          this.y = mouseY - lengthY
        } else this.follow = false
      }
      connectMouse () {
        if (mouseX && mouseY) {
          let lengthX = mouseX - this.x
          let lengthY = mouseY - this.y
          const distance = Math.sqrt(lengthX ** 2 + lengthY ** 2)
          if (distance <= connection) {
            let opacity = (1 - distance / connection) * 0.5
            ctx.strokeStyle = hexToRgba(color,opacity);
            ctx.beginPath()
            ctx.moveTo(this.x, this.y)
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
            ctx.closePath()
          }
        }
      }
      elastic () {
        let lengthX = mouseX - this.x
        let lengthY = mouseY - this.y
        const distance = Math.sqrt(lengthX ** 2 + lengthY ** 2)
        if (distance >= connection) return
        const rate = 1 - distance / connection
        this.speedX = 25 * rate * -lengthX / distance
        this.speedY =25 * rate * -lengthY / distance
      }
    }
   
    function initDots (num) {
      ctx.fillStyle = fillStyle
      ctx.lineWidth = lineWidth
      for (let i = 0; i < num; i++) {
        const x = Math.floor(Math.random() * width)
        const y = Math.floor(Math.random() * height)
        const dot = new Dot(x, y)
        dot.draw()
        dots.push(dot)
      }
    }
   
    function moveDots () {
      ctx.clearRect(0, 0, width, height)
      for (const dot of dots) {
        dot.move()
      }
      for(let i = 0; i < dots.length; i++){
          dots[i].connect_num=0;
      }
      for (let i = 0; i < dots.length; i++) {
        for (let j = i; j < dots.length; j++) {
          const distance = Math.sqrt((dots[i].x - dots[j].x) ** 2 + (dots[i].y - dots[j].y) ** 2)
          if (distance <= connection && dots[i].connect_num<=100 && dots[j].connect_num<=100) {
            dots[i].connect_num++;
            dots[j].connect_num++;
            let opacity = (1 - distance / connection) * 0.5
            ctx.strokeStyle = hexToRgba(color,opacity);
            ctx.beginPath()
            ctx.moveTo(dots[i].x, dots[i].y)
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
            ctx.closePath()
          }
        }
      }
      animationFrame = window.requestAnimationFrame(moveDots)
    }
   
    addCanvasSize()
   
    initDots(dotsNum)
    moveDots()
    if(getDeviceTypeByAgent()=='desktop'){
      document.onmousemove = mouseMove
      document.onmouseout = mouseOut
      document.onclick = mouseClick
    }
    console.log(getDeviceTypeByAgent());
    window.onresize = addCanvasSize
}