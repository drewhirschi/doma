import "../style/Highlight.css";

import { ActionIcon, MantineProvider, Menu, Popover, Text, rem } from "@mantine/core";
import { IconAdjustments, IconNote, IconTrash } from "@tabler/icons-react";
import React, { Component } from "react";

import type { LTWHP } from "../types.js";
import { theme } from "../../../../theme";

interface Props {
  position: {
    boundingRect: LTWHP;
    rects: Array<LTWHP>;
  };
  onClick?: () => void;
  onDelete?: () => void;
  onMouseOver?: () => void;
  onMouseOut?: () => void;

  isScrolledTo: boolean;
  isUserHighlight: boolean;
  text: string
  extractorName: string
  offset: number
  setFocusedHighlightId: () => void
}

export class Highlight extends Component<Props> {
  render() {
    const {
      position,
      onClick,
      onDelete,
      onMouseOver,
      onMouseOut,
      isScrolledTo,
      isUserHighlight,
      text,
      extractorName,
      offset, setFocusedHighlightId
    } = this.props;

    const { rects, boundingRect } = position;

    return (
      <MantineProvider theme={theme}>

        <div
          className={`Highlight ${isScrolledTo ? "Highlight--scrolledTo" : ""}`}
        >
          <Menu width={200} position="bottom" withArrow shadow="md">
            <Menu.Target>
              <ActionIcon 
              onClick={setFocusedHighlightId}
              variant="subtle" aria-label="Settings" style={{ top: boundingRect.top + offset, }}
              >
                <IconNote style={{ width: '70%', height: '70%' }} stroke={1.5} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Text size="xs">
                {/* top: {position.boundingRect.top}<br/>
              bottom: {position.boundingRect.top+ position.boundingRect.height}<br/>
              left: {position.boundingRect.left}<br/>
              right: {position.boundingRect.left + position.boundingRect.width}<br/>
              user highlight: {String(isUserHighlight)}<br/> */}
                {/* {text.substring(0, 20)} */}
                {extractorName}
              </Text>
              <Menu.Item
                color="red"
                leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                onClick={onDelete}

              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

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
