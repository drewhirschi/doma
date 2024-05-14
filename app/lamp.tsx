"use client"

import { Box, Container, Flex, MantineProvider, Text } from '@mantine/core';

import React from 'react';
import { motion } from 'framer-motion';

export const Lamp = ({ lampColor = '#00FFFF', spread = '50%' }) => {
    const spreadValue = parseInt(spread) / 100;
  
    return (
      <Box
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          backgroundColor: '#0D0D0D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          style={{
            position: 'relative',
            width: '15rem',
            height: '0.5rem',
            backgroundColor: lampColor,
          }}
        >
          <Box
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '200%',
              height: `${spreadValue * 100}vh`,
              backgroundImage: `conic-gradient(from 180deg at top, ${lampColor}, transparent)`,
              filter: 'blur(10px)',
              opacity: 0.7,
            }}
          />
        </Box>
      </Box>
    );
  };

export function LampDemo() {
    return (
        <LampContainer>
            hello world
        </LampContainer>
    );
}

export const LampContainer = ({ children }: { children: any }) => {
    return (
        <Flex
        my={"xl"}
        py={"xl"}
        mih={300}
            direction={"column"}
            style={{
                position: 'relative',
                overflow: 'hidden',
                
                // backgroundColor: '#1A202C',
                width: '100%',
                borderRadius: '0.375rem',
                zIndex: 0,
            }}
        >
            <Container
                style={{
                    position: 'relative',
                    display: 'flex',
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'scaleY(1.25)',
                    zIndex: 0,
                }}
            >
                <motion.div
                    initial={{ opacity: 0.5, width: '15rem' }}
                    whileInView={{ opacity: 1, width: '30rem' }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: 'easeInOut',
                    }}
                    style={{
                        backgroundImage: 'conic-gradient(from 70deg at center top, cyan 0%, transparent 100%)',
                        position: 'absolute',
                        right: '50%',
                        height: '14rem',
                        width: '30rem',
                        overflow: 'visible',
                        color: 'white',
                    }}
                >
                    <Box
                        style={{
                            position: 'absolute',
                            width: '100%',
                            left: 0,
                            backgroundColor: '#1A202C',
                            height: '10rem',
                            bottom: 0,
                            zIndex: 20,
                            maskImage: 'linear-gradient(to top, white, transparent)',
                        }}
                    />
                    <Box
                        style={{
                            position: 'absolute',
                            width: '10rem',
                            height: '100%',
                            left: 0,
                            backgroundColor: '#1A202C',
                            bottom: 0,
                            zIndex: 20,
                            maskImage: 'linear-gradient(to right, white, transparent)',
                        }}
                    />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0.5, width: '15rem' }}
                    whileInView={{ opacity: 1, width: '30rem' }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: 'easeInOut',
                    }}
                    style={{
                        backgroundImage: 'conic-gradient(from 290deg at center top, transparent 0%, cyan 100%)',
                        position: 'absolute',
                        left: '50%',
                        height: '14rem',
                        width: '30rem',
                        overflow: 'visible',
                        color: 'white',
                    }}
                >
                    <Box
                        style={{
                            position: 'absolute',
                            width: '10rem',
                            height: '100%',
                            right: 0,
                            backgroundColor: '#1A202C',
                            bottom: 0,
                            zIndex: 20,
                            maskImage: 'linear-gradient(to left, white, transparent)',
                        }}
                    />
                    <Box
                        style={{
                            position: 'absolute',
                            width: '100%',
                            right: 0,
                            backgroundColor: '#1A202C',
                            height: '10rem',
                            bottom: 0,
                            zIndex: 20,
                            maskImage: 'linear-gradient(to top, white, transparent)',
                        }}
                    />
                </motion.div>
                <Box
                    style={{
                        position: 'absolute',
                        top: '50%',
                        height: '12rem',
                        width: '100%',
                        transform: 'translateY(3rem) scaleX(1.5)',
                        backgroundColor: '#1A202C',
                        filter: 'blur(2rem)',
                    }}
                />
                <Box
                    style={{
                        position: 'absolute',
                        top: '50%',
                        zIndex: 50,
                        height: '12rem',
                        width: '100%',
                        backgroundColor: 'transparent',
                        opacity: 0.1,
                        backdropFilter: 'blur(1rem)',
                    }}
                />
                <Box
                    style={{
                        position: 'absolute',
                        inset: 'auto',
                        zIndex: 50,
                        height: '9rem',
                        width: '28rem',
                        transform: 'translateY(-50%)',
                        borderRadius: '50%',
                        backgroundColor: 'cyan',
                        opacity: 0.5,
                        filter: 'blur(3rem)',
                    }}
                />
                <motion.div
                    initial={{ width: '8rem' }}
                    whileInView={{ width: '16rem' }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: 'easeInOut',
                    }}
                    style={{
                        position: 'absolute',
                        inset: 'auto',
                        zIndex: 30,
                        height: '9rem',
                        width: '16rem',
                        transform: 'translateY(-6rem)',
                        borderRadius: '50%',
                        backgroundColor: 'cyan',
                        filter: 'blur(2rem)',
                    }}
                />
                <motion.div
                    initial={{ width: '15rem' }}
                    whileInView={{ width: '30rem' }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: 'easeInOut',
                    }}
                    style={{
                        position: 'absolute',
                        inset: 'auto',
                        zIndex: 50,
                        height: '0.125rem',
                        width: '30rem',
                        transform: 'translateY(-7rem)',
                        backgroundColor: 'cyan',
                    }}
                />
                <Box
                    style={{
                        position: 'absolute',
                        inset: 'auto',
                        zIndex: 40,
                        height: '11rem',
                        width: '100%',
                        transform: 'translateY(-12.5rem)',
                        backgroundColor: '#1A202C',
                    }}
                />
            </Container>

            <Container
                style={{
                    position: 'relative',
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '0 1.25rem',
                    transform: 'translateY(-20rem)',
                }}
            >
                {children}
            </Container>
        </Flex>
    );
};