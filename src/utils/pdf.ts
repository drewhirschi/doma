export function rangeToStringWithNewLines(range: Range): { text: string, rects: DOMRect[] } {
    const fragment = range.cloneContents();
    const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    // const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
    let text = '';
    const rects: DOMRect[] = []
    let currentNode: Node | null = walker.currentNode;

    while (currentNode) {
        if (currentNode.nodeType === Node.TEXT_NODE) {
            text += currentNode.textContent;
            if (currentNode.parentElement) rects.push(currentNode.parentElement.getBoundingClientRect())
        } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
            const element = currentNode as Element;
            // rects.push(element.getBoundingClientRect())
            // Check if the element is a block-level element
            if (['DIV', 'P', 'BR'].includes(element.tagName)) {
                text += '\n'; // Add a newline for block-level elements
            }
        }
        currentNode = walker.nextNode();
    }

    return { text, rects };
}