var textNodes = findAllTextNodes(document.body);

var wordsRegex = /(^|\b)[\w]+($|\b)/g;

textNodes.forEach(function(textNode){
	if (textNode.parentNode.localName !== "style" && textNode.parentNode.localName !== "script")
	replaceText(textNode)
});

function replaceText(textNode){
	textNodeReplace(
		textNode,
		wordsRegex,
		function(matched){
			let parts = splitWord(matched);
			return {

				name:'span',
				content:[
					{ name:'span', content:parts[0], attrs:{"class":'thicc'}, },
					{ name:'text', content:parts[1] }
				]
			};
		}
	);
}

// Select the node that will be observed for mutations
const targetNode = document.body;

// Options for the observer (which mutations to observe)
const config = { childList: true, subtree: true, characterData: true};

// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for(const mutation of mutationsList) {
    	mutation.addedNodes.forEach((node) => {
    		node.childNodes.forEach((n) => {
    			if (n.nodeName == "#text") {
					replaceText(n);

    			}	
    		})
    	})

    }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);




function textNodeReplace(node,regex,handler) {
	var mom=node.parentNode, 
		nxt=node.nextSibling,
		doc=node.ownerDocument, 
		hits;
		while(node && (hits=regex.exec(node.nodeValue))){
			regex.lastIndex = 0;
			node = handleResult(
				node, 
				hits, 
				handler.apply(this,hits) 
			);
		}

	function handleResult(node,hits,results){
		console.log(node);
		var orig = node.nodeValue;
		node.nodeValue = orig.slice(0,hits.index);
		// around here I think
		[].concat(create(mom,results)).forEach(function(n){
			mom.insertBefore(n,nxt);
		});
		var rest = orig.slice(hits.index+hits[0].length);
		return rest && mom.insertBefore(doc.createTextNode(rest),nxt);
	}

  function create(el,o){
    if (o.map) return o.map(function(v){ return create(el,v) });
    else if (typeof o==='object') {
	var e = doc.createElementNS(o.namespaceURI || el.namespaceURI,o.name);
	if (o.attrs) for (var a in o.attrs) e.setAttribute(a,o.attrs[a]);
	if (o.content) [].concat(create(e,o.content)).forEach(e.appendChild,e);
	return e;
    } else return doc.createTextNode(o+"");
  }
}
	
	function findAllTextNodes(n){
		var walker = n.ownerDocument.createTreeWalker(n,NodeFilter.SHOW_TEXT);
		var textNodes = [];
		while (walker.nextNode()){
			if (walker.currentNode.parentNode.tagName!='SCRIPT'){
				textNodes.push(walker.currentNode);
			}
		}
		return textNodes;
	}

	function boldElement(element){
		var nodes = element.childNodes;
		nodes.forEach((node, index) => {
			if (node.nodeName === "#text") {
				if (node.nodeValue.trim().length !== 0) {
					toReplace = boldSentences(node.nodeValue);
					console.log(toReplace);
					node.nodeValue = replaceNode(node, toReplace);
				}
			} else {
				boldElement(node);
			}
		});
	}

	function splitWord(text) {
		let toBoldTo = Math.floor(text.length/2);
		return [text.slice(0, toBoldTo), text.slice(toBoldTo)];
	}
//https://jsfiddle.net/DpqGH/8/