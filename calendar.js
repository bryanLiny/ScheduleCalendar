/*
	移动端行程安排日期控件
	created by bryanlin
	QQ : 893539125
	date 2016-12-07
	version v1.0
	支持Android 5.0+ ios8+
	来自网络：Android 4.0 和 4.4 版本存在bug问题
	实测：Android4.3 touchend不通过
	解决：可参考 https://github.com/rainyjune/mobiletouch
	使用swipeStart,swipeProgress和swipe来替代touchstart,touchmove和touchend(未实践)
*/
(function($, document) {

	var $_doc = $(document);

	var _startX, // touchX坐标
		_startY, // touchY坐标
		_hasMoved = false, //是否滑动
		_moveY1, //touchstart时Y坐标
		_moveY2, //滑动时动态Y坐标
		_scrollT; //滚动条滚动距top位移

	var ScheduleCalendar = function(ele, opt) {
		this.$element = ele;
		// options 为预留传入参数
		this.defaults = {

		};
		this.options = $.extend({}, this.defaults, opt);
	}

	ScheduleCalendar.prototype = {

		initHtmlDom: function() {
			var htmlDom = '<div class="clearfix text-center lyc-header">' +
				'<a href="#" data-value="-7" class="btn-pre-next pull-left">后退</a>' +
				'<label class="year-month">' +
				'<span id="year_month"></span>' +
				'</label>' +
				'<a href="#" data-value="7" class="btn-pre-next pull-right">前进</a>' +
				'</div>' +
				'<table id="calendar_table" class="lyc-body text-center">' +
				'<thead id="thead"></thead>' +
				'<tbody id="tbody" class="body"></tbody>' +
				'</table>' +
				'<div id="eventlist" class="eventlist"></div>'

			return htmlDom;
		},

		initScheduleCanlendar: function(dateTime) {

			// 渲染界面
			var htmlDom = this.initHtmlDom();
			this.$element.html(htmlDom);

			var currentDate = this.getCurrentDate(dateTime);
			var year = currentDate.getFullYear();
			var month = currentDate.getMonth() + 1;
			var date = currentDate.getDate();


			var dateStr = "",
				tableHeadDays = "";

			var dataObj = this.getYearAndTotalNumOfCurrentMonth(year, month);

			var lastYear = dataObj.lastYear,
				lastMonth = dataObj.lastMonth,
				nextYear = dataObj.nextYear,
				nextMonth = dataObj.nextMonth,
				// 本月总天数
				totalNum = dataObj.totalNum,
				// 上个月总天数
				lastMonthTotalNum = dataObj.lastMonthTotalNum,
				// 下个月总天数
				nextMonthTotalNum = dataObj.nextMonthTotalNum;

			// 左边
			var dateTime = [];
			if (date - 3 > 0) { //本月
				dateTime = [{
					'year': year,
					'month': month,
					'date': date - 3,
					'diffFlag': false
				}, {
					'year': year,
					'month': month,
					'date': date - 2,
					'diffFlag': false
				}, {
					'year': year,
					'month': month,
					'date': date - 1,
					'diffFlag': false
				}];
				dateStr += this.getTdsStr(dateTime);

			} else if (date - 2 > 0) { //本月二号
				dateTime = [{
					'year': lastYear,
					'month': lastMonth,
					'date': lastMonthTotalNum,
					'diffFlag': true
				}, {
					'year': year,
					'month': month,
					'date': date - 2,
					'diffFlag': false
				}, {
					'year': year,
					'month': month,
					'date': date - 1,
					'diffFlag': false
				}];
				dateStr += this.getTdsStr(dateTime);

			} else if (date - 1 > 0) { // 本月一号
				dateTime = [{
					'year': lastYear,
					'month': lastMonth,
					'date': lastMonthTotalNum - 1,
					'diffFlag': true
				}, {
					'year': lastYear,
					'month': lastMonth,
					'date': lastMonthTotalNum,
					'diffFlag': true
				}, {
					'year': year,
					'month': month,
					'date': date - 1,
					'diffFlag': false
				}];
				dateStr += this.getTdsStr(dateTime);
			} else {
				dateTime = [{
					'year': lastYear,
					'month': lastMonth,
					'date': lastMonthTotalNum - 2,
					'diffFlag': true
				}, {
					'year': lastYear,
					'month': lastMonth,
					'date': lastMonthTotalNum - 1,
					'diffFlag': true
				}, {
					'year': lastYear,
					'month': lastMonth,
					'date': lastMonthTotalNum,
					'diffFlag': true
				}];
				dateStr += this.getTdsStr(dateTime);
			}

			tableHeadDays += this.setTableHeadDays(dateTime);

			// 右边
			if (date + 3 <= totalNum) { // 本月
				dateTime = [{
					'year': year,
					'month': month,
					'date': date,
					'diffFlag': false
				}, {
					'year': year,
					'month': month,
					'date': date + 1,
					'diffFlag': false
				}, {
					'year': year,
					'month': month,
					'date': date + 2,
					'diffFlag': false
				}, {
					'year': year,
					'month': month,
					'date': date + 3,
					'diffFlag': false
				}];
				dateStr += this.getTdsStr(dateTime);

			} else if (date + 2 <= totalNum) { // 本月倒数第二天
				dateTime = [{
					'year': year,
					'month': month,
					'date': date,
					'diffFlag': false
				}, {
					'year': year,
					'month': month,
					'date': date + 1,
					'diffFlag': false
				}, {
					'year': year,
					'month': month,
					'date': date + 2,
					'diffFlag': false
				}, {
					'year': nextYear,
					'month': nextMonth,
					'date': 1,
					'diffFlag': true
				}];
				dateStr += this.getTdsStr(dateTime);

			} else if (date + 1 <= totalNum) { // 本月最后一天
				dateTime = [{
					'year': year,
					'month': month,
					'date': date,
					'diffFlag': false
				}, {
					'year': year,
					'month': month,
					'date': date + 1,
					'diffFlag': false
				}, {
					'year': nextYear,
					'month': nextMonth,
					'date': 1,
					'diffFlag': true
				}, {
					'year': nextYear,
					'month': nextMonth,
					'date': 2,
					'diffFlag': true
				}];
				dateStr += this.getTdsStr(dateTime);
			} else {
				dateTime = [{
					'year': year,
					'month': month,
					'date': date,
					'diffFlag': false
				}, {
					'year': nextYear,
					'month': nextMonth,
					'date': 1,
					'diffFlag': true
				}, {
					'year': nextYear,
					'month': nextMonth,
					'date': 2,
					'diffFlag': true
				}, {
					'year': nextYear,
					'month': nextMonth,
					'date': 3,
					'diffFlag': true
				}];
				dateStr += this.getTdsStr(dateTime);
			}

			tableHeadDays += this.setTableHeadDays(dateTime);

			// 界面初始化数据
			$("#year_month").text(year + "年" + month + "月");

			var $body = $(".lyc-body #tbody"),
				$head = $(".lyc-body #thead");

			$body.html(dateStr);
			$head.html(tableHeadDays);

			this.getInitCurrentDateEventList();


		},

		// 获取当前时间
		getCurrentDate: function(dateTime) {
			/**
			 * 获取当前时间
			 */
			var currentDate;

			if (dateTime.length && dateTime != "") {
				// 处理ios时间格式中'-'无法识别的问题
				dateTime = dateTime.replace(new RegExp("-", "gm"), "/");
				currentDate = new Date(dateTime);
			} else {
				currentDate = new Date();
			}
			return currentDate;
		},

		// 获取星期
		getDayStr: function(dateStr) {
			// alert(dateStr);
			var currentDate = new Date(dateStr);
			var day = currentDate.getDay();
			// alert(day);
			var daystr = "";
			switch (day) {
				case 1:
					daystr = "<th>星期一</th>";
					break;
				case 2:
					daystr = "<th>星期二</th>";
					break;
				case 3:
					daystr = "<th>星期三</th>";
					break;
				case 4:
					daystr = "<th>星期四</th>";
					break;
				case 5:
					daystr = "<th>星期五</th>";
					break;
				case 6:
					daystr = "<th>星期六</th>";
					break;
				case 0:
					daystr = "<th>星期天</th>";
					break;
			}
			return daystr;
		},

		// 获取星期字符串
		setTableHeadDays: function(dateTime) {
			var daystr = "";
			for (var i = 0; i < dateTime.length; i++) {
				var dateTimeSingle = dateTime[i],
					yyyymmdd = dateTimeSingle.year + "/" + dateTimeSingle.month + "/" + dateTimeSingle.date;
				daystr += this.getDayStr(yyyymmdd);
			}
			return daystr;
		},

		// 为载入界面完成后初始化当天行程数据或者第一天数据
		getInitCurrentDateEventList: function() {
			var $active = $(".lyc-body>.body td.active").eq(0),
				$span = $(".lyc-body>.body td").eq(0),
				eventDate;
			if ($active.length) {
				eventDate = $active.data('date');
			} else {
				$span.addClass('active').siblings('span').removeClass('active');
				eventDate = $span.data('date');
			}
			this.getEventList(eventDate);
		},

		// 获取当前月总天数、去年（上个月）、明年（下个月）数据
		getYearAndTotalNumOfCurrentMonth: function(year, month) {
			var lastYear, lastMonth, nextYear, nextMonth;
			if (month - 1 == 0) { // 去年12月
				lastMonth = 12;
				lastYear = year - 1;
			} else {
				lastMonth = month - 1;
				lastYear = year;
			}
			if (month + 1 > 12) { // 明年一月
				nextMonth = 1;
				nextYear = year + 1;
			} else {
				nextMonth = month + 1;
				nextYear = year;
			}
			// 本月总天数
			var totalNum = this.TotalNumOfmonth(month - 1, year);
			// 上个月总天数
			var lastMonthTotalNum = this.TotalNumOfmonth(lastMonth - 1, lastYear);
			// 下个月总天数
			var nextMonthTotalNum = this.TotalNumOfmonth(nextMonth - 1, nextYear);

			var data = {
				'lastYear': lastYear,
				'lastMonth': lastMonth,
				'nextYear': nextYear,
				'nextMonth': nextMonth,
				'totalNum': totalNum,
				'lastMonthTotalNum': lastMonthTotalNum,
				'nextMonthTotalNum': nextMonthTotalNum
			}
			return data;
		},

		// 获取日期td,填充表格
		getTdsStr: function(dateTime) {
			var tdstr = "";
			var currentDate = this.getCurrentDate("");
			var curDateTime = currentDate.getFullYear() + "/" + (currentDate.getMonth() + 1) + "/" + currentDate.getDate();
			$.each(dateTime, function(index, el) {
				var elDateTime = el.year + "/" + el.month + "/" + el.date;
				if (el.diffFlag) { // 非本月
					tdstr += "<td style='cursor:pointer;' data-date='" + el.year + "-" + el.month + "-" + el.date + "' class='diff-month animated zoomIn'>" + el.date + "</td>";
				} else if (curDateTime === elDateTime) { // 当前时间
					tdstr += "<td style='cursor:pointer;' data-date='" + el.year + "-" + el.month + "-" + el.date + "' class='active animated zoomIn'>" + el.date + "</td>";
				} else {
					tdstr += "<td style='cursor:pointer;' data-date='" + el.year + "-" + el.month + "-" + el.date + "' class='animated zoomIn'>" + el.date + "</td>";
				}
			});
			return tdstr;
		},

		// 获取每个月总天数
		TotalNumOfmonth: function(month, year) {
			MonHead = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			if (this.isLeapYear(year)) { //闰年2月为29天
				MonHead[1] = 29;
			};
			return MonHead[month];
		},

		/*
			判断是否是闰年
		*/
		isLeapYear: function(year) {
			return (year % 4 == 0) && (year % 100 != 0 || year % 400 == 0);
		},

		// 获取事件集合
		getEventList: function(date) {
			var events = this.returnEventData(date);
			var listp = "";
			if (undefined != events && events.length) {
				for (var i = 0; i < events.length; i++) {
					listp += "<p class='animated fadeInRight'>" + events[i].info + "</p>"
				}
				$("#eventlist").html(listp);
				listp = "";
			} else {
				$("#eventlist").html("<p class='animated shake text-center'>暂无行程安排！</p>");
			}
		},

		// 手工造数据 -- 后期修改为从服务器请求
		returnEventData: function(date) {
			var eventList = [];
			eventList['2016-12-3'] = [{
				'info': '小龙和手动阀14:30选片'
			}, {
				'info': '奥尔问你个'
			}, {
				'info': '爱上你佛刹的粉红色佛'
			}];
			eventList['2016-12-5'] = [{
				'info': '张和生和李潇潇14:30高崎机场T4候机楼 接机'
			}, {
				'info': '狗蛋和二妞9:30拍摄'
			}, {
				'info': '爱上你佛刹的粉红色佛'
			}];
			eventList['2016-12-6'] = [{
				'info': '韩梅梅和李雷修片完成'
			}, {
				'info': '问题成功各位哥SFF'
			}, {
				'info': '爱上你佛刹的粉红色佛'
			}];
			eventList['2016-12-10'] = [{
				'info': '张和生和李潇潇14:30高崎机场T4候机楼 接机'
			}, {
				'info': '狗蛋和二妞9:30拍摄'
			}, {
				'info': '爱上你佛刹的粉红色佛'
			}];
			eventList['2016-12-15'] = [{
				'info': '韩梅梅和李雷修片完成'
			}, {
				'info': '问题成功各位哥SFF'
			}, {
				'info': '爱上你佛刹的粉红色佛'
			}];

			return eventList[date];
		},

		// 前进或后退、以及touch的事件处理
		reInitCalendar: function(value) {
			var $span = $(".lyc-body>.body td").eq(3),
				date = $span.data('date');
			var thisDate = this.getCurrentDate(date),
				y = thisDate.getFullYear(),
				m = thisDate.getMonth() + 1,
				d = thisDate.getDate();
			var dataObj = this.getYearAndTotalNumOfCurrentMonth(y, m);
			var MaxTotalNumOfMonth = dataObj.totalNum,
				lastMonthTotalNum = dataObj.lastMonthTotalNum;

			if (d + value <= 0) { //前五天
				d = lastMonthTotalNum + d + value;
				if (m - 1 == 0) {
					m = 12;
					y = y - 1;
				} else {
					m = m - 1;
				}
			} else if (d + value > MaxTotalNumOfMonth) {
				d = d + value - MaxTotalNumOfMonth;
				if (m + 1 > 12) { //后五天
					m = 1;
					y = y + 1;
				} else {
					m = m + 1;
				}
			} else {
				d = d + value;
			}

			var dateStr = y + "-" + m + "-" + d;

			this.initScheduleCanlendar(dateStr);
		},

		//移动端touchstart事件  
		touchSatrtFunc: function(evt) {
			try {
				// evt.preventDefault(); //阻止触摸时浏览器的缩放、滚动条滚动等  
				var touch = evt.touches[0]; //获取第一个触点  
				var x = Number(touch.pageX); //页面触点X坐标  
				var y = Number(touch.pageY); //页面触点Y坐标  
				//记录触点初始位置  
				_startX = x;
				_startY = y;
				// _moveY1 = evt.targetTouches[0].pageY;
			} catch (e) {
				alert('touchSatrtFunc：' + e.message);
			}
		},

		//移动端touchmove事件，这个事件无法获取坐标  
		touchMoveFunc: function(evt) {
			try {
				// evt.preventDefault(); //阻止触摸时浏览器的缩放、滚动条滚动等  
				// _hasMoved = true;
				// _moveY2 = evt.targetTouches[0].pageY;
				// _scrollT += _moveY1 - _moveY2;
				// $(document).scrollTop(_scrollT);
			} catch (e) {
				alert('touchMoveFunc：' + e.message);
			}
		},

		//移动端touchend事件  
		touchEndFunc: function(evt, fncall) {
			try {
				var touch = evt.changedTouches[0]; //获取最后一次手指离开屏幕是的坐标  
				var x = Number(touch.pageX); //页面触点X坐标  
				var y = Number(touch.pageY); //页面触点Y坐标  
				//判断滑动方向 
				var dvalue = Math.abs(x - _startX);
				if (dvalue != 0 && dvalue > 100) {
					if (x - _startX > 0) { // 右滑
						fncall.apply(this, [-7]);
					} else { // 左滑
						fncall.apply(this, [7]);
					}
				}
				// _hasMoved = false;
			} catch (e) {
				alert('touchEndFunc：' + e.message);
			}
		}
	};

	$.fn.ScheCalendarPlugin = function(options) {

		var scheCalendar = new ScheduleCalendar(this, options);

		// 日期点击事件
		$_doc.on('touchend', '.lyc-body>.body td', function(event) {
			event.preventDefault();
			var $this = $(this);
			var date = $this.data('date');
			var value = $this.text();
			scheCalendar.getEventList(date);
			$this.addClass('active').siblings('td').removeClass('active');
		});

		// 上下周
		$_doc.on('touchend', '.lyc-header .btn-pre-next', function(event) {
			event.preventDefault();
			var $this = $(this),
				value = +$this.data('value');

			scheCalendar.reInitCalendar(value);
		});

		// 为document绑定touch事件
		// var calendarTable = document.getElementById("calendar_table");
		document.addEventListener('touchstart', scheCalendar.touchSatrtFunc, false);
		// document.addEventListener('touchmove', scheCalendar.touchMoveFunc, false);
		document.addEventListener('touchend', function(evt) {
			scheCalendar.touchEndFunc(evt, scheCalendar.reInitCalendar);
		}, false);

		return scheCalendar.initScheduleCanlendar("");
	}

})(jQuery, document);