$( function() {
    var rooms=get("locations", false, function(data) {
        console.log(data);
        var html="";
        var dialog="";
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
                                    var icon = getIcon(data);
                                    /* Dialogs */
                                    switch(data.deviceType) {
                                        case "switchBinary":
                                            dialog='<div id="dialog-'+data.id+'" class="dialog" title="'+data.metrics.title+'"><img src="'+icon[1]+'" id="dialog-image-'+data.id+'" width="50" style="float: left;"><input type="checkbox" id="checkbox-'+data.id+'"></div>';
                                            $( "#accordion" ).after(dialog);
                                            $("#checkbox-"+data.id).slideButton({
                                                state: data.metrics.level,
                                                on: function() {
                                                    set(data.id, "on", function(data){});
                                                },
                                                off: function() {
                                                    set(data.id, "off", function(data){});
                                                }
                                            });
                                        break;
                                        case "sensorMultilevel":
                                            var date=new Date(data.updateTime * 1000);
                                            dialog='<div id="dialog-'+data.id+'" class="dialog" title="'+data.metrics.title+'"><img src="'+icon[1]+'" id="dialog-image-'+data.id+'" width="50"><div id="dialog-sensorMultilevel-metrics" style="float: right;"><div id="dialog-'+data.id+'-level" style="font-size: 50px;font-weight: bold;">'+data.metrics.level+" "+data.metrics.scaleTitle+'</div><div id="dialog-'+data.id+'-update">'+pad(date.getHours(),2)+":"+pad(date.getMinutes(),2)+":"+pad(date.getSeconds(),2)+'</div>';
                                            $( "#accordion" ).after(dialog);
                                        break;
                                        case "switchMultilevel":
                                            dialog='<div id="dialog-'+data.id+'" class="dialog" title="'+data.metrics.title+'"><img src="'+icon[1]+'" id="dialog-image-'+data.id+'" width="50" style="float: left;"><div id="dialog-'+data.id+'-slider" class="slider" style="height:200px;float:left;margin-left: 60px;"></div><div id="dialog-'+data.id+'-level" style="font-size: 20px;font-weight: bold;float: right;width: 100%;text-align: center;">'+getLevel(data)+'</div></div>';
                                            $( "#accordion" ).after(dialog);
                                            $( "#dialog-"+data.id+"-slider" ).slider({
                                                orientation: "vertical",
                                                range: "min",
                                                min: 0,
                                                max: 99,
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
                                                    set(data.id, "exact?level="+ui.value, function(data){});
                                                }
                                            });
                                            
                                        break;
                                        case "camera":
                                            dialog='<div id="dialog-'+data.id+'" class="dialog" title=""><img src="'+icon[1]+'" id="dialog-image-'+data.id+'"></div>';
                                        break;
                                    }
                                    
                                }
                            });
                        });
                        return false;
                    }
                });
                html+="</div>";
            }
        });
        $( "#accordion" ).prepend( html );
        $( "#accordion" ).accordion();
        $(".switchMultilevel-slider").slider();
        $(".ui-slider-handle").css("display", "none");
    });
    
    startUpdate();
    
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
});


function startUpdate() {
    interval=setInterval(function(){
        var update=get("devices?since="+parseInt(((Date.now()-updateInterval)/1000)).toString(), true, function(data) {
            $.each(data.devices, function (key, device) {
                html=getDeviceInformation(device);
                $("#"+device.id).html(html[1]);
                $("#dialog-image-"+device.id).attr("src", getIcon(device)[1]);
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
    }, updateInterval);
}

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
    $( "#dialog-"+id).dialog({
        modal: true,
   });
   $(".ui-dialog-titlebar-close").css("display", "none");
   $(".ui-widget-overlay").click(function(){
       $( "#dialog-"+id).dialog("close");
   });
}



function getDeviceInformation(data) {
    var icon = getIcon(data);
    var info='<img class="icon" src="'+icon[1]+'"><img id="process-'+data.id+'" src="process.gif" style="visibility: hidden;"><div class="title">'+data.metrics.title+'</div><div class="level">'+getLevel(data)+'</div>';
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
        icon="http://"+url+"/smarthome/storage/img/icons/caution.png";
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
    var icon="http://"+url+"/smarthome/user/icons/";
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
    var icon="http://"+url+"/smarthome/storage/img/icons/"+data.metrics.icon.replace("blinds", "blind");
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
    clearInterval(interval);
    $("#process-"+device).css("visibility", "visible");
    var apiurl="http://"+user+":"+pass+"@"+url+api+"devices/"+device+"/command/"+state;
        console.log(apiurl);
        $.ajax({
        method: "GET",
        url: apiurl
    }).done(function( msg ) {
            $("#process-"+device).css("visibility", "hidden");
            startUpdate();
            callback(msg);
    }).fail(function( jqXHR, textStatus ) {
            startUpdate();
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