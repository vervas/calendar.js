	var clientId='202314697610'; // Enter your google clientId
	var apiKey='AIzaSyCQzUbdr2fSPY91vdWVPr0Tc0FE-IxuiZ8'; // Enter your API key
	var scope= 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile';

	var fc = $.fullCalendar;
	var formatDate = fc.formatDate;
	var parseISO8601 = fc.parseISO8601;
	var addDays = fc.addDays;
	var applyAll = fc.applyAll;

	var colors=["#235275","#F86127","#97E100","#EEE100","#00bff3","#8B8B00",]
	var caret='<b class="caret"></b>'

        function reloadData(){
        	localStorage.clear()
        	$('#calendar').html('')
        	$("#callist").html('')
        	loadCalendar()
        	handleClientLoad()
        }

        function onLoad(){
			$('.dropdown-toggle').dropdown()
    	    loadCalendar()
    	    handleClientLoad()
        }

      function handleClientLoad() {
        gapi.client.setApiKey(apiKey);
        window.setTimeout(checkAuth,1);
      }

      function checkAuth() {
        gapi.auth.authorize({client_id: clientId, scope: scope, immediate: true}, handleAuthResult);
      }


      function handleAuthResult(authResult) {
      	console.log(authResult)
        if (authResult) {
          $("#authorize").attr("class","hidden");
          $("#selectcal").css("visibility","");
          if(localStorage.getItem('calendarItems')===null){
          	makeApiCall();
          }
          else
          {
			$("#greeting").html("Hello, "+JSON.parse(localStorage.getItem('me')).given_name+caret);
        	loadCalendarList(JSON.parse(localStorage.getItem('calendarItems')))
        	}
        } else {
          $("#authorize").attr("class","");
          $("#selectcal").css("visibility","hidden");
          $("#authorize").click(handleAuthClick);
        }
      }

      function handleAuthClick(event) {
        gapi.auth.authorize({client_id: clientId, scope: scope, immediate: false}, handleAuthResult);
        return false;
      }

	  function makeApiCall(){
		gapi.client.load('calendar', 'v3', function() {
          var request = gapi.client.calendar.calendarList.list();
          request.execute(function(resp) {
          	loadCalendarList(resp.result.items)
            localStorage.setItem('calendarItems',JSON.stringify(resp.result.items))
          });
        });
		gapi.client.load('oauth2', 'v2', function() {
          	var request = gapi.client.oauth2.userinfo.v2.me.get();
          	request.execute(function(resp){
          		$("#greeting").html("Hello, "+resp.result.given_name+caret);
            	localStorage.setItem('me',JSON.stringify(resp.result))
          	})
    	})
	  }

	  function loadCalendarList(items){
	  	var list = $("#callist");
            $.each(items,function(i,item){
            	var li=$("<li>")
            		$("<a>").text(item.summary).attr('onclick','getEvents("'+item.id+'",'+i+')').attr('href','#'+item.summary).appendTo(li);
            		list.append(li);
            });
	  }

	  function getEvents(val,n){
	  	var calendars=localStorage.getItem('cal');
	  	var cal={};
	  	if(calendars!==null)  cal=JSON.parse(calendars);
	  	if(calendars===null||cal[n]==undefined){
	  		gapi.client.setApiKey(apiKey);
	  		gapi.client.load('calendar', 'v3', function() {
          		var request = gapi.client.calendar.events.list({ 'calendarId': val});
          		request.execute(function(resp) {
            		loadGCal(resp.result,n);
            		cal[n]=resp.result;
		            localStorage.setItem('cal',JSON.stringify(cal))
            	});
        	});
        }
        else{
        	loadGCal(cal[n],n);
        }
	  }

	  function loadGCal(feed,n){
	  	var cl=colors[n%6]
	  	var calobj=[]
	  	$.each(feed.items,function(i,item){
	  	if(item.start!=undefined){
	  	var str=item.start.dateTime;
	  	var end=item.end.dateTime;
	  	if(str==null && item.start.date!=null){
	  		str=item.start.date
	  		end=item.end.date
	  	}
	  	var allDay = str.indexOf('T') == -1;
		 str = parseISO8601(str);
		 end = parseISO8601(end);
		if (allDay) {
			addDays(end, -1); // make inclusive
		}
		calobj.push({"id":item.id,"title":item.summary,"start":str,"end":end,"url":item.htmlLink,allDay:allDay,color:cl});
	  	}});
	  	$('#calendar').fullCalendar('addEventSource',calobj);

	  }

	  function addEvent(feed){
	  	$('#calendar').fullCalendar('addEventSource',{url:feed,color:colors[7]});
	  }

	  function removeEvents(){
	  	$('#calendar').fullCalendar('removeEvents');
	  }

	  function loadCalendar(feed){
	  	$('#calendar').fullCalendar({
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay',
			},
			firstDay: 1,

	  		editable: true,

			events: feed,
			timeFormat: 'HH:mm'
		});
	  }
