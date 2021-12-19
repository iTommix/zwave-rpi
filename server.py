#!/usr/bin/python3
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, unquote
import subprocess, shlex, os
import platform,socket,re,uuid,json,psutil,logging, time
import datetime, vcgencmd

class S(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-type", "text/html")
        self.end_headers()

    def _html(self, message):
        """This just generates an HTML document that includes `message`
        in the body. Override, or re-write this do do more interesting stuff.
        """
        content = f"<html><body><h1>{message}</h1></body></html>"
        return content.encode("utf8")  # NOTE: must return a bytes object!

    def do_GET(self):
        query = urlparse(self.path).query
        if(query):
            if(query.find("action")>-1):
                self._set_headers()
                query_components = dict(qc.split("=") for qc in query.split("&"))
                action = query_components["action"]
                print(action)
                if(action=="backlight"):
                    action="sudo echo 0 > /sys/class/backlight/rpi_backlight/bl_power"
                if(action=="shutdown"):
                    action="shutdown -h now"
                if(action=="zway"):
                    action="service z-way-server restart"
                if(action=="homebridge"):
                    action="service homebridge restart"
                if(action=="sysinfo"):
                    #print(json.dumps(self.getSystemInfo()))
                    self.wfile.write(bytes(json.dumps(self.getSystemInfo()).encode()))
                else:
                    subprocess.Popen([action], shell=True)
                #result = getattr(self, action)(query_components)
                #print(result)
        
        #self._set_headers()
        #self.wfile.write(self._html("hi!"))

    def do_HEAD(self):
        self._set_headers()

    def do_POST(self):
        # Doesn't do anything with posted data
        self._set_headers()
        self.wfile.write(self._html("POST!"))
        
    def getSystemInfo(self):
        try:
            info={}
            info['platform']=platform.system()
            info['platform-release']=platform.release()
            info['platform-version']=platform.version()
            info['architecture']=platform.machine()
            info['hostname']=socket.gethostname()
            info['ip-address']=socket.gethostbyname(socket.gethostname())
            info['mac-address']=':'.join(re.findall('..', '%012x' % uuid.getnode()))
            info['processor']=platform.processor()
            info['ram']=str(self.get_size(psutil.virtual_memory().total))
            info['mem']=str(self.get_size(psutil.virtual_memory().used))+" ("+str(psutil.virtual_memory().percent)+"%)"
            #info['mem-perc']=str(psutil.virtual_memory().percent)+"%"
            info['uptime']=str(datetime.timedelta(seconds=int(time.time()-psutil.boot_time())))
            info['cpu-perc']=str(psutil.cpu_percent(percpu=False, interval=1))+"%"
            info['cpu-temp']=str(vcgencmd.measure_temp())+" °C";
            
            #Services
            stat = os.system('service z-way-server status >/dev/null')
            info['zway-stat']='<img src="green_dot.gif">' if stat==0 else '<img src="red_dot.gif">'
            
            stat = os.system('service homebridge status >/dev/null')
            info['home-stat']='<img src="green_dot.gif">' if stat==0 else '<img src="red_dot.gif">'
            
            stat = os.system('service pilight status >/dev/null')
            info['pilight-stat']='<img src="green_dot.gif">' if stat==0 else '<img src="red_dot.gif">'
            
            return json.dumps(info)
        except Exception as e:
            logging.exception(e)
    
    def get_size(self, bytes, suffix="B"):
        """
        Scale bytes to its proper format
        e.g:
            1253656 => '1.20MB'
            1253656678 => '1.17GB'
        """
        factor = 1024
        for unit in ["", "K", "M", "G", "T", "P"]:
            if bytes < factor:
                return f"{bytes:.2f} {unit}{suffix}"
            bytes /= factor


def run(server_class=HTTPServer, handler_class=S, addr="localhost", port=8000):
    server_address = (addr, port)
    httpd = server_class(server_address, handler_class)

    print(f"Starting httpd server on {addr}:{port}")
    httpd.serve_forever()


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Run a simple HTTP server")
    parser.add_argument(
        "-l",
        "--listen",
        default="localhost",
        help="Specify the IP address on which the server listens",
    )
    parser.add_argument(
        "-p",
        "--port",
        type=int,
        default=8000,
        help="Specify the port on which the server listens",
    )
    args = parser.parse_args()
    run(addr=args.listen, port=args.port)

