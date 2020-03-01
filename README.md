# zwave-rpi
Z-Wave UI for Raspberry with 7" Touch Display

Installation:
1) Download Zip-Archive
2) Decompress the Archive under /opt/z-way-server/htdocs/smarthome/
3) Edit the index.html and give Username and Password for a local User of Z-Wave
4) Point your Chromium-Browser to http://127.0.0.1/smarthome/rpi

There are some Variables:
- includeGlobalRoom: Display ZWay's Global Room or not
- updateInterval: Interval for update the devices in Milliseconds
- longpress: After this Time in Milliseconds the Dialog for a Device will open
- levels, month and days you can translate for language.

Every Device with the Tag "RPi.Include" is included in their room.

If you have trouble with Icons for some Devices, use custom Icons instead. This works for me.