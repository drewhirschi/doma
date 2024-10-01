"use client";

import { Box, Flex, SimpleGrid } from "@mantine/core";

export const FrostedGlassSVG = ({ children }: { children: any }) => {
  return (
    <Flex direction={"column"}>
      {/* <SimpleGrid cols={2} py={80} verticalSpacing={40}>

                {[1, 2, 3, 4].map(idx => (

                    <div style={{
                        filter: 'blur(120px)', // Apply strong blur effect
                        WebkitFilter: 'blur(80px)', // Ensure consistency on Safari
                        width: '100%',
                        height: '350px',
                        background: `url('logo.svg') center center no-repeat`,
                        backgroundSize: 'contain',
                        // transform: 'translate(-50px, -50px)' // Move the logo up and to the right
                    }}>
                    </div>
                ))}
            </SimpleGrid> */}

      <Box
        style={{
          zIndex: 3,
          //  position: 'absolute',
          // top: '0',
          // left: '0',
          // right: '0',
          // bottom: '0',
          // display: 'flex',
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </Box>
    </Flex>
  );
};
