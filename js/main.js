$( function() {
    var rooms=get("locations", false, function(data) {
        console.log(data);
        var html="";
        $.each(data, function (key1, room) {
            //console.log(room.title);
            if(room.title!="globalRoom" || (room.title=="globalRoom" && includeGlobalRoom==true)) {
                html+="<h3>"+room.title+"</h3><div>";
                $.each(room.namespaces, function (key2, namespace) {
                    if(namespace.id == "devices_all") {
                        //console.log(namespace);
                        $.each(namespace.params, function (key3, param) {
                            //console.log(param);
                            device=get("devices/"+param.deviceId, false, function(data) {
                                if(valueInObject(data.tags, "RPI.Include")) {
                                    console.log(data);
                                    var info = getDeviceInformation(data);
                                    html+='<div id="'+data.id+'" class="device '+data.deviceType+'" style="background-color: '+info[0]+';">'+info[1]+'</div>';
                                }
                            });
                        });
                    }
                });
                html+="</div>";
            }
        });
        $( "#accordion" ).prepend( html );
        var icons = {
            header: "ui-icon-circle-arrow-e",
            activeHeader: "ui-icon-circle-arrow-s"
        };
        $( "#accordion" ).accordion({
            icons: icons,
            //heightStyle: "fill"
        });
    });
    
    setInterval(function(){
        var update=get("devices?since="+parseInt(((Date.now()-updateInterval)/1000)).toString(), true, function(data) {
            $.each(data.devices, function (key, device) {
                html=getDeviceInformation(device);
                $("#"+device.id).html(html[1]);
            });
        });
    }, updateInterval);
    
    setInterval(function(){
        var currentdate = new Date();
        var date = days[currentdate.getDay()]+", "+currentdate.getDate()+" "+month[(currentdate.getMonth()+1)]+" "+currentdate.getFullYear();
        $("#date").html(date);
        var time = pad(currentdate.getHours(),2)+":"+pad(currentdate.getMinutes(),2)+":"+pad(currentdate.getSeconds(),2);
        $("#time").html(time);
        
    }, 1000);
    
    $(".ui-accordion-header").each(function(i, obj){
        $(this).addClass("accordion-header");
    });
    
    $(".ui-accordion-content").each(function(i, obj){
        $(this).addClass("accordion-background");
    });
    
    $(".device").each(function(i, obj){
        console.log(obj.id);
        jQuery( "#"+obj.id ).on( 'touchstart', function( e ) {
            startLongPress = setTimeout(function() {
                console.log('long press!');
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
                console.log('short press!');
                shortTouch(obj.id);
            }
            didLongPress=false;
        });
        
    });
    
    $("input[type=checkbox]").switchButton({
        width: 100,
        height: 40,
        button_width: 70,
        show_labels : false
    });
});


function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function shortTouch(id) {
    var device = get("devices/"+id, true, function(data) {
        console.log(data);
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
    var device = get("devices/"+id, true, function(data) {
        $("#dialog-"+data.deviceType+"-image").attr("src", $("#"+id).find("img").attr("src"));
        $("#dialog-"+data.deviceType+"-level").html(getLevel(data));
        switch(data.deviceType) {
            case "switchBinary":
                $("input[type=checkbox]").switchButton({
                    width: 100,
                    height: 40,
                    button_width: 50,
                    show_labels : false,
                    checked: data.metrics.level=="on" ? true : false,
                    on_callback: function() {
                        set(data.id, "on", function(data){
                            var result = get("devices/"+id, true, function(data) {
                                icon=getIcon(data);
                                $("#dialog-"+data.deviceType+"-image").attr("src", "http://"+icon[1]);
                            });
                        });
                    },
                    off_callback: function() {
                        set(data.id, "off", function(data){
                            var result = get("devices/"+id, true, function(data) {
                                icon=getIcon(data);
                                $("#dialog-"+data.deviceType+"-image").attr("src", "http://"+icon[1]);
                            });
                        });
                    }
                });
            break;
            case "switchMultilevel":
                $( "#dialog-switchMultilevel-slider" ).slider({
                    orientation: "vertical",
                    range: "min",
                    min: 0,
                    max: 99,
                    value: data.metrics.level,
                    slide: function( event, ui ) {
                        var value = ui.value+" %";
                        if(ui.value==0) {
                            value = levels.down
                        }
                        else if (ui.value>45 && ui.value<55) {
                            value = levels.half;
                        }
                        else if (ui.value == 99) {
                            value = levels.up;
                        }
                        $( "#dialog-switchMultilevel-level" ).html( value );
                    },
                    stop: function(event, ui) {
                        set(id, "exact?level="+ui.value, function(data){
                            var result = get("devices/"+id, true, function(data) {
                                icon=getIcon(data);
                                $("#dialog-"+data.deviceType+"-image").attr("src", "http://"+icon[1]);
                            });
                        });
                    }
                });
            break;
            case "sensorMultilevel":
                var date=new Date(data.updateTime * 1000);
                $("#dialog-"+data.deviceType+"-update").html(pad(date.getHours(),2)+":"+pad(date.getMinutes(),2)+":"+pad(date.getSeconds(),2));
            break;
            case "camera":
                $("#dialog-"+data.deviceType+"-url-image").attr("src", data.metrics.url);
            break;
        }

        $( "#dialog-"+data.deviceType).dialog({
             modal: true,
             title: data.metrics.title,
             width: data.deviceType=="camera" ? 560 : 300
        });
    });

}



function getDeviceInformation(data) {
    var icon = getIcon(data);
    var info='<img class="icon" src="http://'+icon[1]+'"><img id="process-'+data.id+'" src="process.gif" style="visibility: hidden;"><div class="title">'+data.metrics.title+'</div><div class="level">'+getLevel(data)+'</div>';
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
        icon="/smarthome/storage/img/icons/caution.png";
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
    var icon=url+"/smarthome/user/icons/";
    var bg="#eee";
    switch(data.deviceType) {
        case "switchMultilevel":
            if(data.metrics.level==0) {
                icon+=data.customIcons.level.down || data.customIcons.level.off;
                $("#"+data.id).css("background-color", "#eee");
            }
            else if(data.metrics.level==99) {
                icon+=data.customIcons.level.up || data.customIcons.level.on;
                $("#"+data.id).css("background-color", "#fff");
                bg="#fff";
            }
            else {
                icon+=data.customIcons.level.half;
                $("#"+data.id).css("background-color", "#fff");
                bg="#fff";
            }
        break;
        case "sensorMultilevel":
        break;
        case "switchBinary": 
            if(data.metrics.level=="off" || data.metrics.level=="0") {
                icon+=data.customIcons.level.off;
                $("#"+data.id).css("background-color", "#eee");
            }
            else {
                icon+=data.customIcons.level.on;
                $("#"+data.id).css("background-color", "#fff");
                bg="#fff";
            }
        break;
    }
    return [bg, icon];
}

function getStandardIcon(data) {
    var icon=url+"/smarthome/storage/img/icons/"+data.metrics.icon.replace("blinds", "blind");
    var bg="#eee";
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
                $("#"+data.id).css("background-color", "#eee");
            }
            else {
                icon+="-on";
                $("#"+data.id).css("background-color", "#fff");
                bg="#fff";
            }
        break;
    }
    return [bg, icon+".png"];
}

function set(device, state, callback) {
    $("#process-"+device).css("visibility", "visible");
    var apiurl="http://"+user+":"+pass+"@"+url+api+"devices/"+device+"/command/"+state;
        console.log(apiurl);
        $.ajax({
        method: "GET",
        url: apiurl
    }).done(function( msg ) {
            $("#process-"+device).css("visibility", "hidden");
            callback(msg);
    }).fail(function( jqXHR, textStatus ) {
            $("#process-"+device).css("visibility", "hidden");
            alert( "Request failed: " + textStatus );
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
    }).fail(function( jqXHR, textStatus ) {
        alert( "Request failed for User: " + user );
    });
}

function valueInObject(object, val) {
    var ret=false;
    $.each(object, function (key, value) {
        if(value == val) ret=true;
    });
    return ret;
}