import React from 'react';

const GridBackground = () => {
    const gridStyle = {
        height: "100%",
        width: "100%",
        opacity: 0.4,
        backgroundImage: `
            repeating-radial-gradient(circle at 0 0, transparent 0, #ffffff 18px), 
            repeating-linear-gradient(#e0e0ec55, #e0e0ec)
        `,
        backgroundSize: 'cover',
        position: 'absolute',
        zIndex: 1,
    };

    const maskStyle = {
        height: "100%",
        width: "100%",
        backgroundImage: `
            radial-gradient(ellipse farthest-corner at 50% 50%, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)
        `,
        backgroundSize: 'cover',
        position: 'absolute',
        zIndex: 2,
    };

    return (
        <div >
            <div style={gridStyle}></div>
            <div style={maskStyle}></div>
        </div>
    );
};

export default GridBackground;
