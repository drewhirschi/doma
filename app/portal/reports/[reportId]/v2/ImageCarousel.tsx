"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { Image, rem } from "@mantine/core";
import React, { useState } from "react";

import { Carousel } from "@mantine/carousel";
import { PexelPhoto } from "../v1/types";

interface IImageCarouselProps {
  images: PexelPhoto[];
}

export function ImageCarousel({ images }: IImageCarouselProps) {
  const [state, setState] = useState();
  return (
    <Carousel
      height={400}
      nextControlIcon={
        <IconArrowRight style={{ width: rem(16), height: rem(16) }} />
      }
      previousControlIcon={
        <IconArrowLeft style={{ width: rem(16), height: rem(16) }} />
      }
    >
      {images.map((image, index) => (
        <Carousel.Slide key={index}>
          <Image src={image.url} alt={image.alt} fit="contain" />
          {/* <img src={image.url} /> */}
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
