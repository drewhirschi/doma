import "../style/Highlight.css";

import React, { Component } from "react";

import type { LTWHP } from "../types.js";

interface Props {
  position: {
    boundingRect: LTWHP;
    rects: Array<LTWHP>;
  };
  onClick?: () => void;
  onMouseOver?: () => void;
  onMouseOut?: () => void;
  
  isScrolledTo: boolean;
  isUserHighlight: boolean;
}

export class Highlight extends Component<Props> {
  render() {
    const {
      position,
      onClick,
      onMouseOver,
      onMouseOut,
      isScrolledTo,
      isUserHighlight,
    } = this.props;

    const { rects, boundingRect } = position;

    return (
      <div
        className={`Highlight ${isScrolledTo ? "Highlight--scrolledTo" : ""}`}
      >
        
        <div className="Highlight__parts">
          {rects.map((rect, index) => (
            <div
              onMouseOver={onMouseOver}
              onMouseOut={onMouseOut}
              onClick={onClick}
              key={index}
              style={rect}
              className={`Highlight__part ${isUserHighlight ? "Highlight__part__user" : "Highlight__part__agent"}`}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default Highlight;
