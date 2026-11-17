// CirculoTransmutacao.tsx

import React from "react";
import { Box } from "@mui/material";
import { motion } from "motion/react";

export const CirculoTransmutacao: React.FC = () => {
  return (
    <Box
      sx={{
        width: { xs: 150, md: 200 },
        aspectRatio: "1",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.svg
        viewBox="0 0 220 220"
        width="100%"
        height="100%"
        animate={{ rotate: 360 }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          filter: "drop-shadow(0 0 12px #5F9C6C)",
        }}
      >
        <circle
          cx="110"
          cy="110"
          r="99"
          stroke="#285C36"
          strokeWidth="2"
          fill="none"
        />

        <circle
          cx="110"
          cy="110"
          r="88"
          stroke="#5F9C6C"
          fill="none"
        />

        <circle
          cx="110"
          cy="110"
          r="65"
          stroke="#285C36"
          strokeWidth="2"
          fill="none"
        />

        <path
          d="M110 24 L184 155 L36 155 Z"
          stroke="#285C36"
          strokeWidth="2"
          fill="none"
        />

        <path
          d="M110 196 L36 65 L184 65 Z"
          stroke="#285C36"
          strokeWidth="2"
          fill="none"
        />

        <circle
          cx="110"
          cy="110"
          r="27"
          stroke="#5F9C6C"
          strokeWidth="2"
          fill="none"
        />

        <circle
          cx="110"
          cy="110"
          r="9"
          fill="#285C36"
        />
      </motion.svg>
    </Box>
  );
};
