#!/opt/local/bin/python

import sys
import pdb
import fileinput

terminalNodeDict = dict() # key=nodeId, value = dictionaryIndex

def parseLine(line, index):
    ''' parse line into pieces
        
        input: "1) Temp <= 82; criterion = 1, statistic = 56.086"
        return { "nodeId":1, "data": "Temp <= 82", "dir": "left", "numIndents": 0 }

        input "  2) Wind <= 6.9; criterion = 0.998, statistic = 12.969"
        return { "nodeId":2, "data":"Wind <= 6.9" "dir": "left", "numIndents" : 2 ] 
    '''
    import re

    myRegex = re.compile('(\s*)(\d+)\)\s(.+);?')    
    termRegex = re.compile('(\s*)(\d+)\)\*')    # regex for terminal nodes
   
    if line.find(')* ') != -1: 
        n = termRegex.search(line)
        indents = len(n.group(1))
        nodeID = int(n.group(2))
        data = None
        dir = "terminal"
        terminalNodeDict[nodeID] = index
    else:
        n = myRegex.search(line)
        indents = len(n.group(1))
        nodeID = int(n.group(2))
        data = n.group(3)
        if data.find("<=") > 0 :
            dir = "left"
        else: 
            dir = "right"

    return { 'nodeID' : nodeID, 'data' : data, "dir": dir, "numIndents": indents, "parent" : None, 'original' : line }

def setParents(dictTree):

    for i in terminalNodeDict:
        setParent(dictTree, terminalNodeDict[i], terminalNodeDict[i] - 1)
        
def setParent(dictTree, indexThis, indexPrevious):
    if dictTree[indexThis]['nodeID'] == 1: 
       return
    
    if (dictTree[indexThis]['numIndents'] - dictTree[indexPrevious]['numIndents']) == 2:
        dictTree[indexThis]['parentNode'] = dictTree[indexPrevious]['nodeID']
        dictTree[indexThis]['parentIndex'] = indexPrevious
        dictTree[indexThis]['data'] = dictTree[indexPrevious]['data']
        setParent(dictTree, indexPrevious, indexPrevious - 1)
    else:
        setParent(dictTree, indexThis, indexPrevious - 1)

def prettyPrint(tree):
    for i in tree:
        print tree[i]['original'],

def prettyPrintList(listTree):
    # reverse the list
    listTree = listTree[::-1]
    print 
    for line in listTree:
        print line,

    print 

def printTerminalPaths(dictTree, tnodes):
    for t in tnodes:
    # create a tree
        try:
            i = terminalNodeDict[t]
        except KeyError, e:
            print "Node " + str(t) + " is not a terminal node."
            continue 
        newTree = list() 
        newTree.append(dictTree[i]['original'])
        parentIndex = dictTree[i]['parentIndex']
        while dictTree[parentIndex]['nodeID'] is not 1:
            newTree.append(dictTree[parentIndex]['original'])
            parentIndex = dictTree[parentIndex]['parentIndex']
       
        newTree.append(dictTree[parentIndex]['original'])
         
        # and pretty print it
        prettyPrintList(newTree)

# main() reads filename from command line
def main(args):

    parsed = dict()
    index = 0
    filename = args[0]
    termNodes = eval(args[1])

    f = open(filename)
    for line in f:
        l = line.strip()
        if not l.strip() or l.startswith('#'):
            continue
        parsed[index] = parseLine(line, index)
        index = index + 1

    setParents(parsed)
    printTerminalPaths(parsed, termNodes )

if __name__ == "__main__":
    main(sys.argv[1:])
