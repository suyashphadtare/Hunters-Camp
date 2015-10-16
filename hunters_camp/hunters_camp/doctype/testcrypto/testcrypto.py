# -*- coding: utf-8 -*-
# Copyright (c) 2015, GNU and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from Crypto.Cipher import AES
from Crypto import Random
import json
import base64

class TestCrypto(Document):
	
	def validate(self):
		print self.password





@frappe.whitelist(allow_guest=True)
def decrypt(encrypt_obj, key, iv):
	# frappe.errprint("ADasddssd")
	# frappe.errprint(encrypt_obj)
	# iv = Random.get_random_bytes(16)
	# decryption_suite = AES.new('This is a key123')
	# enc = decryption_suite.decrypt(pad(encrypt_obj[AES.block_size:]))
	# # frappe.errprint(enc)
	# return  base64.b64encode(enc)
	# plain_text = decryption_suite.decrypt(enc)
	# frappe.errprint(plain_text)
	ae = AESCipher(key)
	en_str = ae.encrypt("Secreat Message to Encrypt")
	print str(en_str)
	print "decrypt"
	frappe.errprint(len(encrypt_obj))
	de_str = ae.decrypt(en_str)
	return {"de":de_str}


def pad(s):
	return s + ( 16 - (len(s) % 16) ) * '{'




class AESCipher:
    def __init__(self, key):
        BS = 16
        self.pad = lambda s: s + (BS - len(s) % BS) * "a"
        self.unpad = lambda s : s[0:-ord(s[-1])]
        self.key = self.pad(key[0:16])

    def encrypt(self, raw):
        raw = self.pad(raw)
        iv = "1011121314151617"
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        return base64.b64encode(cipher.encrypt(raw))

    def decrypt(self, enc):
        enc = enc.replace(' ', '+')
        enc = base64.b64decode(enc)
        iv = enc[:16]
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        print dir(cipher)
        print enc
        print cipher.IV
        print cipher.block_size
        # print cipher.decrypt( enc[16:])
        s = cipher.decrypt( enc[16:])
        print s
        return self.unpad(cipher.decrypt( enc[16:]))
        # print self.unpad(base64.b64decode(cipher.decrypt( enc[16:])))
        return  base64.b64decode(cipher.decrypt( enc[16:]))
