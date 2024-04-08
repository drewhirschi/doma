import "../style/Highlight.css";

import { ActionIcon, MantineProvider } from "@mantine/core";
import { IconAdjustments, IconTrash } from "@tabler/icons-react";
import React, { Component } from "react";

import type { LTWHP } from "../types.js";
import { theme } from "../../../../theme";

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
      <MantineProvider theme={theme}>

        <div
          className={`Highlight ${isScrolledTo ? "Highlight--scrolledTo" : ""}`}
        >
          <ActionIcon variant="filled" aria-label="Settings" style={{top: boundingRect.top, }} color="red" onClick={onClick}>
            <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5}  />
          </ActionIcon>
          <div className="Highlight__parts">
            {rects.map((rect, index) => (
              <div
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
                // onClick={onClick}
                key={index}
                style={rect}
                className={`Highlight__part ${isUserHighlight ? "Highlight__part__user" : "Highlight__part__agent"}`}
              />
            ))}
          </div>
        </div>
      </MantineProvider>

    );
  }
}

export default Highlight;
