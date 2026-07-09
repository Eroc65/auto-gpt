const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1568624960895168";

export function getMetaPixelInitScript() {
  return `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${META_PIXEL_ID}');
    fbq('track', 'PageView');
  `;
}

function firePixelEvent(eventName, params = {}) {
  if (typeof window === "undefined" || !eventName) return;

  if (typeof window.fbq === "function") {
    window.fbq("track", eventName, params);
  }
}

export function trackEvent(eventName, payload) {
  firePixelEvent(eventName, payload);
}

export function trackIntentClick(eventName, source) {
  firePixelEvent("Lead", {
    content_name: eventName,
    content_category: source,
    source,
  });
}

export function trackLeadConversion(source) {
  firePixelEvent("Lead", { source });
}

