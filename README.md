# Asynchronous IP2Location Node.js Module

This Node.js module provides a fast and asynchronous lookup of country, region, city, latitude, longitude, ZIP code, time zone, ISP, domain name, connection type, IDD code, area code, weather station code, station name, mcc, mnc, mobile brand, elevation, and usage type from IP address by using IP2Location database. This module uses a file based database available at IP2Location.com. This database simply contains IP blocks as keys, and other information such as country, region, city, latitude, longitude, ZIP code, time zone, ISP, domain name, connection type, IDD code, area code, weather station code, station name, mcc, mnc, mobile brand, elevation, and usage type as values. It supports both IP address in IPv4 and IPv6.

This module can be used in many types of projects such as:

 - select the geographically closest mirror
 - analyze your web server logs to determine the countries of your visitors
 - credit card fraud detection
 - software export controls
 - display native language and currency 
 - prevent password sharing and abuse of service 
 - geotargeting in advertisement

The database will be updated in monthly basis for the greater accuracy. Free sample DB1 database is available at /samples directory or download it from https://www.ip2location.com/developers.htm.

The complete database is available at https://www.ip2location.com under Premium subscription package.

## Dependencies

This library requires IP2Location BIN data file to function. You may download the BIN data file at
* IP2Location LITE BIN Data (Free): https://lite.ip2location.com
* IP2Location Commercial BIN Data (Comprehensive): https://www.ip2location.com


## IPv4 BIN vs IPv6 BIN

Use the IPv4 BIN file if you just need to query IPv4 addresses.
If you query an IPv6 address using the IPv4 BIN, you'll see the IPV6_NOT_SUPPORTED error.

Use the IPv6 BIN file if you need to query BOTH IPv4 and IPv6 addresses.


## Methods

The module itself only exports a single function that is used to initialize the database. The result is a promise that resolves to a database object with the methods below.

Below are the methods supported in this module.

|Method Name|Description|
|---|---|
|get_all|Returns the geolocation information in an object.|
|get_country_short|Returns the country code.|
|get_country_long|Returns the country name.|
|get_region|Returns the region name.|
|get_city|Returns the city name.|
|get_isp|Returns the ISP name.|
|get_latitude|Returns the latitude.|
|get_longitude|Returns the longitude.|
|get_domain|Returns the domain name.|
|get_zipcode|Returns the ZIP code.|
|get_timezone|Returns the time zone.|
|get_netspeed|Returns the net speed.|
|get_iddcode|Returns the IDD code.|
|get_areacode|Returns the area code.|
|get_weatherstationcode|Returns the weather station code.|
|get_weatherstationname|Returns the weather station name.|
|get_mcc|Returns the mobile country code.|
|get_mnc|Returns the mobile network code.|
|get_mobilebrand|Returns the mobile brand.|
|get_elevation|Returns the elevation in meters.|
|get_usagetype|Returns the usage type.|


## Usage

```javascript

var ip2loc = require('./ip2location.js');

ip2loc('./DB8.BIN')
	.then((db) => {
		return db.get_all('8.8.8.8');
	})
	.then(result => {
		console.log(JSON.stringify(result))
		console.log('--------------------------------------------------------------');
	});

```
