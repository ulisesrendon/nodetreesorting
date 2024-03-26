const parseNode = node => {
    const output = [];
    for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            output.push(child.textContent);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            output.push(`<${child.tagName}>`);
            output.push(...parseNode(child));
            output.push(`</${child.tagName}>`);
        }
    }
    return output;
};

window.addEventListener('load', function(){
    this.document.querySelector('#spreadstringform').addEventListener('submit', function(e){
        e.preventDefault();
        console.log(parseNode(this.querySelector("#source")));
    });
});