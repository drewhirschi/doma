export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export const pixel = {

    pageview: () => {
        window.fbq("track", "PageView");
    },
    
    // https://developers.facebook.com/docs/facebook-pixel/advanced/
    event: (name:string, options = {}) => {
        window.fbq("track", name, options);
    },
    FB_PIXEL_ID: "905081251117190",
}

export function objectToXml(obj: any, rootElement: string = 'root'): string {
    let xml = `<${rootElement}>`;

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
            xml += objectToXml(value, key); // Recursive call for nested objects
        } else {
            xml += `<${key}>${value}</${key}>`;
        }
    }

    xml += `</${rootElement}>`;
    return xml;
}