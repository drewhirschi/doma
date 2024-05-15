import React, { ReactNode, useState } from "react";

function MouseTracker({ children }: { children: ReactNode }) {
    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

    const handleMouseMove = (event:any) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - bounds.left; // Mouse x relative to the container
        const y = event.clientY - bounds.top; // Mouse y relative to the container
        setCoordinates({ x, y });
    };

    const handleMouseLeave = () => {
        setCoordinates({ x: 0, y: 0 }); // Reset coordinates when mouse leaves the container
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                position: "relative",
                height: "100%",
                // height: "100dvh",

                // width: "500px",
                // height: "300px",
                // border: "1px solid black",
            }}
        >
            <p>
                Mouse coordinates: x: {coordinates.x.toFixed(2)}, y:{" "}
                {coordinates.y.toFixed(2)}
            </p>
            {children}
        </div>
    );
}

export default MouseTracker;
