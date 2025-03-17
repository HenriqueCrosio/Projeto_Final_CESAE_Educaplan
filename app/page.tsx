"use client"

import { motion } from "framer-motion"

export default function AnimatedTitle({
  title = "Educaplan Dept.",
  subtitle = "We are here to help you, so you can help others",
}: {
  title?: string
  subtitle?: string
}) {
  const words = title.split(" ")

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-200 dark:bg-neutral-950">
      <div className="container mx-auto px-4 md:px-6 text-center pb-40">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter mb-4">
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      type: "spring",
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="inline-block text-transparent bg-clip-text 
                               bg-gradient-to-r from-neutral-900 to-neutral-700/80 
                               dark:from-white dark:to-white/80"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="text-xl md:text-2xl text-neutral-700 dark:text-neutral-300"
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

