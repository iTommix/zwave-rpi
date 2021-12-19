# zwave-rpi
Z-Wave UI for Raspberry with 7" Touch Display

Installation:
1) Clone to /opt/z-way-server/htdocs/smarthome/
2) Edit the index.html and give Username and Password for a local User of Z-Wave
3) Point your Chromium-Browser to http://YOUR_IP_OF_ZWAVE:8083/smarthome/zwave-rpi/index.html

There are some Variables:
- includeGlobalRoom: Display ZWay's Global Room or not
- updateInterval: Interval for update the devices in Milliseconds
- longpress: After this Time in Milliseconds the Dialog for a Device will open
- levels, month and days you can translate for your language.

Every Device with the Tag "RPi.Include" is included in their room.

If you have trouble with Icons for some Devices, use custom Icons instead. This works for me.


