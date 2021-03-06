var dflag = false;
var posX, posY;
with (document) {
    onmousedown = function() {
          dflag = true;
          posX = event.clientX;
          posY = event.clientY;
    }
    onmouseup = function() {
          if (dflag) {
              Cookie.set("width", top.window.event.screenX - posX, 10);
              Cookie.set("height", top.window.event.screenY - posY, 10);
          }
          dflag = false;
    }
    onmousemove = function() {
          if (dflag) {
               top.window.moveTo(top.window.event.screenX -
                               posX, top.window.event.screenY - posY);
          }
    }
}

var Tkr = {
    // config
    refresh: 5 * 60 * 1000, // 5 min
    array: [],
    // init
    initialize:function() {
	var width  = Cookie.get("width");
	var height = Cookie.get("height");
        var size_width  = 600;
        var size_height = 25;
        $(document).ready(function(){
            window.focus();
            window.resizeTo(size_width, size_height);
            window.moveTo(width, height);
        });

        // display foreground
        var ExcelApp = new ActiveXObject("Excel.Application");
        var hWnd = ExcelApp.ExecuteExcel4Macro("CALL(\"user32\",\"FindWindowA\",\"JCC\",\"HTML Application Host Window Class\",\"" + document.title + "\")");
        var lRtn = ExcelApp.ExecuteExcel4Macro("CALL(\"user32\",\"SetWindowPos\",\"JJJJJJJJ\"," + hWnd + ",-1,0,0,0,0,3)")

        Tkr.main();
    },
    // main
    main:function() {
        Tkr.array = [];
        Tkr.getStock();
        Tkr.getRss();
        var second = 0;
        setInterval(function() {
            if (!(second < Tkr.array.length)) {
                Tkr.main();
                Tkr.array = []; // TBD
                return;
            }
            document.getElementById("main").innerHTML = Tkr.array[second];
            second += 1;
        }, 5000);
    },
    // sleep
    sleep:function(milli_sec) {
        return function(resolve) {
            setTimeout(function() {
		resolve()
            }, milli_sec)
        }
    },
    // get stock
    getStock:function() {
        var num = 0;
        var code = "998407.o";
        var url  = "http://stocks.finance.yahoo.co.jp/stocks/detail/?code=" + code;
        $.get(url, function(res) {
	    $(res).find('.stoksPrice').each(function(){
                if (num > 0) {
	            Tkr.array.push($(this).text() + "("
	              + $(res).find('.icoUpGreen,.yjMSt').text() + " from the day before)");
	        } else {
                    num += 1;
	        }
	    });
        });
        Tkr.sleep(Tkr.refresh);
    },
    // get rss
    getRss:function() {
        var url  = "http://rss.asahi.com/rss/asahi/newsheadlines.rdf";
        $.get(url, function(res) {
            $(res).find("item").each(function () {
                var el = $(this);
                Tkr.array.push(el.find("title").text());
            });
        });
    }
};

/**
 * cookie utility
 */
var Cookie = {
    set:function(name, value, days){
        var c = [];
        c.push(name + "=" + value);
        if (days) {
            c.push("expires=" + new Date(new Date().getTime() + (days * 24 * 3600 * 1000)));
        }
        c.push("path=/");
        document.cookie = c.join(";");
    },
    get:function(name) {
        var pairs = document.cookie.split(';');
        for (var i = 0; i < pairs.length; i ++) {
            var kv = pairs[i].match(/(\S+)\=(\S+)/);
            if (kv && kv.length == 3 && kv[1] == name) {
                return kv[2];
            }
        }
        return null;
    }
};

Tkr.initialize();
