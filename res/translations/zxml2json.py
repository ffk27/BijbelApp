import xml.etree.ElementTree as ET
import re
import json
import argparse
import sys

parser = argparse.ArgumentParser()
parser.add_argument('filename')
parser.add_argument('-m', action='store_true', help='Minify')
args = parser.parse_args()

def readZXML(filename):
    tree = ET.parse(filename)
    root = tree.getroot()

    data = {
        "translation": root.find('INFORMATION').find('title').text,
        "language": root.find('INFORMATION').find('language').text,
        "id": root.find('INFORMATION').find('identifier').text,
        "books": []
    }

    for b in root.findall('BIBLEBOOK'):
        book = {
            "bname": b.get('bname'),
            "bsname": b.get('bsname'),
            "chapters": []
        }
        for ch in b.findall('CHAPTER'):
            verses = []
            for vers in ch.findall('VERS'):
                vnumber = int(vers.attrib['vnumber'])
                verses.append((vnumber, vers.text))
            book['chapters'].append(verses)
        data['books'].append(book)

    return data

def writeJSON(obj):
    f = open(str(args.filename).split('.')[0] + '.json', "w")
    if (args.m):
        f.write(json.dumps(obj, ensure_ascii=False, separators=(',', ':')))
    else:
        f.write(json.dumps(obj, ensure_ascii=False, indent=4))
    f.close()

data = readZXML(args.filename)
writeJSON(data)