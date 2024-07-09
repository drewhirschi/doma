import Script from "next/script";

interface IApolloTrackerProps { }

export default function ApolloTracker() {
    return (
        <Script
            id="apollo-tracker"
            src="/scripts/initApollo.js"
            strategy="beforeInteractive" />
    );
}