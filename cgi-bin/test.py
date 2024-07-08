#!c:/miniconda3/python.exe

import os
import urllib.parse

## print a HTTP content header
print('Content-type: text/plain\n\n')

## get the query string. this gets passed to cgi scripts as the environment
## variable QUERY_STRING
doc_root = os.environ['DOCUMENT_ROOT']

print(os.environ)

print('\nDOCUMENT_ROOT = ' + str(doc_root))

## print ("Content-type: text/html")
## print ("")
## print ("<html><head>")
## print ("")
## print ("</head><body>")
## print ("Python test with imports...")
## print ("</body></html>\r\n\r\n")