$( function() {
    var rooms=get("locations", false, function(data) {
        console.log(data);
        var html="";
        var page="";
        var dialog="";
        $.each(data, function (key1, room) {
            //console.log(room.title);
            if(room.title!="globalRoom" || (room.title==="globalRoom" && includeGlobalRoom===true)) {
                html='<a href="#room_'+key1+'" data-transition="slide"><div class="room" data-name="'+room.title+'"><image src="'+(room.user_img ? '../../ZAutomation/api/v1/load/image/'+room.user_img :(room.default_img ? '../storage/img/rooms/'+room.default_img : '../storage/img/placeholder-img.png'))+'"><div>'+room.title+'</div></div></a>';
                $( "#rooms" ).append( html );
                page='<div data-role="page" class="jqm-demos jqm-home page roompage" id="room_'+key1+'"><div data-role="header" class="jqm-header" style="background-color: lavender;"><a href="#" data-rel="back">Alle Räume</a><h1>'+room.title+'</h1></div><div role="main" class="ui-content jqm-content content_'+key1+'"></div></div>';
                $("body").append(page);
                $.each(room.namespaces, function (key2, namespace) {
                    if(namespace.id == "devices_all") {
                        //console.log(namespace);
                        $.each(namespace.params, function (key3, param) {
                            //console.log(param);
                            device=get("devices/"+param.deviceId, false, function(data) {
                                if(valueInObject(data.tags, "RPI.Include")) {
                                    var info = getDeviceInformation(data);
                                    console.log(info);
                                    $("#room_"+key1+" .content_"+key1).append('<div id="'+data.id+'" class="device '+data.deviceType+' '+data.id+'" style="background-color: '+info[0]+';">'+info[1]+'</div>');
                                    var icon = getIcon(data);
                                    switch(data.deviceType) {
                                        case "switchBinary":
                                            dialog=`
                                                <div data-role="popup" id="dialog-`+data.id+`" data-overlay-theme="a" data-theme="a" class="dialog">
                                                    <div data-role="header" data-theme="a"><h1>`+data.metrics.title+`</h1></div>
                                                    <div role="main" class="ui-content" style="height: 186px;">
                                                        <img src="`+icon[1]+`" id="dialog-image-`+data.id+`" width="50" style="float: left;">
                                                        <input type="checkbox" name="checkbox-`+data.id+`" id="checkbox-`+data.id+`" data-role="none">
                                                    </div>
                                                    <button class="ui-btn ui-mini" id="home-`+data.id+`" style="margin: 0px;" onclick="widget('`+data.id+`');" data-value="0">Zum Homescreen hinzufügen</button>
                                                </div>`;
                                            $("#room_"+key1+" .content_"+key1).append(dialog);
                                            $("#checkbox-"+data.id).slideButton({
                                                state: data.metrics.level,
                                                on: function() {
                                                    set(data.id, "on", function(){});
                                                },
                                                off: function() {
                                                    set(data.id, "off", function(){});
                                                }
                                            });
                                        break;
                                        case "sensorMultilevel":
                                            var date=new Date(data.updateTime * 1000);
                                            //dialog='<div data-role="popup" id="dialog-'+data.id+'" data-overlay-theme="a" data-theme="a" class="dialog"><div data-role="header" data-theme="a"><h1>'+data.metrics.title+'</h1></div><div role="main" class="ui-content"><img src="'+icon[1]+'" id="dialog-image-'+data.id+'" width="50" style="float: left;"><div id="dialog-sensorMultilevel-metrics" style="float: right;"><div id="dialog-'+data.id+'-level" style="font-size: 50px;font-weight: bold;">'+data.metrics.level+" "+data.metrics.scaleTitle+'</div><div id="dialog-'+data.id+'-update" style="font-size: 24px;">'+pad(date.getHours(),2)+":"+pad(date.getMinutes(),2)+' Uhr</div></div><div data-role="footer" data-theme="a"><input type="checkbox" data-role="flipswitch" name="flip-checkbox-1" id="flip-checkbox-1" data-mini="true"></div>';
                                            dialog = `
                                                    <div data-role="popup" id="dialog-`+data.id+`" data-overlay-theme="a" data-theme="a" class="dialog">
                                                        <div data-role="header" data-theme="a"><h1>`+data.metrics.title+`</h1></div>
                                                        <div role="main" class="ui-content" style="height: 186px;">
                                                            <img src="`+icon[1]+`" id="dialog-image-`+data.id+`" width="50" style="float: left;">
                                                            <div id="dialog-sensorMultilevel-metrics" style="float: right;">
                                                                <div id="dialog-`+data.id+`-level" style="font-size: 50px;font-weight: bold;">`+data.metrics.level+" "+data.metrics.scaleTitle+`</div>
                                                                <div id="dialog-`+data.id+`-update" style="font-size: 24px;">`+pad(date.getHours(),2)+":"+pad(date.getMinutes(),2)+` Uhr</div>
                                                            </div>
                                                        </div>
                                                        <button class="ui-btn ui-mini" id="home-`+data.id+`" style="margin: 0px;" onclick="widget('`+data.id+`');" data-value="0">Zum Homescreen hinzufügen</button>
                                                    </div>`;
                                            
                                            
                                            $("#room_"+key1+" .content_"+key1).append(dialog);
                                        break;
                                        case "switchMultilevel":
                                            dialog=`
                                                <div data-role="popup" id="dialog-`+data.id+`" data-overlay-theme="a" data-theme="a" class="dialog">
                                                    <div data-role="header" data-theme="a"><h1>`+data.metrics.title+`</h1></div>
                                                    <div role="main" class="ui-content" style="height: 186px;">
                                                        <img src="`+icon[1]+`" id="dialog-image-`+data.id+`" width="50" style="float: left;">
                                                        <div id="dialog-`+data.id+`-slider" class="slider" style="height:200px;float:left;margin-left: 60px;"></div>
                                                        <div id="dialog-`+data.id+`-level" style="font-size: 20px;font-weight: bold;float: right;width: 100%;text-align: center;">`+getLevel(data)+`</div>
                                                    </div>
                                                    <button class="ui-btn ui-mini" id="home-`+data.id+`" style="margin: 0px;" onclick="widget('`+data.id+`');" data-value="0">Zum Homescreen hinzufügen</button>
                                                </div>`;
                                            $("#room_"+key1+" .content_"+key1).append(dialog);
                                            $( "#dialog-"+data.id+"-slider" ).slider({
                                                orientation: "vertical",
                                                range: "min",
                                                min: parseInt((valueInObject(data.tags, "RPI.Min") ? valueInObject(data.tags, "RPI.Min") : 0)),
                                                max: parseInt((valueInObject(data.tags, "RPI.Max") ? valueInObject(data.tags, "RPI.Max") : 99)),
                                                value: data.metrics.level,
                                                slide: function( event, ui ) {
                                                    var newdata = {
                                                        deviceType: "switchMultilevel",
                                                        metrics: {
                                                            level: ui.value
                                                        }
                                                    };
                                                    $( "#dialog-"+data.id+"-level" ).html(getLevel(newdata));
                                                },
                                                stop: function(event, ui) {
                                                    set(data.id, "exact?level="+ui.value, function(){});
                                                }
                                            });
                                            
                                        break;
                                        case "camera":
                                            dialog='<div id="dialog-'+data.id+'" class="dialog" title="'+data.metrics.title+'"><img src="'+data.metrics.url+'" id="dialog-image-'+data.id+'" style="width: 320px, height: 240px"></div>';
                                            $("#room_"+key1+" .content_"+key1).append(dialog);
                                        break;
                                    }
                                    
                                }
                            });
                        });
                        return false;
                    }
                });
            }
        });

        $(".switchMultilevel-slider").slider();
        $(".ui-slider-handle").css("display", "none");
        
    });
    
    startUpdate();
    
    $(".device").each(function(i, obj){
        jQuery( "#"+obj.id ).on( 'touchstart', function( e ) {
            startLongPress = setTimeout(function() {
                //console.log('long press!');
                didLongPress = true;
                longTouch(obj.id);
                window.clearTimeout(startLongPress);
            }, longpress);
        });

        jQuery( "#"+obj.id ).on( 'touchmove', function( e ) {
            window.clearTimeout(startLongPress);
        });
        
        jQuery( "#"+obj.id ).on( 'touchend', function( e ) {
            window.clearTimeout(startLongPress);
            if(didLongPress==false) {
                //console.log('short press!');
                shortTouch(obj.id);
            }
            didLongPress=false;
        });
        
    });
    
    if(window.localStorage.getItem("widgets")) {
        widgets = window.localStorage.getItem("widgets").split(",");
        $.each( widgets, function( key, value ) {
            //$("#home-"+value).prop("checked", true);
            //$("#home-"+value).attr("data-value", "1");
            widget(value);
        });
    }
});


function widget(id) {
    console.log(id);
    widgets=[];
    if($("#home-"+id).attr("data-value")=="0") {
        $("#"+id).clone().appendTo("#widgets");
        $("#home-"+id).attr("data-value", "1");
        $("#home-"+id).html("Vom Homescreen entfernen");
    }
    else {
        $("#widgets").find("."+id).remove();
        $("#home-"+id).attr("data-value", "0");
        $("#home-"+id).html("Zum Homescreen hinzufügen");
    }
    $("#widgets").find(".device").each(function(i, obj){
       widgets[i]=this.id;
    });
    
    window.localStorage.setItem("widgets", widgets);
}

function startUpdate() {
    interval=setInterval(function(){
        updateDevices();
    }, updateInterval);
}

function updateDevices() {
    var update=get("devices?since="+parseInt(((Date.now()-updateInterval)/1000)).toString(), true, function(data) {
            $.each(data.devices, function (key, device) {
                html=getDeviceInformation(device);
                $("."+device.id).html(html[1]);
                $("#dialog-image-"+device.id).attr("src", getIcon(device)[1]);
                var date=new Date(device.updateTime * 1000);
                $("#dialog-"+device.id+"-update").html(pad(date.getHours(),2)+":"+pad(date.getMinutes(),2)+" Uhr");
                switch(device.deviceType) {
                    case "switchBinary":
                        $("#checkbox-"+device.id).slideButton("switch_"+device.metrics.level);
                    break;
                    case "sensorMultilevel":
                        $("#dialog-"+device.id+"-level").html(getLevel(device));
                    break;
                    case "switchMultilevel":
                        $( "#dialog-"+device.id+"-slider" ).slider({
                            value: device.metrics.level
                        });
                        $( "#dialog-"+device.id+"-level" ).html(getLevel(device));
                    break;
                }
            });
        });
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function shortTouch(id) {
    var device = get("devices/"+id, true, function(data) {
        //console.log(data);
        switch(data.deviceType) {
            case "switchMultilevel":
                if(data.metrics.level>0) {
                    set(id, "exact?level=0", function(data){
                    });
                }
                else {
                    set(id, "exact?level=99", function(data){
                    });
                }
            break;
            case "sensorMultilevel":
            case "camera":
                longTouch(id);
                /*
                var html='<img src="'+data.metrics.url+'" id="" style="width: 320px, height: 240px">';
                var myFrame = $("#dialog-image-"+data.id).contents().find('body');
                myFrame.html(html);
                */
            break;
            case "switchBinary":
                if(data.metrics.level=="off" || data.metrics.level=="0") {
                    set(id, "on", function(data){
                    });
                }
                else {
                    set(id, "off", function(data){
                    });
                }
            break;
        }
    });
}

function longTouch(id) {
    console.log(id);
    $( "#dialog-"+id ).popup( "open");
/*    
    $( "#dialog-"+id).dialog({
        modal: true,
   });
   $(".ui-dialog-titlebar-close").css("display", "none");
   $(".ui-widget-overlay").click(function(){
       $( "#dialog-"+id).dialog("close");
   });
   */
}



function getDeviceInformation(data) {
    var icon = getIcon(data);
    var state = icon[0]=="#888" ? "off" : "on";
    var info='<img class="icon" src="'+icon[1]+'"><img class="process-'+data.id+'" src="process.gif" style="visibility: hidden;margin: 5px 0px;"><div class="title '+state+'">'+data.metrics.title+'</div><div class="level '+state+'">'+getLevel(data)+'</div>';
    return [icon[0], info];
}

function getLevel(data) {
    var level;
    switch(data.deviceType) {
        case "switchBinary":
            level = levels[data.metrics.level]
        break;
        case "sensorMultilevel":
            level = data.metrics.level+" "+data.metrics.scaleTitle;
        break;
        case "switchMultilevel":
            level = data.metrics.level+" %";
            if(data.metrics.level==0) {
                level = levels.down
            }
            else if (data.metrics.level>45 && data.metrics.level<55) {
                level = levels.half;
            }
            else if (data.metrics.level == 99) {
                level = levels.up;
            }
        break;
        case "camera":
            level="";
        break;
    }
    return level;
}

function getIcon(data) {
    if(data.metrics.isFailed) {
        icon="../storage/img/icons/caution.png";
        bg="#ff0000";
        return [bg, icon];
    }
    else {
        if(Object.keys(data.customIcons).length>0) {
            icon=getCustomIcon(data);
        }
        else {
            icon=getStandardIcon(data);
        }
    }
    return icon;
}

function getCustomIcon(data) {
    //var icon="http://"+url+"/smarthome/user/icons/";
    var icon="../user/icons/";
    var bg="#888";
    switch(data.deviceType) {
        case "switchMultilevel":
            if(data.metrics.level==0) {
                icon+=data.customIcons.level.down || data.customIcons.level.off;
                $("."+data.id).css("background-color", "#888");
            }
            else if(data.metrics.level==99) {
                icon+=data.customIcons.level.up || data.customIcons.level.on;
                $("."+data.id).css("background-color", "#fff");
                bg="#fff";
            }
            else {
                icon+=data.customIcons.level.half;
                $("."+data.id).css("background-color", "#fff");
                bg="#fff";
            }
        break;
        case "sensorMultilevel":
        break;
        case "switchBinary": 
            if(data.metrics.level=="off" || data.metrics.level=="0") {
                icon+=data.customIcons.level.off;
                $("."+data.id).css("background-color", "#888");
            }
            else {
                icon+=data.customIcons.level.on;
                $("."+data.id).css("background-color", "#fff");
                bg="#fff";
            }
        break;
    }
    
    return [bg, icon];
}

function getStandardIcon(data) {
    //var icon="http://"+url+"/smarthome/storage/img/icons/"+data.metrics.icon.replace("blinds", "blind");
    var icon="../storage/img/icons/"+data.metrics.icon.replace("blinds", "blind");
    var bg="#888";
    switch(data.deviceType) {
        case "switchMultilevel":
            if(data.metrics.level<10) {
                icon+="-down";
            }
            else if(metrics.level>90) {
                icon+="-up";
            }
            else {
                icon+="-half";
            }
        break;
        case "sensorMultilevel":
        break;
        case "switchBinary": 
            if(data.metrics.level=="off" || data.metrics.level=="0") {
                icon+="-off";
                $("."+data.id).css("background-color", "#888");
            }
            else {
                icon+="-on";
                $("."+data.id).css("background-color", "#fff");
                bg="#fff";
            }
        break;
    }
    return [bg, icon+".png"];
}

function set(device, state, callback) {
    clearInterval(interval);
    console.log(device);
    $(".process-"+device).css("visibility", "visible");
    var apiurl="http://"+user+":"+pass+"@"+url+api+"devices/"+device+"/command/"+state;
        console.log(apiurl);
        $.ajax({
        method: "GET",
        url: apiurl
    }).done(function( msg ) {
        $(".process-"+device).css("visibility", "hidden");
        updateDevices();
        startUpdate();
        callback(msg);
    }).fail(function( jqXHR, textStatus, errorThrown) {
        $(".process-"+device).css("visibility", "hidden");
        $("#error_function").html("GET");
        $("#error_message").html("Request failed: "+errorThrown);
        $("#server_message").html(textStatus);
        $("#user_message").html(user);
        $("#apiurl_message").html(apiurl);
        $( "#dialog-error" ).dialog({
            modal: true,
            width: 700,
            buttons: {
                Ok: function() {
                    $( this ).dialog( "close" );
                    startUpdate();
                }
            }
        });
    });
}

function get(type, sync=false, callback) {
    var apiurl="http://"+user+":"+pass+"@"+url+api+type;
    $.ajax({
        method: "GET",
        url: apiurl,
        async: sync
    }).done(function( msg ) {
        //console.log(msg);
        callback(msg.data);
    }).fail(function( jqXHR, textStatus, errorThrown) {
        clearInterval(interval);
        $("#error_function").html("GET");
        $("#error_message").html("Request failed: "+errorThrown);
        $("#server_message").html(textStatus);
        $("#user_message").html(user);
        $("#apiurl_message").html(apiurl);
        $( "#dialog-error" ).dialog({
            modal: true,
            width: 700,
            buttons: {
                Ok: function() {
                    $( this ).dialog( "close" );
                    startUpdate();
                }
            }
        });
    });
}

function valueInObject(object, val) {
    var ret=false;
    $.each(object, function (key, value) {
        if(value.lastIndexOf(val)>-1) {
            if(value.lastIndexOf(":")>-1) {
                var parts = value.split(":");
                ret = parts[1];
            }
            else {
                ret=true;
            }
        }
    });
    return ret;
}