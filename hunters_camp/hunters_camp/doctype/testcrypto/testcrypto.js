
{% include 'hunters_camp/aes.js' %}
{% include 'hunters_camp/mode-cfb.js' %}

cur_frm.cscript.encrypt = function(doc, cdt, cdn) {
	
	// console.log(doc.password)
	var JsonFormatter = {
        stringify: function (cipherParams) {
            // create json object with ciphertext
            var jsonObj = {
                ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)
            };

            // optionally add iv and salt
            if (cipherParams.iv) {
                jsonObj.iv = cipherParams.iv.toString();
            }
            if (cipherParams.salt) {
                jsonObj.s = cipherParams.salt.toString();
            }

            // stringify json object
            return JSON.stringify(jsonObj);
        },

        parse: function (jsonStr) {
            // parse json string
            var jsonObj = JSON.parse(jsonStr);

            // extract ciphertext from json object, and create cipher params object
            var cipherParams = CryptoJS.lib.CipherParams.create({
                ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
            });

            // optionally extract iv and salt
            if (jsonObj.iv) {
                cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv)
            }
            if (jsonObj.s) {
                cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s)
            }

            return cipherParams;
        }
    }


    var key =  CryptoJS.lib.WordArray.random(16);
	var iv  =  CryptoJS.lib.WordArray.random(16);
    encrypted = CryptoJS.AES.encrypt(pad("Secreat Message to Encrypt"), key ,{ iv : iv, mode : CryptoJS.mode.CBC });
	encrypted =encrypted.toString();
    console.log(encrypted)
    encrypted = iv + encrypted;
    encrypted = btoa(encrypted);
    // encrypted = pad(encrypted)
    console.log(encrypted)









	return frappe.call({
		method:"hunters_camp.hunters_camp.doctype.testcrypto.testcrypto.decrypt",
		args:{"encrypt_obj":encrypted ,"key":key , "iv":""},
		callback:function(r){
			console.log(r.message)
			console.log(r.message.de)
			// data = r.message.split(";")
			// msg = CryptoJS.AES.decrypt(r.message, "This is a key123");
			// console.log(msg)
			// console.log(msg.toString(CryptoJS.enc.Utf8))
		}
	});
};


pad =function(s){
	no =  16 - (s.length % 16)
	if (no){	
		letter = "a"
		pad_str = Array(no + 1).join(letter)
		s = s + pad_str
	}
	return s  
}
