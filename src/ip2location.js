const net = require('net');
const fs = require('fs');
const bigInt = require('big-integer');

const version = '8.1.3';

const maxindex = 65536;

const MSG_NOT_SUPPORTED = `This method is not applicable for current IP2Location binary data file. \
Please upgrade your subscription package to install new data file.`;

const country_pos = [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
const region_pos = [0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
const city_pos = [0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
const isp_pos = [0, 0, 3, 0, 5, 0, 7, 5, 7, 0, 8, 0, 9, 0, 9, 0, 9, 0, 9, 7, 9, 0, 9, 7, 9];
const latitude_pos = [0, 0, 0, 0, 0, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
const longitude_pos = [0, 0, 0, 0, 0, 6, 6, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6];
const domain_pos = [0, 0, 0, 0, 0, 0, 0, 6, 8, 0, 9, 0, 10, 0, 10, 0, 10, 0, 10, 8, 10, 0, 10, 8, 10];
const zipcode_pos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 7, 7, 0, 7, 7, 7, 0, 7, 0, 7, 7, 7, 0, 7];
const timezone_pos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 7, 8, 8, 8, 7, 8, 0, 8, 8, 8, 0, 8];
const netspeed_pos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 11, 0, 11, 8, 11, 0, 11, 0, 11, 0, 11];
const iddcode_pos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 12, 0, 12, 0, 12, 9, 12, 0, 12];
const areacode_pos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 13, 0, 13, 0, 13, 10, 13, 0, 13];
const weatherstationcode_pos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 14, 0, 14, 0, 14, 0, 14];
const weatherstationname_pos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 15, 0, 15, 0, 15, 0, 15];
const mcc_pos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 16, 0, 16, 9, 16];
const mnc_pos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 17, 0, 17, 10, 17];
const mobilebrand_pos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 18, 0, 18, 11, 18];
const elevation_pos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 19, 0, 19];
const usagetype_pos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 20];

class Database {
	constructor(fd) {
		this.fd = fd;
		this.binfile = '';
		this.IPv4ColumnSize = 0;
		this.IPv6ColumnSize = 0;
		this.low = 0;
		this.high = 0;
		this.mid = 0;

		this.IndexArrayIPv4 = Array(maxindex);
		this.IndexArrayIPv6 = Array(maxindex);

		this.country_pos_offset = 0;
		this.region_pos_offset = 0;
		this.city_pos_offset = 0;
		this.isp_pos_offset = 0;
		this.domain_pos_offset = 0;
		this.zipcode_pos_offset = 0;
		this.latitude_pos_offset = 0;
		this.longitude_pos_offset = 0;
		this.timezone_pos_offset = 0;
		this.netspeed_pos_offset = 0;
		this.iddcode_pos_offset = 0;
		this.areacode_pos_offset = 0;
		this.weatherstationcode_pos_offset = 0;
		this.weatherstationname_pos_offset = 0;
		this.mcc_pos_offset = 0;
		this.mnc_pos_offset = 0;
		this.mobilebrand_pos_offset = 0;
		this.elevation_pos_offset = 0;
		this.usagetype_pos_offset = 0;

		this.country_enabled = false;
		this.region_enabled = false;
		this.city_enabled = false;
		this.isp_enabled = false;
		this.domain_enabled = false;
		this.zipcode_enabled = false;
		this.latitude_enabled = false;
		this.longitude_enabled = false;
		this.timezone_enabled = false;
		this.netspeed_enabled = false;
		this.iddcode_enabled = false;
		this.areacode_enabled = false;
		this.weatherstationcode_enabled = false;
		this.weatherstationname_enabled = false;
		this.mcc_enabled = false;
		this.mnc_enabled = false;
		this.mobilebrand_enabled = false;
		this.elevation_enabled = false;
		this.usagetype_enabled = false;

		this.mydb = {
			'_DBType': 0,
			'_DBColumn': 0,
			'_DBYear': 0,
			'_DBMonth': 0,
			'_DBDay': 0,
			'_DBCount': 0,
			'_BaseAddr': 0,
			'_DBCountIPv6': 0,
			'_BaseAddrIPv6': 0,
			'_OldBIN': false,
			'_Indexed': false,
			'_IndexedIPv6': false,
			'_IndexBaseAddr': 0,
			'_IndexBaseAddrIPv6': 0
		};
	}

	// Closes the database
	async close() {
		return new Promise((resolve, reject) => {
			fs.close(this.fd, (err) => {
				if (err) return reject(err);
				this.binfile = '';
				this.fd = null;
				resolve();
			});
		});
	}

	// Read binary data from a file
	async readbin(readbytes, pos, readtype, isbigint) {
		const buff = await this.readbuffer(readbytes, pos);
		switch (readtype) {
			case 'int8':
				return buff.readUInt8(0);
			case 'int32':
				return buff.readInt32LE(0);
			case 'uint32':
				return (isbigint) ? bigInt(buff.readUInt32LE(0)) : buff.readUInt32LE(0);
			case 'float':
				return buff.readFloatLE(0);
			case 'str':
				return buff.toString('utf8');
			case 'int128':
				let mybig = bigInt(); // zero
				const bitshift = 8;
				for (let x = 0; x < 16; x++) {
					mybig = mybig.add(bigInt(buff.readUInt8(x)).shiftLeft(bitshift * x));
				}
				return mybig;
		}
	}

	// Reads a part of a file into a buffer
	async readbuffer(readbytes, pos) {
		const buff = Buffer.alloc(readbytes);
		return new Promise((resolve, reject) => {
			fs.read(this.fd, buff, 0, readbytes, pos, (err, totalread) => {
				if (err) return reject(err);
				if (totalread == readbytes) {
					return resolve(buff);
				} else {
					return reject(new Error('Could not read file into buffer'));
				}
			});
		});
	}

	// Read 8 bits integer in the database
	async read8(pos) {
		let readbytes = 1;
		return this.readbin(readbytes, pos - 1, 'int8');
	}

	// Read 32 bits integer in the database
	async read32(pos, isbigint) {
		let readbytes = 4;
		return this.readbin(readbytes, pos - 1, 'uint32', isbigint);
	}

	// Read 32 bits float in the database
	async readfloat(pos) {
		let readbytes = 4;
		return this.readbin(readbytes, pos - 1, 'float');
	}

	async read32or128(pos, iptype) {
		if (iptype == 4) {
			return this.read32(pos, true); // should be bigInt here already
		}
		else if (iptype == 6) {
			return this.read128(pos); // only IPv6 will run this; already returning bigInt object
		}
		else {
			return Promise.resolve(0);
		}
	}

	// Read 128 bits integer in the database
	async read128(pos) {
		let readbytes = 16;
		return this.readbin(readbytes, pos - 1, 'int128'); // returning bigInt object
	}

	// Read strings in the database
	async readstr(pos) {
		let readbytes = 1;
		let p = await this.readbin(readbytes, pos, 'int8');
		return this.readbin(p, pos + 1, 'str');
	}

	// Queries the database
	async query(myIP, iptype) {
		let data = {};
		let low = 0;
		let high = 0;
		let _BaseAddr, _ColumnSize;
		let ipnum;

		if (iptype == 4) { // IPv4
			high = this.mydb._DBCount;
			_BaseAddr = this.mydb._BaseAddr;
			_ColumnSize = this.IPv4ColumnSize;
			ipnum = dot2num(myIP);
			
			if (this.mydb._Indexed) {
				let indexaddr = ipnum >>> 16;
				low = this.IndexArrayIPv4[indexaddr][0];
				high = this.IndexArrayIPv4[indexaddr][1];
			}
		}
		else if (iptype == 6) { // IPv6
			high = this.mydb._DBCountIPv6;
			_BaseAddr = this.mydb._BaseAddrIPv6;
			_ColumnSize = this.IPv6ColumnSize;
			ipnum = ip2no(myIP);
			
			if (this.mydb._IndexedIPv6) {
				let indexaddr = ipnum.shiftRight(112).toJSNumber();
				low = this.IndexArrayIPv6[indexaddr][0];
				high = this.IndexArrayIPv6[indexaddr][1];
			}
		}
		
		data.ip = myIP;
		ipnum = bigInt(ipnum);
		data.ip_no = ipnum.toString();
		
		while (low <= high) {
			let mid = parseInt((low + high) / 2);
			let rowoffset = _BaseAddr + (mid * _ColumnSize)
			let rowoffset2 = rowoffset + _ColumnSize
			
			let ipfrom = await this.read32or128(rowoffset, iptype);
			let ipto = await this.read32or128(rowoffset2, iptype);
			
			ipfrom = bigInt(ipfrom);
			ipto = bigInt(ipto);
			
			if (ipfrom.leq(ipnum) && ipto.gt(ipnum)) {
				for (let key in data) {
					if (/^(ip|ip_no|latitude|longitude|elevation)$/i.test(key) === false) {
						data[key] = MSG_NOT_SUPPORTED;
					}
					else if (/^(ip|ip_no)$/i.test(key) === false) {
						data[key] = 0;
					}
				}
				
				if (iptype == 6) { // IPv6
					rowoffset = rowoffset + 12; // coz below is assuming all columns are 4 bytes, so got 12 left to go to make 16 bytes total
				}
				
				if (this.country_enabled) {
					let pos = await this.read32(rowoffset + this.country_pos_offset);
					data.country_short = await this.readstr(pos);
					data.country_long = await this.readstr(pos + 3);
				}
				if (this.region_enabled) {
					let pos = await this.read32(rowoffset + this.region_pos_offset);
					data.region = await this.readstr(pos);
				}
				if (this.city_enabled) {
					let pos = await this.read32(rowoffset + this.city_pos_offset);
					data.city = await this.readstr(pos);
				}
				if (this.isp_enabled) {
					let pos = await this.read32(rowoffset + this.isp_pos_offset);
					data.isp = await this.readstr(pos);
				}
				if (this.domain_enabled) {
					let pos = await this.read32(rowoffset + this.domain_pos_offset);
					data.domain = await this.readstr(pos);
				}
				if (this.zipcode_enabled) {
					let pos = await this.read32(rowoffset + this.zipcode_pos_offset);
					data.zipcode = await this.readstr(pos);
				}
				if (this.latitude_enabled) {
					let lat = await this.readfloat(rowoffset + this.latitude_pos_offset);
					data.latitude = Math.round(lat * 1000000, 6) / 1000000;
				}
				if (this.longitude_enabled) {
					let lon = await this.readfloat(rowoffset + this.longitude_pos_offset);
					data.longitude = Math.round(lon * 1000000, 6) / 1000000;
				}
				if (this.timezone_enabled) {
					let pos = await this.read32(rowoffset + this.timezone_pos_offset);
					data.timezone = await this.readstr(pos);
				}
				if (this.netspeed_enabled) {
					let pos = await this.read32(rowoffset + this.netspeed_pos_offset);
					data.netspeed = await this.readstr(pos);
				}
				if (this.iddcode_enabled) {
					let pos = await this.read32(rowoffset + this.iddcode_pos_offset);
					data.iddcode = await this.readstr(pos);
				}
				if (this.areacode_enabled) {
					let pos = await this.read32(rowoffset + this.areacode_pos_offset);
					data.areacode = await this.readstr(pos);
				}
				if (this.weatherstationcode_enabled) {
					let pos = await this.read32(rowoffset + this.weatherstationcode_pos_offset);
					data.weatherstationcode = await this.readstr(pos);
				}
				if (this.weatherstationname_enabled) {
					let pos = await this.read32(rowoffset + this.weatherstationname_pos_offset);
					data.weatherstationname = await this.readstr(pos);
				}
				if (this.mcc_enabled) {
					let pos = await this.read32(rowoffset + this.mcc_pos_offset);
					data.mcc = await this.readstr(pos);
				}
				if (this.mnc_enabled) {
					let pos = await this.read32(rowoffset + this.mnc_pos_offset);
					data.mnc = await this.readstr(pos);
				}
				if (this.mobilebrand_enabled) {
					let pos = await this.read32(rowoffset + this.mobilebrand_pos_offset);
					data.mobilebrand = await this.readstr(pos);
				}
				if (this.elevation_enabled) {
					let pos = await this.read32(rowoffset + this.elevation_pos_offset);
					data.elevation = await this.readstr(pos);
				}
				if (this.usagetype_enabled) {
					let pos = await this.read32(rowoffset + this.usagetype_pos_offset);
					data.usagetype = await this.readstr(pos);
				}
				data.status = 'OK';
				return data;
			} else {
				if (ipfrom.gt(ipnum)) {
					high = mid - 1;
				}
				else {
					low = mid + 1;
				}
			}
		}
		data.status = 'IP_ADDRESS_NOT_FOUND';
		return data;
	}

	async get_all(myIP) {		
		if (/^[:0]+:F{4}:(\d+\.){3}\d+$/i.test(myIP)) {
			myIP = myIP.replace(/^[:0]+:F{4}:/i, '');
		}
		else if (/^[:0]+F{4}(:[\dA-Z]{4}){2}$/i.test(myIP)) {
			let tmp = myIP.replace(/^[:0]+F{4}:/i, '');
			tmp = tmp.replace(/:/, '');
			let tmparr = [];
			for (let x = 0; x < 8; x = x + 2) {
				tmparr.push(parseInt('0x' + tmp.substring(x, x + 2)));
			}
			myIP = tmparr.join('.');
		}
		const iptype = net.isIP(myIP);
		
		if (iptype == 0) {
			return {status: 'INVALID_IP_ADDRESS'};
		} else if ((!this.binfile) || (this.binfile == '') || (!await fileExists(this.binfile))) {
			return {status: 'MISSING_FILE'};
		} else if (this.mydb._DBType == 0) {
			return {status: 'RUN_INIT_FIRST'};
		} else if ((iptype == 6) && (this.mydb._OldBIN)) {
			return {status: 'IPV6_NOT_SUPPORTED'};
		} else {
			return await this.query(myIP, iptype);
		}
	}
	
	async get_country_short(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.country_short;
	}
	
	async get_country_long(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.country_long;
	}
	
	async get_region(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.region;
	}
	
	async get_city(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.city;
	}
	
	async get_isp(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.isp;
	}
	
	async get_latitude(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.latitude;
	}
	
	async get_longitude(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.longitude;
	}
	
	async get_domain(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.domain;
	}
	
	async get_zipcode(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.zipcode;
	}
	
	async get_timezone(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.timezone;
	}
	
	async get_netspeed(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.netspeed;
	}
	
	async get_iddcode(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.iddcode;
	}
	
	async get_areacode(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.areacode;
	}
	
	async get_weatherstationcode(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.weatherstationcode;
	}
	
	async get_weatherstationname(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.weatherstationname;
	}
	
	async get_mcc(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.mcc;
	}
	
	async get_mnc(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.mnc;
	}
	
	async get_mobilebrand(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.mobilebrand;
	}
	
	async get_elevation(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.elevation;
	}
	
	async get_usagetype(myIP) {
		let data = await this.IP2Location_get_all(myIP);
		return data.usagetype;
	}
}

// ===========================
// Helper Functions
// ===========================
async function fileExists(file) {
	return new Promise((resolve, reject) => {
		fs.stat(file, (err) => {
			if(err == null) {
				resolve(true);
			} else if(err.code === 'ENOENT') {
					resolve(false);
			} else {
					reject(err);
			}
		});
	});
}

function dot2num(IPv4) {
	const d = IPv4.split('.');
	return ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]);
}

function ip2no(IPv6) {
	const maxsections = 8; // should have 8 sections
	const sectionbits = 16; // 16 bits per section
	const m = IPv6.split('::');
	
	let total = bigInt(); // zero
	
	if (m.length == 2) {
		const myarrleft = (m[0] != '') ? m[0].split(':') : [];
		const myarrright = (m[1] != '') ? m[1].split(':') : [];

		for (let x = 0; x < myarrleft.length; x++) {
			total = total.add(bigInt(parseInt('0x' + myarrleft[x])).shiftLeft((maxsections - (x + 1)) * sectionbits));
		}
		
		for (let x = 0; x < myarrright.length; x++) {
			total = total.add(bigInt(parseInt('0x' + myarrright[x])).shiftLeft((myarrright.length - (x + 1)) * sectionbits));
		}
	} else if (m.length == 1) {
		const myarr = m[0].split(':');
		for (let x = 0; x < myarr.length; x++) {
			total = total.add(bigInt(parseInt('0x' + myarr[x])).shiftLeft((maxsections - (x + 1)) * sectionbits));
		}
	}
	return total;
}

// ===========================
// Initialization Function
// ===========================
module.exports = async function(binfile) {
	if (!binfile || (binfile.length == 0)) {
		throw new Error('No file given');
	}
	// We need to do this outside of the database constructor because it cannot be async
	let fd = await new Promise((resolve, reject) => {
		fs.open(binfile, 'r', (err, fd) => {
			if (err) return reject(err);
			return resolve(fd);
		});
	});

	let db = new Database(fd);
	db.binfile = binfile;

	// Read database info
	let buff = await db.readbuffer(29, 0);
	db.mydb._DBType = buff.readUInt8(0);
	db.mydb._DBColumn = buff.readUInt8(1);
	db.mydb._DBYear = buff.readUInt8(2);
	db.mydb._DBMonth = buff.readUInt8(3);
	db.mydb._DBDay = buff.readUInt8(4);
	db.mydb._DBCount = buff.readUInt32LE(5);
	db.mydb._BaseAddr = buff.readUInt32LE(9);
	db.mydb._DBCountIPv6 = buff.readUInt32LE(13);
	db.mydb._BaseAddrIPv6 = buff.readUInt32LE(17);
	db.mydb._IndexBaseAddr = buff.readUInt32LE(21);
	db.mydb._IndexBaseAddrIPv6 = buff.readUInt32LE(25);

	if (db.mydb._IndexBaseAddr > 0) {
		db.mydb._Indexed = true;
	}
	
	if (db.mydb._DBCountIPv6 == 0) {
		db.mydb._OldBIN = true;
	}
	else if (db.mydb._IndexBaseAddrIPv6 > 0) {
		db.mydb._IndexedIPv6 = true;
	}
	
	db.IPv4ColumnSize = db.mydb._DBColumn << 2; // 4 bytes each column
	db.IPv6ColumnSize = 16 + ((db.mydb._DBColumn - 1) << 2); // 4 bytes each column, except IPFrom column which is 16 bytes
	let dbt = db.mydb._DBType;

	// since both IPv4 and IPv6 use 4 bytes for the below columns, can just do it once here
	db.country_pos_offset = (country_pos[dbt] != 0) ? (country_pos[dbt] - 1) << 2 : 0;
	db.region_pos_offset = (region_pos[dbt] != 0) ? (region_pos[dbt] - 1) << 2 : 0;
	db.city_pos_offset = (city_pos[dbt] != 0) ? (city_pos[dbt] - 1) << 2 : 0;
	db.isp_pos_offset = (isp_pos[dbt] != 0) ? (isp_pos[dbt] - 1) << 2 : 0;
	db.domain_pos_offset = (domain_pos[dbt] != 0) ? (domain_pos[dbt] - 1) << 2 : 0;
	db.zipcode_pos_offset = (zipcode_pos[dbt] != 0) ? (zipcode_pos[dbt] - 1) << 2 : 0;
	db.latitude_pos_offset = (latitude_pos[dbt] != 0) ? (latitude_pos[dbt] - 1) << 2 : 0;
	db.longitude_pos_offset = (longitude_pos[dbt] != 0) ? (longitude_pos[dbt] - 1) << 2 : 0;
	db.timezone_pos_offset = (timezone_pos[dbt] != 0) ? (timezone_pos[dbt] - 1) << 2 : 0;
	db.netspeed_pos_offset = (netspeed_pos[dbt] != 0) ? (netspeed_pos[dbt] - 1) << 2 : 0;
	iddcode_pos_offset = (iddcode_pos[dbt] != 0) ? (iddcode_pos[dbt] - 1) << 2 : 0;
	db.areacode_pos_offset = (areacode_pos[dbt] != 0) ? (areacode_pos[dbt] - 1) << 2 : 0;
	db.weatherstationcode_pos_offset = (weatherstationcode_pos[dbt] != 0) ? (weatherstationcode_pos[dbt] - 1) << 2 : 0;
	db.weatherstationname_pos_offset = (weatherstationname_pos[dbt] != 0) ? (weatherstationname_pos[dbt] - 1) << 2 : 0;
	db.mcc_pos_offset = (mcc_pos[dbt] != 0) ? (mcc_pos[dbt] - 1) << 2 : 0;
	db.mnc_pos_offset = (mnc_pos[dbt] != 0) ? (mnc_pos[dbt] - 1) << 2 : 0;
	db.mobilebrand_pos_offset = (mobilebrand_pos[dbt] != 0) ? (mobilebrand_pos[dbt] - 1) << 2 : 0;
	db.elevation_pos_offset = (elevation_pos[dbt] != 0) ? (elevation_pos[dbt] - 1) << 2 : 0;
	db.usagetype_pos_offset = (usagetype_pos[dbt] != 0) ? (usagetype_pos[dbt] - 1) << 2 : 0;
	
	db.country_enabled = country_pos[dbt] != 0;
	db.region_enabled = region_pos[dbt] != 0;
	db.city_enabled = city_pos[dbt] != 0;
	db.isp_enabled = isp_pos[dbt] != 0;
	db.latitude_enabled = latitude_pos[dbt] != 0;
	db.longitude_enabled = longitude_pos[dbt] != 0;
	db.domain_enabled = domain_pos[dbt] != 0;
	db.zipcode_enabled = zipcode_pos[dbt] != 0;
	db.timezone_enabled = timezone_pos[dbt] != 0;
	db.netspeed_enabled = netspeed_pos[dbt] != 0;
	db.iddcode_enabled = iddcode_pos[dbt] != 0;
	db.areacode_enabled = areacode_pos[dbt] != 0;
	db.weatherstationcode_enabled = weatherstationcode_pos[dbt] != 0;
	db.weatherstationname_enabled = weatherstationname_pos[dbt] != 0;
	db.mcc_enabled = mcc_pos[dbt] != 0;
	db.mnc_enabled = mnc_pos[dbt] != 0;
	db.mobilebrand_enabled = mobilebrand_pos[dbt] != 0;
	db.elevation_enabled = elevation_pos[dbt] != 0;
	db.usagetype_enabled = usagetype_pos[dbt] != 0;

	if (db.mydb._Indexed) {
		let buffer = await db.readbuffer(maxindex * 8 + 8, db.mydb._IndexBaseAddr - 1);

		for (let x = 0; x < maxindex; x++) {
			db.IndexArrayIPv4[x] = Array(2);
			db.IndexArrayIPv4[x][0] = buffer.readUInt32LE(x * 8);
			db.IndexArrayIPv4[x][1] = buffer.readUInt32LE(x * 8 + 4);
		}
		
		if (db.mydb._IndexedIPv6) {
			buffer = await db.readbuffer(maxindex * 8 + 8, db.mydb._IndexBaseAddr + buffer.length - 1);
			for (let x = 0; x < maxindex; x++) {
				db.IndexArrayIPv6[x] = Array(2);
				db.IndexArrayIPv6[x][0] = await db.read32(pointer);
				db.IndexArrayIPv6[x][1] = await db.read32(pointer + 4);
				pointer += 8;
			}
		}
	}
	return db;
}

