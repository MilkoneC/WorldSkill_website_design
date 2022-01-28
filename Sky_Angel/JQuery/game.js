// JavaScript Document
var ctx;	//画布
var cloudlist=[]; //云对象列表
var starlist=[];	//星星对象列表
var birdlist=[];	//鸟对象列表
var bulletlist=[];//子弹对象列表
var gassupplylist=[];		//补给油对象
var airplane=[];	//飞机对象
var userfacec;	//仪表盘界面
var audiolist;//音频对象
var user;	//用户对象
var outcanvas=document.createElement("canvas");//新建离屏画布用于防止卡顿
var oute=outcanvas.getContext("2d");			//离屏画布对象


var SizeEnum = {
	cloud_max: 8,
	star_max: 5,
	bird_max: 4,
	airplane_max:1,
	canvas_width: 1024,
	canvas_height: 768,
};

outcanvas.width=SizeEnum.canvas_width;	//离屏画布宽
outcanvas.height=SizeEnum.canvas_height;

$(document).ready(function(){
	"use strict";
	init();//初始化并创建所有对象
	draw();
});
function username(e){
	"use strict";
	if(e.length>0){
		$("#submit").removeAttr("disabled");
	}else{
		$("#submit").attr("disabled","disabled");
	}
}
function init(){
	"use strict";
	var canvas = $('#gameview')[0];	//获取画布容器
    ctx = canvas.getContext("2d");	//画布
	var p;
	user= new User();
	for(p=0;p<=SizeEnum.cloud_max;p++){//云块数量
		var cloud=new Cloud();
		cloudlist.push(cloud);	
	}
	for(p=0;p<=SizeEnum.star_max;p++){//星星数量
		var star=new Star();
		starlist.push(star);
	}
	for(p=0;p<=SizeEnum.bird_max;p++){//鸟数量
		var bird=new Bird();
		birdlist.push(bird);
	}
	gassupplylist.push(new Gas());
	airplane.push(new Airplane());
	userfacec=new Interface();
	audiolist=new Audio_list();
	
	audiolist.volume(0);
	$("#audioc").click(function(){
		$("#audioc").hide();
		$("#audioo").show();
		audiolist.volume(1);
	});
	
	$("#audioo").click(function(){
		$("#audioo").hide();
		$("#audioc").show();
		audiolist.volume(0);
	});
	$("#begin").click(function(){
		$("#begin").hide();
		$("#stop").show();
		$("#shuom").hide();
		$("#paih").hide();
		$("#begingame").hide();
		user.game_state="play";
		audiolist.background.play();
	});
	$("#stop").click(function(){
		$("#begin").show();
		$("#stop").hide();
		
		$("#shuom").show();
		$("#paih").show();
		$("#begingame").show();
		user.game_state="stop";
		audiolist.pause();
	});
}
function draw(){
	"use strict";
	requestAnimationFrame(function step(){	//每秒60帧
		ctx.save();		//保存
		switch(user.game_state){
			case "begin":
				ctx.clearRect(0, 0, SizeEnum.canvas_width, SizeEnum.canvas_height);	//清屏
				draw_step();
				ctx.drawImage(outcanvas,0,0,SizeEnum.canvas_width,SizeEnum.canvas_height);	//绘制离屏到视图
				oute.clearRect(0, 0, SizeEnum.canvas_width, SizeEnum.canvas_height);
				user.game_state="stop";
			break;
			case "play":
				ctx.clearRect(0, 0, SizeEnum.canvas_width, SizeEnum.canvas_height);	//清屏
				if(user.gasnum<=0){
					user.gasnum=0;
					user.game_state="finish";
				}
				if(user.gasnum>1859){
					user.gasnum=1859;
				}
				draw_step();
				user.time=user.time+1;
				user.gasnum=user.gasnum-1;//*****
				ctx.drawImage(outcanvas,0,0,SizeEnum.canvas_width,SizeEnum.canvas_height);	//绘制离屏到视图
				oute.clearRect(0, 0, SizeEnum.canvas_width, SizeEnum.canvas_height);
			break;
			case "finish":
				audiolist.background.pause();
				audiolist.finish.play();
				
				user.game_state="stop";
			break;
			case "stop":
				if(audiolist.finish.ended){
					$("#formbox").show();
				}
			break;
		}
		ctx.restore();	//取出缓存
		requestAnimationFrame(step);//再次调用
	});
}

function draw_step(){
	"use strict";
	var p;
	for(p=0;p<cloudlist.length;p++){	//遍历云对象列表
		cloudlist[p].step();
	}
	gassupplylist[0].step();
	for(p=0;p<starlist.length;p++){			//遍历星星对象列表
		starlist[p].step();
	}
	for(p=0;p<birdlist.length;p++){		//遍历鸟对象列表
		birdlist[p].step();
	}
	for(p=0;p<bulletlist.length;p++){
		bulletlist[p].step(p);
	}
	hit_step();
	userfacec.step();
	airplane[0].step();
}

function collision_detection(s,m){ //碰撞检测，使用最简单的像素坐标比较
	"use strict";
	var m_index;
	var s_index;
	var x;
	var y;
	var x1;
	var y1;
	for(m_index=0;m_index<m.length;m_index++){
		if(m[m_index].hit_open===false){//如果没打开碰撞检测
			continue;//跳到下一次
		}
		for(s_index=0;s_index<s.length;s_index++){
			for(x=m[m_index].x+m[m_index].w;x>m[m_index].x;x=x-1){
				for(x1=s[s_index].x+s[s_index].w;x1>s[s_index].x;x1=x1-1){
					if(x===x1){
						for(y=m[m_index].y+m[m_index].h;y>m[m_index].y;y=y-1){
							for(y1=s[s_index].y+s[s_index].h;y1>s[s_index].y;y1=y1-1){
								if(y===y1){
									console.log(m[m_index].name + ' and ' + s[s_index].name + ' hit');
									m[m_index].hit(m_index);
									s[s_index].hit(s_index);
									return true;
								}
							}
						}
					}
				}
			}
		}
	}
}

function hit_step(){
	"use strict";
	if(collision_detection(airplane,starlist)){//飞机和星星的碰撞检测
		user.starnum=user.starnum+1;
		console.log('star + 1');
	}
	if(collision_detection(airplane,birdlist)){//飞机和鸟的碰撞检测
		user.gasnum=user.gasnum-600;	
		console.log('gas - 10');			
	}
	if(collision_detection(airplane,gassupplylist)){//飞机和补给油的碰撞检测
		user.gasnum=user.gasnum+600;
		console.log('gas + 10');
	}
	if(collision_detection(bulletlist,birdlist)){//子弹和鸟的碰撞检测
		//gasnum=gasnum+600;
		console.log('hit bird');	
	}
}

var Cloud=function(){
	"use strict";
	this.speed=parseInt(Math.random()*(5-2+1)+2);//云流动速度
	this.y=parseInt(SizeEnum.canvas_height*Math.random());			//云高度
	this.x=parseInt(SizeEnum.canvas_width*Math.random());		//云开始位置
	this.width=parseInt(Math.random()*(700-300+1)+300);//云大小，宽度
	this.kind=parseInt(4*Math.random());		//云块种类
	this.name = "cloud";
	switch(this.kind){
		case 0:
			this.e=$("#cloud0")[0];
			break;
		case 1:
			this.e=$("#cloud1")[0];
			break;
		case 2:
			this.e=$("#cloud2")[0];
			break;
		case 3:
			this.e=$("#cloud3")[0];
			break;
	}
	this.step=function(){
		oute.drawImage(this.e,this.x,this.y,this.width,this.width*0.6);//绘画云到离屏
		this.x=this.x-this.speed;		//云的x轴减去速度
		if(this.x<=-this.width){			//如果云离开屏幕
			this.x=SizeEnum.canvas_width;							//移动位置到最右边
			this.y=parseInt(SizeEnum.canvas_height*Math.random());		//再次随机高度
		}
	};
};
var Gas=function(){
	"use strict";
	this.speed=2;				//补给油下降速度
	this.y=parseInt(100*Math.random());//油高度
	this.x=50;//油开始位置
	this.e=[$("#gas1")[0],$("#gas2")[0],$("#gas3")[0],$("#gas4")[0]];	//动画帧的数组
	this.w=50;
	this.h=50;
	this.frame=0;
	this.name = "gas";
	this.hit=function(){
		this.y=-600;//油开始位置
		this.x=parseInt(Math.random()*(1000-20+1)+20);
	};
	this.step=function(){
		var gas_frame=0;
		this.frame=this.frame+1;
		gas_frame = parseInt(this.frame / 10 % this.e.length);
		oute.drawImage(this.e[gas_frame],this.x,this.y,this.w,this.h);	//绘画油到离屏
		this.y=this.y+this.speed;
		if(this.y>=1200+80){//超出画布，就改变x位置
			this.y=0;//油高度
			this.x=parseInt(Math.random()*(800-300+1)+300);   //油开始位置
		}	
	};
};
var Star=function(){
	"use strict";
	this.speed=2;									//星星下落速度
	this.y=parseInt(Math.random()*(600-20+1)+20);	//星星开始高度
	this.x=parseInt(Math.random()*(SizeEnum.canvas_width-20+1)+20);	//星星开始始位置
	this.e=[$("#star1")[0],$("#star2")[0],$("#star3")[0],$("#star4")[0],$("#star5")[0],$("#star6")[0],$("#star7")[0]];
	this.frame=0;									//旋转动画帧数
	this.w=30;
	this.h=30;
	this.name = "Star";

	this.hit=function(){
		this.y=-50;//星星开始位置
		this.x=parseInt(Math.random()*(1000-20+1)+20);
		
		audiolist.star.load();
		audiolist.star.play();
	};
	this.step=function(){
		var star_frame=0;
		this.frame=this.frame+1;
		star_frame = parseInt(this.frame / 5 % this.e.length);

		oute.drawImage(this.e[star_frame],this.x,this.y,this.w,this.h);	//绘制星星到离屏
		this.y=this.y+this.speed;	//星星下降移动
		if(this.y>=SizeEnum.canvas_height+80){			//如果星星超出屏幕
			this.y=0;				//星星高度为0
			this.x=parseInt(Math.random()*(SizeEnum.canvas_width-20+1)+20);//再次随机x轴
		}
	};
};

var Bird=function(){
	"use strict";
	this.y=parseInt(SizeEnum.canvas_height*Math.random());				//鸟高度
	this.x=parseInt(Math.random()*(SizeEnum.canvas_width-500+1)+500);//鸟开始位置
	this.speed=parseInt(3*Math.random())+1;//鸟种类
	this.e=[$("#birda1")[0],$("#birda2")[0],$("#birda3")[0],$("#birda4")[0]];
	this.frame=0;
	this.frame_stop=false;
	this.name = "Bird";
	this.hit_open=true;
	this.w=50;
	this.h=50;
	
	this.hit=function(index){
		this.frame_stop=true;
		this.e[0]=$("#AA")[0];
		audiolist.star.load();
		audiolist.hit.play();
		this.hit_open=false;
	};

	this.step=function(){
		var frame=0;
		if(this.frame_stop===false){
			var bird_frame=0;
			this.frame=this.frame+1;
			bird_frame = parseInt(this.frame / 20 % this.e.length);

			oute.drawImage(this.e[bird_frame],this.x,this.y,this.w,this.h);//绘制鸟到离屏
			this.x=this.x-this.speed;	//移动
		
		}else{
			oute.drawImage(this.e[frame],this.x,this.y,this.w,this.h);//绘制鸟到离屏
			this.y=this.y+10;	//移动
			this.x=this.x-this.speed;	//移动
		}
		if(this.x<=-70||this.y>=800){		//如果超出屏幕
			this.e=[$("#birda1")[0],$("#birda2")[0],$("#birda3")[0],$("#birda4")[0]];
			this.hit_open=true;//再次开启碰撞
			this.frame_stop=false;
			this.x=SizeEnum.canvas_width;
			this.y=parseInt(SizeEnum.canvas_height*Math.random());
			this.speed=parseInt(4*Math.random())+1;
		}	
	};
};
var Airplane=function(){
	"use strict";
	this.x=50;		//飞机x轴
	this.y=384;	//飞机初始高度
	this.speed=5;		//飞机移动速度
	this.e=[$("#f1")[0],$("#f2")[0],$("#f3")[0],$("#f4")[0]];
	this.toleft=false;
	this.totop=false;
	this.toright=false;
	this.tobottom=false;
	this.frame=0;
	this.w=90;
	this.h=45;
	this.name = "Airplane";
	this.hit=function(){

	};
	this.step=function(){
		var airplane_frame=0;
		this.frame=this.frame+1;
		airplane_frame = parseInt(this.frame / 5 % this.e.length);

		if(this.toleft){
			this.x=this.x-this.speed;
		}
		if(this.toright){
			this.x=this.x+this.speed;
		}
		if(this.totop){
			this.y=this.y-this.speed;
		}
		if(this.tobottom){
			this.y=this.y+this.speed;
		}
		if(this.y>718){
			this.y=718;
		}
		if(this.y<0){
			this.y=0;
		}
		if(this.x<0){
			this.x=0;
		}
		if(this.x>954){
			this.x=954;
		}
		oute.drawImage(this.e[airplane_frame],this.x,this.y,this.w,this.h);
	};
};

var Interface=function(){
	"use strict";
	this.y=730;
	this.x=50;
	this.e1=$("#star")[0];
	this.e2=$("#gas")[0];
	this.step=function(){
		oute.drawImage(this.e1,20,70,38,38);
		oute.drawImage(this.e2,20,120,40,40);
		oute.font="30px Georgia";
		oute.fillText(user.starnum,70,100);
		oute.fillText(parseInt(user.gasnum/60),65,160);
		var s=parseInt(user.time/60);
		var text=""+parseInt(s/60/10)+parseInt(s/60%10)+":"+parseInt(s%60/10)+parseInt(s%60%10);
		oute.fillText(text,20,50);//time
	};
};
var Bullet=function(){
	"use strict";
	this.speed=7;
	this.y=airplane[0].y+airplane[0].h;
	this.x=airplane[0].x+airplane[0].w;
	this.e=$("#Bullet")[0];
	this.w=15;
	this.h=9;
	this.name = "Bullet";
	this.hit=function(index){
		bulletlist.splice(index,1);
	};
	this.step=function(index){
		oute.drawImage(this.e,this.x,this.y,this.w,this.h);//绘画子弹到离屏
		this.x=this.x+this.speed;
		if(this.x>=SizeEnum.canvas_width){
			bulletlist.splice(index,1);
			//console.log(bullet);
		}
	};
};
var Audio_list=function(){
	"use strict";
	this.background=$("#background_audio")[0];//获取背景音频
	this.finish=$("#finish_audio")[0];//获取完成音频
	this.hit=$("#hit_audio")[0];//获取打击音频
	this.star=$("#star_audio")[0];//获取星星音频
	this.background.loop=true;
	this.volume=function(size){
		this.background.volume=size;
		this.finish.volume=size;
		this.hit.volume=size;
		this.star.volume=size;
	};
	this.pause=function(){
		this.background.pause();
		this.finish.pause();
		this.hit.pause();
		this.star.pause();
	};
};
var User=function(){
	"use strict";
	this.starnum=0;//星星计数
	this.gasnum=10*60+59;//燃油计数
	this.time=0;
	this.game_state="begin"; //begin:开始前.play:游戏中.finish:完成游戏.stop:暂停
	this.Bullet_down=false;//每次只能射击一发子弹
};
window.onkeydown = function(event){
	"use strict";
	switch(event.keyCode){
        case 19:
			if(user.game_state!=="play"){
				user.game_state="play";
				audiolist.background.play();
				$("#begin").hide();
				$("#stop").show();
				$("#shuom").hide();
				$("#paih").hide();
				$("#begingame").hide();
			}else{
				user.game_state="stop";
				audiolist.pause();
				$("#begin").show();
				$("#stop").hide();
				$("#shuom").show();
				$("#paih").show();
				$("#begingame").show();
			}
         break;
         case 37:
			airplane[0].toleft=true;
         break;
         case 38:
			airplane[0].totop=true;
         break;
         case 39:
			airplane[0].toright=true;
         break;
         case 40:
			airplane[0].tobottom=true;
         break;
		 case 32:
			if(user.Bullet_down===false){
				var bullet=new Bullet();
				bulletlist.push(bullet);
				user.Bullet_down=true;
			}
         break;
	}
	window.onkeyup = function(event){
		switch(event.keyCode){
			case 37:
				airplane[0].toleft=false;
			break;
			case 38:
				airplane[0].totop=false;
         	break;
			case 39:
				airplane[0].toright=false;
			break;
			case 40:
				airplane[0].tobottom=false;
         	break;
			case 32:	
				user.Bullet_down=false;
			break;
		}
	};
};